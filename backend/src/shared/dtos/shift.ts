import Joi from 'joi';

const timeRegex = /([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/;

export const createShiftDto = Joi.object({
  name: Joi.string().required(),
  date: Joi.date().required(),
  startTime: Joi.string().regex(timeRegex).required(),
  endTime:Joi.string().regex(timeRegex).required(),
  ignoreClash: Joi.boolean().default(false)
});

export const updateShiftDto = Joi.object({
  name: Joi.string(),
  date: Joi.date(),
  startTime: Joi.string().regex(timeRegex),
  endTime:Joi.string().regex(timeRegex),
});

export const checkClashShiftDto = Joi.object({
  date: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime:Joi.string().required(),
  excludeShiftId: Joi.string().optional()
});