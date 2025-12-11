import { Server } from '@hapi/hapi';
import * as weekController from './weekController';

const register = (server: Server) => {
  // Get week by date
  server.route({
    method: 'GET',
    path: '/by-date/{date}',
    handler: weekController.getWeekByDate,
    options: {
      description: 'Get week by date',
      tags: ['api', 'weeks']
    }
  });

  // Publish a week
  server.route({
    method: 'POST',
    path: '/{weekId}/publish',
    handler: weekController.publishWeek,
    options: {
      description: 'Publish a week',
      tags: ['api', 'weeks']
    }
  });

  // Unpublish a week
  server.route({
    method: 'POST',
    path: '/{weekId}/unpublish',
    handler: weekController.unpublishWeek,
    options: {
      description: 'Unpublish a week',
      tags: ['api', 'weeks']
    }
  });

  // Check if a date is in a published week
  server.route({
    method: 'GET',
    path: '/check-published/{date}',
    handler: weekController.checkDatePublished,
    options: {
      description: 'Check if a date is in a published week',
      tags: ['api', 'weeks']
    }
  });
};

const weekRoutes = {
  name: 'weekRoutes',
  version: '1.0.0',
  register
};

export default weekRoutes;
