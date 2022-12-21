import type { NextApiRequest, NextApiResponse } from "next/types";
import { Configuration, OpenAIApi } from "openai";
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Redis } from '@upstash/redis'

export async function incrementRedis(email: string, tokens: number) {
  const redis = Redis.fromEnv();

  let current_usage: number | null = await redis.get(email)
  if (current_usage == null) {
    current_usage = 0
  }

  const new_usage = current_usage + tokens
  await redis.set(email, new_usage);

  return new_usage
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  if (typeof req.body.prompt !== 'string') {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const prompt = req.body.prompt;
  const joke = await openai.createCompletion({
    model: "text-davinci-002",
    prompt,
    max_tokens: 50,
  })

  const tokens = joke.data.usage?.total_tokens ?? 0
  const email = session.user.email

  const new_usage = await incrementRedis(email, tokens)

  res.status(200).json( { data: joke.data, usage: new_usage } );
}