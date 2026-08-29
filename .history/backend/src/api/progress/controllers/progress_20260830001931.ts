import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async markComplete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { lessonId, courseId } = ctx.request.body || {};
    if (!lessonId || !courseId) {
      return ctx.badRequest('lessonId and courseId are required.');
    }

    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: user.id,
        lesson: lessonId,
        course: courseId,
      },
    });

    let record;
    if (existing) {
      record = await strapi.db.query('api::progress.progress').update({
        where: { id: existing.id },
        data: { completed: true, completedAt: new Date() },
      });
    } else {
      record = await strapi.db.query('api::progress.progress').create({
        data: {
          student: user.id,
          lesson: lessonId,
          course: courseId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: courseId },
    });

    const completedLessons = await strapi.db.query('api::progress.progress').count({
      where: {
        student: user.id,
        course: courseId,
        completed: true,
      },
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      message: 'Lesson marked complete',
      data: record,
      meta: {
        completedLessons,
        totalLessons,
        percentage,
      },
    };
  },

  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { courseId } = ctx.params;
    const targetStudentId = user.id;

    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: courseId },
    });

    const records = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: targetStudentId,
        course: courseId,
        completed: true,
      },
      populate: ['lesson'],
    });

    const completedLessonIds = records.map((r: any) => r.lesson?.id).filter(Boolean);
    const completedCount = completedLessonIds.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseId: Number(courseId),
      completedLessonIds,
      completedCount,
      totalLessons,
      percentage,
    };
  },
}));