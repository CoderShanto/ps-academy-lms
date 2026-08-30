import { factories } from '@strapi/strapi';

async function handleToggleProgress(ctx: any, strapi: any) {
  const user = ctx.state.user;
  if (!user) return ctx.unauthorized('You must be logged in.');

  const { lessonId } = ctx.request.body || {};
  if (!lessonId) return ctx.badRequest('lessonId is required.');

  const isDocId = typeof lessonId === 'string' && isNaN(Number(lessonId));
  const targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
    where: isDocId ? { documentId: lessonId } : { id: Number(lessonId) },
  });

  if (!targetLesson) return ctx.notFound('Lesson not found.');

  try {
    const existing = await strapi.db.query('api::progress.progress').findOne({
      where: {
        student: user.id,
        lesson: targetLesson.id,
      },
    });

    if (existing) {
      const updated = await strapi.db.query('api::progress.progress').update({
        where: { id: existing.id },
        data: {
          completed: !existing.completed,
        },
      });
      return { completed: updated.completed };
    } else {
      const created = await strapi.db.query('api::progress.progress').create({
        data: {
          student: user.id,
          lesson: targetLesson.id,
          completed: true,
        },
      });
      return { completed: created.completed };
    }
  } catch (err: any) {
    console.error('toggleLessonComplete error:', err);
    return ctx.internalServerError('Failed to toggle lesson progress.');
  }
}

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  // 1. Live overview of all student progress records for Admin / Manager / Instructor
  async getAllStudentProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    try {
      const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
        populate: ['student', 'course', 'course.lessons'],
      });

      const allProgress = await strapi.db.query('api::progress.progress').findMany({
        where: { completed: true },
        populate: ['student', 'lesson'],
      });

      const records = enrollments.map((en: any) => {
        const student = en.student;
        const course = en.course;
        const totalLessons = course?.lessons?.length || 0;

        const courseLessonIds = (course?.lessons || []).map((l: any) => l.id);

        const studentCompleted = allProgress.filter(
          (p: any) => p.student?.id === student?.id && courseLessonIds.includes(p.lesson?.id)
        );

        const completedCount = studentCompleted.length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          id: en.id,
          studentName: student?.username || 'Unknown Student',
          studentEmail: student?.email || 'N/A',
          courseTitle: course?.title || 'Unknown Course',
          courseId: course?.documentId || course?.id,
          completedLessons: completedCount,
          totalLessons: totalLessons,
          progressPercentage,
          enrolledAt: en.createdAt,
        };
      });

      return { data: records };
    } catch (err: any) {
      console.error('getAllStudentProgress error:', err);
      return ctx.internalServerError('Failed to fetch student progress records');
    }
  },

  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { courseId } = ctx.params;
    const isDocId = typeof courseId === 'string' && isNaN(Number(courseId));

    try {
      const course = await strapi.db.query('api::course.course').findOne({
        where: isDocId ? { documentId: courseId } : { id: Number(courseId) },
        populate: ['lessons'],
      });

      if (!course) {
        return ctx.notFound('Course not found');
      }

      const lessonList = course.lessons || [];
      const totalLessons = lessonList.length;
      const lessonIds = lessonList.map((l: any) => l.id);

      if (totalLessons === 0) {
        return {
          completedLessonIds: [],
          totalLessons: 0,
          completedCount: 0,
          progressPercentage: 0,
        };
      }

      const completedProgress = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: user.id,
          lesson: { $in: lessonIds },
          completed: true,
        },
        populate: ['lesson'],
      });

      const completedLessonIds = completedProgress
        .map((p: any) => p.lesson?.documentId || p.lesson?.id)
        .filter(Boolean);
      const completedCount = completedLessonIds.length;
      const progressPercentage = Math.round((completedCount / totalLessons) * 100);

      return {
        completedLessonIds,
        totalLessons,
        completedCount,
        progressPercentage,
      };
    } catch (err: any) {
      console.error('getCourseProgress error:', err);
      return ctx.internalServerError('Failed to calculate course progress.');
    }
  },

  async toggleLessonComplete(ctx) {
    return handleToggleProgress(ctx, strapi);
  },

  async markComplete(ctx) {
    return handleToggleProgress(ctx, strapi);
  },
}));