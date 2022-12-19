
import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const redis = Redis.fromEnv();
  const email = req.body.email
  const tokens = req.body.tokens

  let current_usage = await redis.get(email)
  if (current_usage == null) {
    current_usage = 0
  }

  const new_usage = current_usage + tokens
  await redis.set(email, new_usage);

  res.status(200)
};

