import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const roleName = (user?.role?.name || user?.role?.type || '').toLowerCase();

    try {
      // 1. Fetch courses with populated lessons
      const courses = await strapi.db.query('api::course.course').findMany({
        populate: ['lessons', 'instructor', 'user'],
      });

      // 2. If Instructor, filter by ownership if owner is tagged; otherwise show assigned
      if (user && roleName.includes('instructor')) {
        const ownedCourses = courses.filter((c: any) => {
          const ownerId = c.instructor?.id || c.user?.id || c.author?.id;
          // If the course has an owner, only show if it belongs to this instructor.
          // If no owner is tagged yet, allow instructor access so they aren't locked out.
          return !ownerId || ownerId === user.id;
        });
        return { data: ownedCourses };
      }

      // 3. Admin, Manager, and Public get all courses
      return { data: courses };
    } catch (err) {
      console.warn('Fallback to standard course find:', err);
      return super.find(ctx);
    }
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { data } = ctx.request.body || {};

    try {
      // Create course and safely tag current user as instructor/user
      const course = await strapi.db.query('api::course.course').create({
        data: {
          ...data,
          instructor: user.id,
          user: user.id,
          publishedAt: data?.publishedAt || new Date().toISOString(),
        },
        populate: ['lessons'],
      });
      return { data: course };
    } catch (err: any) {
      // Fallback if schema doesn't have instructor relation field
      try {
        const fallbackCourse = await strapi.db.query('api::course.course').create({
          data: {
            ...data,
            publishedAt: data?.publishedAt || new Date().toISOString(),
          },
          populate: ['lessons'],
        });
        return { data: fallbackCourse };
      } catch (fallbackErr: any) {
        return ctx.badRequest(fallbackErr.message || 'Failed to create course');
      }
    }
  },

  async update(ctx) {
    return super.update(ctx);
  },

  async delete(ctx) {
    return super.delete(ctx);
  },
}));