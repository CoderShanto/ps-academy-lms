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

    // 1. Resolve lesson internal numeric ID
    let numericLessonId = Number(lessonId);
    let lessonDoc: any = null;
    if (isNaN(numericLessonId)) {
      lessonDoc = await strapi.db.query('api::lesson.lesson').findOne({
        where: { documentId: lessonId },
        populate: ['course'],
      });
      if (lessonDoc) numericLessonId = lessonDoc.id;
    } else {
      lessonDoc = await strapi.db.query('api::lesson.lesson').findOne({
        where: { id: numericLessonId },
        populate: ['course'],
      });
    }

    // 2. Resolve course internal numeric ID
    let numericCourseId = Number(courseId);
    if ((!numericCourseId || isNaN(numericCourseId)) && lessonDoc?.course) {
      numericCourseId = lessonDoc.course.id;
    } else if (isNaN(numericCourseId)) {
      const courseDoc = await strapi.db.query('api::course.course').findOne({
        where: { documentId: courseId },
      });
      if (courseDoc) numericCourseId = courseDoc.id;
    }

    // 3. Look up existing progress entry
    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: user.id,
        lesson: numericLessonId,
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
          lesson: numericLessonId,
          course: numericCourseId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // 4. Calculate total & completed lessons
    const totalLessons = numericCourseId
      ? await strapi.db.query('api::lesson.lesson').count({ where: { course: numericCourseId } })
      : 1;

    const completedLessons = numericCourseId
      ? await strapi.db.query('api::progress.progress').count({
          where: { student: user.id, course: numericCourseId, completed: true },
        })
      : 1;

    const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 100;

    return {
      message: 'Lesson marked complete',
      data: record,
      meta: {
        completedLessons,
        totalLessons,
        percentage,
        lessonId: numericLessonId,
      },
    };
  },

  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { courseId } = ctx.params;
    let numericCourseId = Number(courseId);
    if (isNaN(numericCourseId)) {
      const courseDoc = await strapi.db.query('api::course.course').findOne({
        where: { documentId: courseId },
      });
      if (courseDoc) numericCourseId = courseDoc.id;
    }

    const totalLessons = await strapi.db.query('api::lesson.lesson').count({
      where: { course: numericCourseId },
    });

    const records = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: user.id,
        course: numericCourseId,
        completed: true,
      },
      populate: ['lesson'],
    });

    const completedLessonIds = records
      .map((r: any) => r.lesson?.id || r.lesson?.documentId)
      .filter(Boolean);

    const completedCount = completedLessonIds.length;
    const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    return {
      courseId: numericCourseId,
      completedLessonIds,
      completedCount,
      totalLessons,
      percentage,
    };
  },
}));