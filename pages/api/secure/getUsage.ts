import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const redis = Redis.fromEnv();
  const email = session.user?.email ?? ''
  const total_tokens = await redis.get(email)

  res.status(200).json({
    body: {
      email: email,
      total_tokens: total_tokens
    },
  });
}