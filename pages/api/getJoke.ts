import type { NextApiRequest, NextApiResponse } from "next/types";
import { Configuration, OpenAIApi } from "openai";
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
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
  });

  res.status(200).json( joke.data );
}