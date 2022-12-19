import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redis = Redis.fromEnv();
  const email = req.body.email
  const total_tokens = await redis.get(email)

  res.status(200).json({
    body: {
      email: email,
      total_tokens: total_tokens
    },
  });
}