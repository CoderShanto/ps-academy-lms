import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::enrollment.enrollment',
  ({ strapi }) => ({
    async create(ctx) {
      const { data } = ctx.request.body;

      const studentId = data?.student;
      const courseId = data?.course;

      if (!studentId || !courseId) {
        return ctx.badRequest('Student and course are required.');
      }

      const existingEnrollment = await strapi.db
        .query('api::enrollment.enrollment')
        .findOne({
          where: {
            student: studentId,
            course: courseId,
          },
        });

      if (existingEnrollment) {
        return ctx.badRequest(
          'This student is already enrolled in this course.'
        );
      }

      return await super.create(ctx);
    },
  })
);

