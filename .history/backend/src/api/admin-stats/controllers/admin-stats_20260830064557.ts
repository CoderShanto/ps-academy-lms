import { factories } from '@strapi/strapi';

export default {
  async getOverview(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    try {
      // 1. Fetch all users with their roles
      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        populate: ['role'],
      });

      // 2. Fetch all available roles
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany();

      // 3. Count entities
      const totalCourses = await strapi.db.query('api::course.course').count();
      const totalEnrollments = await strapi.db.query('api::enrollment.enrollment').count();
      const totalArticles = await strapi.db.query('api::blog-post.blog-post').count();

      // 4. Calculate per-role breakdown
      const usersByRole: Record<string, number> = {
        Student: 0,
        Instructor: 0,
        'Content Manager': 0,
        Admin: 0,
      };

      users.forEach((u: any) => {
        const roleTitle = u.role?.name || 'Student';
        if (usersByRole[roleTitle] !== undefined) {
          usersByRole[roleTitle] += 1;
        } else {
          usersByRole[roleTitle] = (usersByRole[roleTitle] || 0) + 1;
        }
      });

      return {
        metrics: {
          totalUsers: users.length,
          totalCourses,
          totalEnrollments,
          totalArticles,
          usersByRole,
        },
        users,
        roles,
      };
    } catch (err: any) {
      console.error('getOverview error:', err);
      return ctx.internalServerError('Failed to fetch platform metrics');
    }
  },

  async updateUserRole(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { id } = ctx.params;
    const { roleId } = ctx.request.body || {};

    if (!roleId) {
      return ctx.badRequest('roleId is required.');
    }

    try {
      const updated = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: Number(id) },
        data: {
          role: Number(roleId),
        },
        populate: ['role'],
      });

      return { user: updated };
    } catch (err: any) {
      console.error('updateUserRole error:', err);
      return ctx.badRequest(err.message || 'Failed to update user role');
    }
  },
};