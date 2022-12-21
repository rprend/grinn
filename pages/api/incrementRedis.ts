
import { Redis } from '@upstash/redis'
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const redis = Redis.fromEnv();
  const email = session.user?.email ?? 'null'
  const tokens = req.body.tokens

  let current_usage = await redis.get(email)
  if (current_usage == null) {
    current_usage = 0
  }

  const new_usage = current_usage + tokens
  await redis.set(email, new_usage);

  res.status(200)
};

