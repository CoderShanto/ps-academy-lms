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
  // 1. Fetch only the logged-in student's course progress breakdown
 async getMyProgress(ctx) {
  const user = ctx.state.user;
  if (!user) return ctx.unauthorized('You must be logged in.');

  try {
    // 1. Fetch enrollments
    const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: { student: user.id },
      populate: ['course', 'course.lessons'],
    });

    // 2. Fetch all completed progress for this student (checking both student and user fields)
    const studentProgress = await strapi.db.query('api::progress.progress').findMany({
      where: {
        $or: [
          { student: user.id },
          { user: user.id }
        ],
        completed: true,
      },
      populate: ['lesson'],
    });

    // 3. Collect all forms of completed lesson identifiers
    const completedSet = new Set<string>();
    studentProgress.forEach((p: any) => {
      if (p.lesson?.id) completedSet.add(String(p.lesson.id));
      if (p.lesson?.documentId) completedSet.add(String(p.lesson.documentId));
    });

    // 4. Map enrollments and calculate accurate percentages
    const records = enrollments.map((en: any) => {
      const course = en.course;
      const lessons = course?.lessons || [];
      const totalLessons = lessons.length;

      const completedCount = lessons.filter((l: any) => 
        completedSet.has(String(l.id)) || (l.documentId && completedSet.has(String(l.documentId)))
      ).length;

      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        id: en.id,
        courseId: course?.documentId || course?.id,
        courseTitle: course?.title || 'Untitled Course',
        courseDescription: course?.description || '',
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
        populate: ['student', 'student.role', 'course', 'course.lessons', 'course.instructor'],
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