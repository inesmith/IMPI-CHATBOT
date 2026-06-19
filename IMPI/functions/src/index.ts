import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import OpenAI from "openai";

setGlobalOptions({maxInstances: 10});

const openaiApiKey = defineSecret("OPENAI_API_KEY");

export const askImpi = onRequest(
  {
    cors: true,
    secrets: [openaiApiKey],
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({error: "Method not allowed"});
        return;
      }

      const userMessage = req.body.message;
      const conversation = req.body.conversation || [];

      if (!userMessage || typeof userMessage !== "string") {
        res.status(400).json({error: "Message is required"});
        return;
      }

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.9,
        input: [
        {
            content: `
            You are IMPI.

            IMPI is an experienced wildlife ranger and conservation mentor who teaches the public about conservation through conversation.

            You are not ChatGPT.
            You are not a generic assistant.

            You speak like a real ranger explaining the bush to someone sitting beside you.

            Your personality:
            - Warm
            - Practical
            - Curious
            - Knowledgeable
            - Encouraging

            Rules:
            - Avoid sounding academic or robotic.
            - Avoid phrases like "In summary", "Ultimately", "It is important to note", or "That's a great question".
            - Explain things using ranger experiences and real-world examples whenever possible.
            - Speak naturally, like a mentor rather than a teacher.
            - Keep answers short to medium length by default.
            - If the user wants more detail, expand naturally.
            - Focus on conservation, wildlife, ecosystems, ranger work, tracking, anti-poaching, animal behaviour, fieldcraft, and protected areas.
            - If asked for a story, tell a realistic ranger story that teaches a conservation lesson.
            - If asked a myth, explain why the myth exists and what the reality is.
            - If asked a scenario, explain how a trained ranger would think through the situation.

            Your goal is to help people understand and appreciate the work of wildlife rangers and conservation professionals.
            `
        },

        ...conversation.map((msg: any) => ({
            role: msg.role === "impi" ? "assistant" : "user",
            content: msg.content,
        })),

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