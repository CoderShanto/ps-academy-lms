import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { data } = ctx.request.body || {};
    const courseId = data?.course;

    if (!courseId) {
      return ctx.badRequest('Course ID is required.');
    }

    const studentId = user.id;

    // Check duplicate
    const existing = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: studentId,
        course: courseId,
      },
    });

    if (existing) {
      return ctx.badRequest('Already enrolled in this course.');
    }

    const newEnrollment = await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: studentId,
        course: courseId,
        enrolledAt: new Date(),
      },
      populate: ['course'],
    });

    return { data: newEnrollment };
  },

  async myCourses(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: {
        student: user.id,
      },
      populate: {
        course: {
          populate: ['lessons', 'instructor'],
        },
      },
    });

    const courses = enrollments.map((e: any) => e.course).filter(Boolean);
    return { data: courses };
  },
}));