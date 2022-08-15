import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  res.setHeader('Set-Cookie', serialize('__sess', '', { maxAge: 0 }));

  const qs = req.url?.split('?')[1];

  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout?${qs}`, {
    method: 'DELETE',
    body: JSON.stringify(req.body),
  });

  return res.status(204);
};

export default handler;
