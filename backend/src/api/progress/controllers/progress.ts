import { factories } from '@strapi/strapi';

async function handleToggleProgress(ctx: any, strapi: any) {
  const user = ctx.state.user;
  if (!user) return ctx.unauthorized('You must be logged in.');

  const { lessonId } = ctx.request.body || {};
  if (!lessonId) return ctx.badRequest('lessonId is required.');

  try {
    const isDocId = typeof lessonId === 'string' && isNaN(Number(lessonId));
    
    // 1. Target lesson fetch (support both id and documentId)
    const targetLesson = await strapi.db.query('api::lesson.lesson').findOne({
      where: isDocId ? { documentId: lessonId } : { id: Number(lessonId) },
    });

    if (!targetLesson) return ctx.notFound('Lesson not found.');

    // 2. Find existing progress
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
  // 1. Fetch only the logged-in student's course progress breakdown
  async getMyProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    try {
      // 1. Fetch student's enrollments with deep population
      const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
        where: {
          student: user.id,
        },
        populate: {
          course: {
            populate: ['lessons'],
          },
        },
      });

      // Fallback: If no enrollment with 'student', try with 'user' relation
      const finalEnrollments = (enrollments && enrollments.length > 0) 
        ? enrollments 
        : await strapi.db.query('api::enrollment.enrollment').findMany({
            where: { user: user.id },
            populate: {
              course: {
                populate: ['lessons'],
              },
            },
          });

      // 2. Fetch student's completed lessons
      const studentProgress = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: user.id,
          completed: true,
        },
        populate: ['lesson'],
      });

      // 3. Collect completed lesson identifiers in a robust Set
      const completedSet = new Set<string>();
      (studentProgress || []).forEach((p: any) => {
        if (p.lesson?.id) completedSet.add(String(p.lesson.id));
        if (p.lesson?.documentId) completedSet.add(String(p.lesson.documentId));
      });

      // 4. Map enrollments and calculate accurate progress
      const records = (finalEnrollments || [])
        .filter((en: any) => en && en.course)
        .map((en: any) => {
          const course = en.course;
          const lessons = Array.isArray(course.lessons) ? course.lessons : [];
          const totalLessons = lessons.length;

          const completedCount = lessons.filter((l: any) => 
            completedSet.has(String(l.id)) || (l.documentId && completedSet.has(String(l.documentId)))
          ).length;

          const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return {
            id: en.id,
            courseId: course.documentId || course.id,
            courseTitle: course.title || 'Untitled Course',
            courseDescription: course.description || '',
            completedLessons: completedCount,
            totalLessons,
            progressPercentage,
            enrolledAt: en.createdAt,
          };
        });

      return { data: records };
    } catch (err: any) {
      console.error('getMyProgress error:', err);
      return ctx.internalServerError('Failed to load your progress.');
    }
  },

  // 2. Fetch all student progress for Admins / Instructors / Content Managers
  async getAllStudentProgress(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isInstructor = roleName.includes('instructor');

    try {
      const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
        populate: {
          student: { populate: ['role'] },
          course: { populate: ['lessons', 'instructor'] },
        },
      });

      const allProgress = await strapi.db.query('api::progress.progress').findMany({
        where: { completed: true },
        populate: ['student', 'lesson'],
      });

      const validStudentEnrollments = enrollments.filter((en: any) => {
        const studentRole = (en.student?.role?.name || en.student?.role?.type || 'student').toLowerCase();
        return (
          !studentRole.includes('admin') &&
          !studentRole.includes('instructor') &&
          !studentRole.includes('manager') &&
          !studentRole.includes('content')
        );
      });

      const targetEnrollments = isInstructor
        ? validStudentEnrollments.filter((en: any) => {
            const courseOwnerId = en.course?.instructor?.id;
            return courseOwnerId === user.id;
          })
        : validStudentEnrollments;

      const records = targetEnrollments.map((en: any) => {
        const student = en.student;
        const course = en.course;
        const lessons = course?.lessons || [];
        const totalLessons = lessons.length;
        const courseLessonIds = lessons.map((l: any) => String(l.id));
        const courseLessonDocIds = lessons.map((l: any) => String(l.documentId)).filter(Boolean);

        const studentCompleted = allProgress.filter((p: any) => {
          const isStudentMatch = p.student?.id === student?.id;
          const isLessonMatch = 
            courseLessonIds.includes(String(p.lesson?.id)) ||
            courseLessonDocIds.includes(String(p.lesson?.documentId));
          return isStudentMatch && isLessonMatch;
        });

        const completedCount = studentCompleted.length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          id: en.id,
          studentName: student?.username || 'Unknown Student',
          studentEmail: student?.email || 'N/A',
          courseTitle: course?.title || 'Unknown Course',
          courseId: course?.documentId || course?.id,
          completedLessons: completedCount,
          totalLessons,
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

  // 3. Fetch single course progress for student view
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

      if (!course) return ctx.notFound('Course not found');

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
        .map((p: any) => p.lesson?.documentId || String(p.lesson?.id))
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