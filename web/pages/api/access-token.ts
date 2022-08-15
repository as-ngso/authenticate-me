import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = req.cookies.__sess;
  res.json({ accessToken });
};

export default handler;
