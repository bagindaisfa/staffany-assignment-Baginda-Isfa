import { Request, ResponseToolkit } from "@hapi/hapi";
import { Between } from "typeorm";
import * as shiftUsecase from "../../../usecases/shiftUsecase";
import { errorHandler } from "../../../shared/functions/error";
import {
  ICreateShift,
  ISuccessResponse,
  IUpdateShift,
} from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";
import {mapShiftResponse} from "../../shiftMapper"

const logger = moduleLogger("shiftController");

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shifts");
  try {
    const { startDate, endDate, ...rest } = req.query as any;
    const where: any = { ...rest };
    
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    const data = await shiftUsecase.find({ where });

    const mapped = data.map(mapShiftResponse);


    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: mapped,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const findById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.findById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info("Create shift");
  try {
    const body = req.payload as ICreateShift;
    const data = await shiftUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Create shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    console.log(error);
    return errorHandler(h, error);
  }
};

export const updateById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Update shift by id");
  try {
    const id = req.params.id;
    const body = req.payload as IUpdateShift;

    const data = await shiftUsecase.updateById(id, body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Update shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    console.log(error);
    return errorHandler(h, error);
  }
};

export const deleteById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Delete shift by id");
  try {
    const { id } = req.params;
    await shiftUsecase.deleteById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Delete shift successful",
      results: { success: true }
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};





export const checkClash = async (req: Request, h: ResponseToolkit) => {
  logger.info("Check shift clash");
  try {
    const { date, startTime, endTime, excludeShiftId } = req.payload as any;
    
    const overlappingShifts = await shiftUsecase.checkClash({
      date,
      startTime,
      endTime,
      excludeShiftId
    });

    const conflictingShift = overlappingShifts.length > 0
      ? mapShiftResponse(overlappingShifts[0])
      : null;

    return h.response({
      hasClash: overlappingShifts.length > 0,
      conflictingShift
    });

  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};
