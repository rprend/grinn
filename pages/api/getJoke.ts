
import type { NextApiResponse } from "next/types";
import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res: NextApiResponse) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const joke = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: "Gives me something here please, a story:",
  });

  console.log(joke.data.choices[0].text);
  res.status(200).json( joke.data );
}