import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import OpenAI from "openai";

setGlobalOptions({maxInstances: 10});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askImpi = onRequest(
  {cors: true},
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({error: "Method not allowed"});
        return;
      }

      const userMessage = req.body.message;

      if (!userMessage || typeof userMessage !== "string") {
        res.status(400).json({error: "Message is required"});
        return;
      }

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You are IMPI, a friendly conservation mentor for the public. " +
              "Explain ranger work, conservation, ecosystems, animal behaviour, " +
              "and field decision-making in a clear, educational way. " +
              "Keep answers short, warm, and easy to understand.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      res.status(200).json({
        reply: response.output_text,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "IMPI could not answer right now.",
      });
    }
  }
);