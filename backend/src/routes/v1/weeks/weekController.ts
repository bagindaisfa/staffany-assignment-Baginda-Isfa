import { Request, ResponseToolkit } from '@hapi/hapi';
import * as weekUsecase from "../../../usecases/weekUsecase";
import { validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateWeekDto, UpdateWeekDto } from "../../../shared/dtos/week";

// Get week by date
export const getWeekByDate = async (request: Request, h: ResponseToolkit) => {
  try {
    const { date } = request.params;
    
    if (!date) {
      return h.response({ message: 'Date parameter is required' }).code(400);
    }
    
    const weekDate = new Date(date);
    if (isNaN(weekDate.getTime())) {
      return h.response({ message: 'Invalid date format' }).code(400);
    }
    
    const week = await weekUsecase.getOrCreateWeekForDate(weekDate);
    
    if (!week) {
      return h.response({ message: 'Week not found' }).code(404);
    }
    
    return h.response(week).code(200);
  } catch (error) {
    console.error('Error getting week by date:', error);
    return h.response({ message: 'Internal server error' }).code(500);
  }
};

// Publish a week
export const publishWeek = async (request: Request, h: ResponseToolkit) => {
  try {
    const { weekId } = request.params;
    
    if (!weekId) {
      return h.response({ message: 'Week ID is required' }).code(400);
    }
    
    const week = await weekUsecase.publishWeekShifts(weekId);
    
    if (!week) {
      return h.response({ message: 'Week not found' }).code(404);
    }
    
    return h.response({ 
      message: 'Week published successfully',
      weekId: week.id 
    }).code(200);
  } catch (error) {
    console.error('Error publishing week:', error);
    return h.response({ message: 'Internal server error' }).code(500);
  }
};

// Unpublish a week
export const unpublishWeek = async (request: Request, h: ResponseToolkit) => {
  try {
    const { weekId } = request.params;
    
    if (!weekId) {
      return h.response({ message: 'Week ID is required' }).code(400);
    }
    
    const result = await weekUsecase.unpublishWeekShifts(weekId);
    
    return h.response({ 
      message: 'Week unpublished successfully',
      week: result 
    }).code(200);
  } catch (error) {
    console.error('Error unpublishing week:', error);
    return h.response({ message: 'Internal server error' }).code(500);
  }
};

// Check if a date is in a published week
export const checkDatePublished = async (request: Request, h: ResponseToolkit) => {
  try {
    const { date } = request.params;
    
    if (!date) {
      return h.response({ message: 'Date parameter is required' }).code(400);
    }
    
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      return h.response({ message: 'Invalid date format' }).code(400);
    }
    
    const result = await weekUsecase.isWeekPublished(checkDate);
    
    return h.response({ isPublished: result }).code(200);
  } catch (error) {
    console.error('Error checking date publication status:', error);
    return h.response({ message: 'Internal server error' }).code(500);
  }
};
