import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async markComplete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const { lessonId, courseId } = ctx.request.body || {};
      if (!lessonId) {
        return ctx.badRequest('lessonId is required.');
      }

      // Check existing progress using Strapi 5 Document Service or query
      const existingEntries = await strapi.documents('api::progress.progress').findMany({
        filters: {
          student: { id: user.id },
          lesson: {
            $or: [
              { documentId: String(lessonId) },
              ...(isNaN(Number(lessonId)) ? [] : [{ id: Number(lessonId) }]),
            ],
          },
        },
      });

      let record;
      if (existingEntries && existingEntries.length > 0) {
        record = await strapi.documents('api::progress.progress').update({
          documentId: existingEntries[0].documentId,
          data: {
            completed: true,
            completedAt: new Date().toISOString(),
          },
        });
      } else {
        record = await strapi.documents('api::progress.progress').create({
          data: {
            student: user.id,
            lesson: lessonId,
            course: courseId,
            completed: true,
            completedAt: new Date().toISOString(),
          },
        });
      }

      // Count total lessons
      const courseLessons = await strapi.documents('api::lesson.lesson').findMany({
        filters: {
          course: {
            $or: [
              { documentId: String(courseId) },
              ...(isNaN(Number(courseId)) ? [] : [{ id: Number(courseId) }]),
            ],
          },
        },
      });

      const totalLessons = courseLessons.length || 1;

      // Count completed lessons
      const completedProgress = await strapi.documents('api::progress.progress').findMany({
        filters: {
          student: { id: user.id },
          course: {
            $or: [
              { documentId: String(courseId) },
              ...(isNaN(Number(courseId)) ? [] : [{ id: Number(courseId) }]),
            ],
          },
          completed: true,
        },
      });

      const completedLessons = completedProgress.length;
      const percentage = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

      return {
        message: 'Lesson marked complete',
        data: record,
        meta: {
          completedLessons,
          totalLessons,
          percentage,
        },
      };
    } catch (err: any) {
      console.error('CRITICAL markComplete error:', err);
      return ctx.internalServerError(err.message || 'Internal server error');
    }
  },

  async getCourseProgress(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in.');

      const { courseId } = ctx.params;

      const courseLessons = await strapi.documents('api::lesson.lesson').findMany({
        filters: {
          course: {
            $or: [
              { documentId: String(courseId) },
              ...(isNaN(Number(courseId)) ? [] : [{ id: Number(courseId) }]),
            ],
          },
        },
      });

      const totalLessons = courseLessons.length || 1;

      const completedProgress = await strapi.documents('api::progress.progress').findMany({
        filters: {
          student: { id: user.id },
          course: {
            $or: [
              { documentId: String(courseId) },
              ...(isNaN(Number(courseId)) ? [] : [{ id: Number(courseId) }]),
            ],
          },
          completed: true,
        },
        populate: ['lesson'],
      });

      const completedLessonIds = completedProgress
        .map((p: any) => p.lesson?.documentId || p.lesson?.id)
        .filter(Boolean);

      const completedCount = completedLessonIds.length;
      const percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));

      return {
        courseId,
        completedLessonIds,
        completedCount,
        totalLessons,
        percentage,
      };
    } catch (err: any) {
      console.error('CRITICAL getCourseProgress error:', err);
      return ctx.internalServerError(err.message || 'Internal server error');
    }
  },
}));