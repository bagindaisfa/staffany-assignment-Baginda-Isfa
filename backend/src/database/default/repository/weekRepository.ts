import { getRepository, FindOneOptions, FindOptionsWhere } from "typeorm";
import { format } from "date-fns";
import moduleLogger from "../../../shared/functions/logger";
import Week from "../entity/week";

const logger = moduleLogger("weekRepository");

export const findOne = async (
  where: FindOptionsWhere<Week>,
  opts?: FindOneOptions<Week>
): Promise<Week | undefined> => {
  logger.info("Find one week");
  const repository = getRepository(Week);
  const data = await repository.findOne({
    where,
    ...opts,
  });
  return data || undefined;
};

export const findOrCreateWeekForDate = async (date: Date): Promise<Week> => {
  const repository = getRepository(Week);
  
  // Find existing week that contains this date
  const existingWeek = await repository
    .createQueryBuilder('week')
    .where(':date BETWEEN week.startDate AND week.endDate', { date: format(date, 'yyyy-MM-dd') })
    .getOne();

  if (existingWeek) {
    return existingWeek;
  }

  // If no existing week found, create a new one
  const newWeek = Week.createForDate(date);
  return repository.save(newWeek);
};

export const findWeekWithShifts = async (weekId: string): Promise<Week | undefined> => {
  const repository = getRepository(Week);
  return repository.findOne({
    where: { id: weekId },
    relations: ['shifts']
  });
};

export const publishWeek = async (weekId: string): Promise<Week> => {
  const repository = getRepository(Week);
  const week = await repository.findOneOrFail({ where: { id: weekId } });
  
  if (week.isPublished) {
    throw new Error('Week is already published');
  }
  
  week.isPublished = true;
  week.publishedAt = new Date();
  return repository.save(week);
};

export const unpublishWeek = async (weekId: string): Promise<Week> => {
  const repository = getRepository(Week);
  const week = await repository.findOneOrFail({ where: { id: weekId } });
  
  if (!week.isPublished) {
    throw new Error('Week is not published');
  }
  
  week.isPublished = false;
  week.publishedAt = null;
  return repository.save(week);
};

export const findPublishedWeekForDate = async (date: Date): Promise<Week | undefined> => {
  const repository = getRepository(Week);
  
  return repository
    .createQueryBuilder('week')
    .where(':date BETWEEN week.startDate AND week.endDate', { date: date.toISOString().split('T')[0] })
    .andWhere('week.isPublished = :isPublished', { isPublished: true })
    .getOne();
};

export const findOverlappingShifts = async (shift: {
  date: string;
  startTime: string;
  endTime: string;
  id?: string; // For update operations
}): Promise<any[]> => {
  const repository = getRepository(Week);
  
  // Create a temporary shift to use the helper methods
  const tempShift = new (require('../entity/shift').default)();
  Object.assign(tempShift, {
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime
  });
  
  const shiftStart = tempShift.getStartDateTime();
  const shiftEnd = tempShift.getEndDateTime();
  
  // Find shifts that overlap with the given shift
  const query = repository
    .createQueryBuilder('week')
    .innerJoin('week.shifts', 'shift')
    .where('shift.date = :date', { date: shift.date })
    .andWhere('(shift.startTime < :endTime AND shift.endTime > :startTime)', {
      startTime: shift.startTime,
      endTime: shift.endTime
    });
    
  // Exclude current shift for update operations
  if (shift.id) {
    query.andWhere('shift.id != :id', { id: shift.id });
  }
  
  return query.getMany();
};
