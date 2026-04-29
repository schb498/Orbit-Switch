import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';

type ErrorResponse = {
  status: 'error';
  message: string;
};

type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    return c.json<InitResponse>({
      type: 'init',
      postId,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    return c.json<ErrorResponse>({ status: 'error', message: 'Initialization failed' }, 400);
  }
});
