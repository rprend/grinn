
import type { NextApiRequest, NextApiResponse } from "next/types";
import { Configuration, OpenAIApi } from "openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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