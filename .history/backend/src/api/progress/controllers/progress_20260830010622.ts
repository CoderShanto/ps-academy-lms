import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async markComplete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { lessonId, courseId } = ctx.request.body || {};
    if (!lessonId) {
      return ctx.badRequest('lessonId is required.');
    }

    // Resolve course internal ID if passed as documentId
    let resolvedCourseId = courseId;
    if (typeof courseId === 'string' && isNaN(Number(courseId))) {
      const foundCourse = await strapi.db.query('api::course.course').findOne({
        where: { documentId: courseId },
      });
      if (foundCourse) resolvedCourseId = foundCourse.id;
    } else {
      resolvedCourseId = Number(courseId);
    }

    // Resolve lesson internal ID if passed as documentId
    let resolvedLessonId = lessonId;
    if (typeof lessonId === 'string' && isNaN(Number(lessonId))) {
      const foundLesson = await strapi.db.query('api::lesson.lesson').findOne({
        where: { documentId: lessonId },
      });
      if (foundLesson) resolvedLessonId = foundLesson.id;
    } else {
      resolvedLessonId = Number(lessonId);
    }

    // Check existing progress
    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: user.id,
        lesson: resolvedLessonId,
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
          lesson: resolvedLessonId,
          course: resolvedCourseId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: resolvedCourseId },
    });

    const completedLessons = await strapi.db.query('api::progress.progress').count({
      where: {
        student: user.id,
        course: resolvedCourseId,
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
    let resolvedCourseId = courseId;
    if (typeof courseId === 'string' && isNaN(Number(courseId))) {
      const foundCourse = await strapi.db.query('api::course.course').findOne({
        where: { documentId: courseId },
      });
      if (foundCourse) resolvedCourseId = foundCourse.id;
    } else {
      resolvedCourseId = Number(courseId);
    }

    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: resolvedCourseId },
    });

    const records = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: user.id,
        course: resolvedCourseId,
        completed: true,
      },
      populate: ['lesson'],
    });

    const completedLessonIds = records.map((r: any) => r.lesson?.id || r.lesson?.documentId).filter(Boolean);
    const completedCount = completedLessonIds.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseId: resolvedCourseId,
      completedLessonIds,
      completedCount,
      totalLessons,
      percentage,
    };
  },
}));