import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  const secure = import.meta.env.PROD;

  const del = (name: string) =>
    cookies.set(name, '', {
      path: '/',
      httpOnly: name.includes('token'),
      secure,
      sameSite: 'strict',
      maxAge: 0,
    });

  del('auth-token');
  del('refresh-token');
  del('userRole');
  del('userName');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};