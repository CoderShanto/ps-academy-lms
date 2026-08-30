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

    const articlePayload: Record<string, any> = {
      title,
      content,
      publishedAt: publishedAt !== undefined ? publishedAt : new Date().toISOString(),
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

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to edit articles.');
    }

    const { id } = ctx.params;
    const { data } = ctx.request.body || {};
    const { title, content, publishedAt } = data || {};

    const updatePayload: Record<string, any> = {};
    if (title !== undefined) updatePayload.title = title;
    if (content !== undefined) updatePayload.content = content;
    if (publishedAt !== undefined) updatePayload.publishedAt = publishedAt;

    const isDocId = typeof id === 'string' && isNaN(Number(id));

    try {
      const updated = await strapi.db.query('api::blog-post.blog-post').update({
        where: isDocId ? { documentId: id } : { id: Number(id) },
        data: updatePayload,
      });

      return { data: updated };
    } catch (err: any) {
      console.error('BlogPost update error:', err);
      return ctx.badRequest(err.message || 'Error updating blog post');
    }
  },
}));