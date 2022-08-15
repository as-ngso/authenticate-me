import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
    {
      method: 'POST',
      body: JSON.stringify(req.body),
    }
  );

  const data = await response.json();

  res.setHeader(
    'Set-Cookie',
    serialize('__sess', data.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365 * 10,
    })
  );

  return res.json(data.user);
};

export default handler;
