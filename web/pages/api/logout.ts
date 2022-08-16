import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  const authorization = req.cookies.__sess;

  if (!authorization) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const qs = req.url?.split('?')[1];

  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout?${qs}`, {
    method: 'DELETE',
    body: JSON.stringify(req.body),
    headers: {
      authorization,
    },
  });

  res.setHeader(
    'Set-Cookie',
    serialize('__sess', '', { maxAge: -1, path: '/' })
  );

  return res.json({ success: true });
};

export default handler;
