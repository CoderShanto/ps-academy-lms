import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to enroll.');
    }

    // Block Admin, Instructor, and Content Manager from enrolling
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    if (roleName.includes('admin') || roleName.includes('instructor') || roleName.includes('manager') || roleName.includes('content')) {
      return ctx.forbidden('Only student accounts are eligible for course enrollment.');
    }

    const { data } = ctx.request.body || {};
    const courseId = data?.course;

    if (!courseId) {
      return ctx.badRequest('course ID is required.');
    }

    const isDocId = typeof courseId === 'string' && isNaN(Number(courseId));
    const course = await strapi.db.query('api::course.course').findOne({
      where: isDocId ? { documentId: courseId } : { id: Number(courseId) },
    });

    if (!course) {
      return ctx.notFound('Course not found.');
    }

    // Check if already enrolled
    const existing = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: user.id,
        course: course.id,
      },
    });

    if (existing) {
      return { data: existing };
    }

    const created = await strapi.db.query('api::enrollment.enrollment').create({
      data: {
        student: user.id,
        course: course.id,
        publishedAt: new Date().toISOString(),
      },
    });

    return { data: created };
  },
}));