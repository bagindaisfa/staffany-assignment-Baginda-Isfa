import {
  getRepository,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  DeleteResult,
} from "typeorm";
import moduleLogger from "../../../shared/functions/logger";
import Shift from "../entity/shift";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

const logger = moduleLogger("shiftRepository");

export const find = async (opts?: FindManyOptions<Shift>): Promise<Shift[]> => {
  logger.info("Find");
  const repository = getRepository(Shift);
  const data = await repository.find(opts);
  return data;
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find by id");
  const repository = getRepository(Shift);
  const data = await repository.findOne({
    where: { id },
    ...opts,
  });
  return data;
};

export const findOne = async (
  where?: FindOptionsWhere<Shift>,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find one");
  const repository = getRepository(Shift);
  const data = await repository.findOne({
    where,
    ...opts,
  });
  return data;
};

export const create = async (payload: any): Promise<Shift> => {
  logger.info("Create");
  try {
    const repository = getRepository(Shift);
  const pyld = {
    name: payload.name,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    weekId: payload.weekId,
  }
  const newdata = await repository.save(pyld);
  return newdata;
  } catch (error) {
    logger.error(error.message);
    console.log(error);
    throw error;
  }
  
};

export const updateById = async (id: string, payload: any): Promise<Shift> => {
  try {
    logger.info("Update by id");
    const repository = getRepository(Shift);
    const data = {
      name: payload.name,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      weekId: payload.weekId,
    };
    await repository.update(id, data);
    return findById(id);
  } catch (error) {
    logger.error(error.message);
    console.log(error);
    throw error;
  }
};

export const deleteById = async (
  id: string | string[]
): Promise<DeleteResult> => {
  logger.info("Delete by id");
  const repository = getRepository(Shift);
  return repository.delete(id);
};

export const findOverlappingShifts = async (
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string
): Promise<Shift[]> => {
  const repo = getRepository(Shift);
  
  // Create date objects in local time
  const newStart = new Date(`${date}T${startTime}`);
  let newEnd = new Date(`${date}T${endTime}`);
  
  // Handle overnight shifts
  if (newEnd <= newStart) {
    newEnd.setDate(newEnd.getDate() + 1);
  }
  
  // Create query builder to get all shifts on the same date
  const qb = repo.createQueryBuilder('shift')
    .where('shift.date = :date', { date });
  
  // Exclude the current shift if provided
  if (excludeShiftId) {
    qb.andWhere('shift.id != :excludeShiftId', { excludeShiftId });
  }
  
  // Get all shifts on the same date
  const shifts = await qb.getMany();
  
  // Filter for overlapping shifts in memory
  return shifts.filter(shift => {
    const shiftStart = new Date(shift.date + 'T' + shift.startTime);
    const shiftEnd = new Date(shift.date + 'T' + shift.endTime);
    
    // Handle overnight shifts for existing shifts
    if (shiftEnd <= shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    
    
    // Check if the shifts overlap
    return shiftStart < newEnd && shiftEnd > newStart;
  });
};


