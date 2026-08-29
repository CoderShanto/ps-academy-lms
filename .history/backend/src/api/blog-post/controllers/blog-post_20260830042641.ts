import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create articles.');
    }

    const { data } = ctx.request.body || {};
    const { title, content, publishedAt } = data || {};

    if (!title || !content) {
      return ctx.badRequest('Title and content are required.');
    }

    // Sanitize payload: strip any invalid relation keys
    const articlePayload: Record<string, any> = {
      title,
      content,
      publishedAt: publishedAt || new Date().toISOString(),
    };

    try {
      const entry = await strapi.db.query('api::blog-post.blog-post').create({
        data: articlePayload,
      });

      return { data: entry };
    } catch (err: any) {
      console.error('BlogPost create error:', err);
      return ctx.badRequest(err.message || 'Error creating blog post');
    }
  },
}));