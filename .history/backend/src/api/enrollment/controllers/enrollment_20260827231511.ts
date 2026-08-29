/**
 * enrollment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::enrollment.enrollment',
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body;

      const { student, course } = data;

      // Check if this student is already enrolled in this course
      const existingEnrollment = await strapi
        .documents('api::enrollment.enrollment')
        .findMany({
          filters: {
            student: {
              id: student,
            },
            course: {
              id: course,
            },
          },
        });

      if (existingEnrollment.length > 0) {
        return ctx.badRequest(
          'This student is already enrolled in this course.'
        );
      }

      // No duplicate found → create enrollment
      return await super.create(ctx);
    },
  })
);