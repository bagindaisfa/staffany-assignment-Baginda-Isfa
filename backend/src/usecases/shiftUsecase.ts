import * as shiftRepository from "../database/default/repository/shiftRepository";
import { FindManyOptions, FindOneOptions } from "typeorm";
import Shift from "../database/default/entity/shift";
import { ICreateShift, IUpdateShift } from "../shared/interfaces";
import { BadRequestError } from "../shared/errors/http.error";

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  return shiftRepository.findById(id, opts);
};

import * as weekRepository from "../database/default/repository/weekRepository";

export const create = async (payload: ICreateShift): Promise<Shift> => {
  try {
    const clashes = await shiftRepository.findOverlappingShifts(
      payload.date,
      payload.startTime,
      payload.endTime
    );

    if (clashes.length > 0 && !payload.ignoreClash) {
      throw new BadRequestError("Shift overlaps with existing shift.");
    }

    const week = await weekRepository.findOrCreateWeekForDate(new Date(payload.date));

    const shift = new Shift();
    shift.name = payload.name;
    shift.date = payload.date;
    shift.startTime = payload.startTime;
    shift.endTime = payload.endTime;
    shift.week = week;
    shift.weekId = week.id;

    return await shiftRepository.create(shift);
  } catch (error) {
    console.log(error);
    throw error;
  }
  
};

export const updateById = async (id: string, payload: IUpdateShift) => {
  const clashes = await shiftRepository.findOverlappingShifts(
    payload.date,
    payload.startTime,
    payload.endTime,
    id // exclude this shift
  );

  if (clashes.length > 0 && !payload.ignoreClash) {
    throw new BadRequestError("Shift overlaps with existing shift.");
  }

  return await shiftRepository.updateById(id, {
    ...payload,
  });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};

export const checkClash = async (shiftData) => {
  const { date, startTime, endTime, excludeShiftId } = shiftData;

  // If week is published → auto no edit allowed (controller will handle)
  const overlapping = await shiftRepository.findOverlappingShifts(
    date,
    startTime,
    endTime,
    excludeShiftId
  );

  return overlapping;
};
