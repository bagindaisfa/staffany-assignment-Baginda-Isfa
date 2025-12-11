import * as weekRepository from "../database/default/repository/weekRepository";
import * as shiftRepository from "../database/default/repository/shiftRepository";
import { FindOneOptions } from "typeorm";
import Week from "../database/default/entity/week";
import { publishWeek, unpublishWeek, findWeekWithShifts, findOrCreateWeekForDate } from "../database/default/repository/weekRepository";

export const findOne = async (
  where: any,
  opts?: FindOneOptions<Week>
): Promise<Week | undefined> => {
  return weekRepository.findOne(where, opts);
};

export const getOrCreateWeekForDate = async (date: Date): Promise<Week> => {
  return findOrCreateWeekForDate(date);
};

export const getWeekWithShifts = async (weekId: string): Promise<Week | undefined> => {
  return findWeekWithShifts(weekId);
};

export const publishWeekShifts = async (weekId: string): Promise<Week> => {
  const week = await findWeekWithShifts(weekId);
  
  if (!week) {
    throw new Error('Week not found');
  }
  
  // Mark all shifts as published
  if (week.shifts) {
    await Promise.all(
      week.shifts.map(shift => 
        shiftRepository.updateById(shift.id, { isPublished: true })
      )
    );
  }
  
  // Mark the week as published
  return publishWeek(weekId);
};

export const unpublishWeekShifts = async (weekId: string): Promise<Week> => {
  const week = await findWeekWithShifts(weekId);
  
  if (!week) {
    throw new Error('Week not found');
  }
  
  // Mark all shifts as unpublished
  if (week.shifts) {
    await Promise.all(
      week.shifts.map(shift => 
        shiftRepository.updateById(shift.id, { isPublished: false })
      )
    );
  }
  
  // Mark the week as unpublished
  return unpublishWeek(weekId);
};

export const checkShiftClash = async (shift: {
  date: string;
  startTime: string;
  endTime: string;
  id?: string; // For update operations
}): Promise<boolean> => {
  const overlappingShifts = await weekRepository.findOverlappingShifts(shift);
  return overlappingShifts.length > 0;
};

export const isWeekPublished = async (date: Date): Promise<boolean> => {
  const week = await weekRepository.findOne({
    startDate: Week.getWeekStartDate(date).toISOString().split('T')[0],
    isPublished: true
  });
  
  return !!week;
};
