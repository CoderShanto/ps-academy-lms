/**
 * enrollment router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::enrollment.enrollment', {
  config: {
    find: {},
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
});