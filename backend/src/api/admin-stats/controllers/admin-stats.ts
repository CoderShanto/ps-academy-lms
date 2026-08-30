import { factories } from '@strapi/strapi';

export default {
  async getOverview(ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    try {
      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        populate: ['role'],
      });

      const roles = await strapi.db.query('plugin::users-permissions.role').findMany();

      const totalCourses = await strapi.db.query('api::course.course').count();
      const totalEnrollments = await strapi.db.query('api::enrollment.enrollment').count();
      const totalArticles = await strapi.db.query('api::blog-post.blog-post').count();

      const usersByRole: Record<string, number> = {
        Student: 0,
        Instructor: 0,
        'Content Manager': 0,
        Admin: 0,
        'No Role / Revoked': 0,
      };

      users.forEach((u: any) => {
        const roleTitle = u.role?.name;
        if (!roleTitle) {
          usersByRole['No Role / Revoked'] += 1;
        } else if (usersByRole[roleTitle] !== undefined) {
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

    try {
      const updated = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: Number(id) },
        data: {
          // If roleId is null or 0, remove the role completely
          role: roleId && Number(roleId) > 0 ? Number(roleId) : null,
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