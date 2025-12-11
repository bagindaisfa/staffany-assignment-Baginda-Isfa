import { Server } from '@hapi/hapi';
import Joi from 'joi';
import * as shiftController from './shiftController';
import { createShiftDto, filterSchema, idDto, updateShiftDto } from '../../../shared/dtos';

export default function (server: Server, basePath: string) {
  server.route({
  method: "GET",
  path: basePath,
  handler: shiftController.find,
  options: {
    description: 'Get shifts with filter',
    notes: 'Get all shifts if filter is not specified.',
    tags: ['api', 'shift'],
    validate: {
      query: Joi.object({
        startDate: Joi.date().iso().description('Start date for filtering (ISO format)'),
        endDate: Joi.date().iso().description('End date for filtering (ISO format)')
      }).unknown(true) // Allow other query parameters
    }
  }
});
  
  server.route({
    method: "GET",
    path: basePath + "/{id}",
    handler: shiftController.findById,
    options: {
      description: 'Get shift by id',
      notes: 'Get shift by id',
      tags: ['api', 'shift'],
      validate: {
        params: idDto
      },
    }
  });
  
  server.route({
    method: "POST",
    path: basePath,
    handler: shiftController.create,
    options: {
      description: 'Create shift',
      notes: 'Create shift',
      tags: ['api', 'shift'],
      validate: {
        payload: createShiftDto
      },
    }
  });
  
  server.route({
    method: "PATCH",
    path: basePath + "/{id}",
    handler: shiftController.updateById,
    options: {
      description: 'Update shift',
      notes: 'Update shift',
      tags: ['api', 'shift'],
      validate: {
        params: idDto,
        payload: updateShiftDto
      },
    }
  });

  server.route({
    method: "DELETE",
    path: basePath + "/{id}",
    handler: shiftController.deleteById,
    options: {
      description: 'Delete shift by id',
      notes: 'Delete shift by id',
      tags: ['api', 'shift'],
      validate: {
        params: idDto
      },
    }
  });

  server.route({
    method: "POST",
    path: basePath + "/check-clash",
    handler: shiftController.checkClash,
    options: {
      description: 'Check for overlapping shifts',
      notes: 'Check if a shift would overlap with existing shifts for the same employee',
      tags: ['api', 'shift'],
      validate: {
        payload: Joi.object({
          date: Joi.string().isoDate().required().description('Date of the shift (YYYY-MM-DD)'),
          startTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required().description('Start time of the shift (HH:MM)'),
          endTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required().description('End time of the shift (HH:MM)'),
          excludeShiftId: Joi.string().optional().description('ID of the shift to exclude from the check (useful for updates)')
        })
      },
    }
  });
}