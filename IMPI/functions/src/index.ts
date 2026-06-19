import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import OpenAI from "openai";

setGlobalOptions({maxInstances: 10});

const openaiApiKey = defineSecret("OPENAI_API_KEY");

const impiSystemPrompt = `
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
- Focus on what rangers actually do, what they go through, conservation realities, wildlife, ecosystems, tracking, anti-poaching, animal behaviour, fieldcraft, community conservation, and protected areas.
- Help the public understand that ranger work is often romanticised, but the reality includes fatigue, risk, responsibility, observation, emotional pressure, teamwork, and difficult conservation choices.

Your goal is to help people understand and appreciate the real work of wildlife rangers and conservation professionals.
`;

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
            role: "system",
            content: impiSystemPrompt,
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

export const generateImpiScenario = onRequest(
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

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.95,
        input: [
          {
            role: "system",
            content: `
You create short educational conservation learning scenarios for IMPI.

IMPI is NOT training future rangers.

IMPI helps the public understand:
- what wildlife rangers actually do
- what rangers experience
- the realities of conservation work
- why conservation is complex
- why ranger work is often misunderstood or romanticised

CRITICAL:
The user is NOT the ranger.
The user is a member of the public learning about conservation.
Do NOT create scenarios that feel like ranger training exercises.

Avoid:
- "What should you do?"
- "What would you do?"
- "What should the ranger do?"
- "What should happen next?"
- "What should the ranger prioritise?"

The purpose is understanding, not training.

Instead, present a realistic conservation situation and ask the user to think about what it reveals about ranger work, conservation, wildlife, ecosystems, or people.

Topics should rotate naturally between:
- Long patrols and isolation
- Ranger wellbeing and mental resilience
- Misconceptions about ranger life
- Human-wildlife conflict
- Ecosystem management
- Wildlife monitoring and research
- Community conservation
- Balancing conservation and local communities
- Difficult ethical decisions
- Habitat protection
- Environmental change
- Teamwork and communication
- Living in remote environments
- The unseen work behind conservation
- Why patience is important in conservation
- Wildlife behaviour
- Conservation challenges
- Emotional realities of ranger work

Examples of good question styles:
- What challenge is the ranger facing?
- What does this situation reveal about conservation work?
- Why might this be difficult?
- What misconception does this challenge?
- Why is this important?
- What lesson can we learn from this situation?
- What part of ranger work does this highlight?
- What conservation challenge is being shown here?

The correct answer should reveal an insight about conservation or ranger life.

Avoid:
- Military-style scenarios
- Police-style scenarios
- Tactical anti-poaching scenarios
- Repetitive "document and report" answers
- Repetitive poaching scenarios
- Repetitive patrol scenarios

Return ONLY valid JSON.

{
  "question": "...",
  "options": [
    "...",
    "...",
    "..."
  ],
  "correctIndex": 0,
  "explanation": "..."
}

Rules:
- Exactly 3 options.
- correctIndex must be 0, 1, or 2.
- Questions must be easy to understand.
- Explanations should feel like they come from an experienced ranger.
- Explanations should be short and practical.
- Every scenario should teach something different.
- The correct answer must vary between A, B and C across different scenarios.
- Arrange the options so the correct answer feels natural, not obvious.
`,
          },
          {
            role: "user",
            content:
              "Generate one new IMPI learning scenario. Randomly choose whether the correct answer is A, B, or C.",
          },
        ],
      });

      const scenario = JSON.parse(response.output_text);

      res.status(200).json(scenario);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "IMPI could not generate a scenario right now.",
      });
    }
  }
);

export const generateImpiMythCard = onRequest(
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

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.95,
        input: [
          {
            role: "system",
            content: `
You create myth vs fact cards for IMPI.

IMPI helps the public understand the real work of wildlife rangers and conservation.

Create cards about:
- Misconceptions about ranger life
- Facts about ranger life
- Conservation myths
- Conservation facts
- Wildlife myths
- Wildlife facts
- Ecosystem misunderstandings
- Ecosystem facts
- Human-wildlife conflict
- Ranger wellbeing
- Long patrols and isolation
- Community conservation
- Wildlife behaviour
- Habitat protection
- The unseen work behind conservation
- Why ranger work is often romanticised
- Why conservation is complex

Do NOT make every card about poaching.
Do NOT make every card about dangerous animals.
Mix ranger myths, wildlife facts, conservation realities and ecosystem learning.

Return ONLY valid JSON.

{
  "statement": "A short myth or fact statement.",
  "answer": "myth",
  "explanation": "A short explanation that teaches the user something useful."
}

Rules:
- answer must be either "myth" or "fact".
- Mix myths and facts naturally.
- Keep the statement short and swipe-card friendly.
- Keep the explanation clear and practical.
- Do not use markdown.
- The answer must vary between "myth" and "fact" across different cards.
- Do not always create myths.
- Sometimes create a true fact statement.
- Sometimes create a false myth statement.
`,
          },
          {
            role: "user",
            content:
            "Generate one IMPI myth or fact card. Randomly choose whether it should be a myth or a fact.",
          },
        ],
      });

      const card = JSON.parse(response.output_text);

      res.status(200).json(card);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "IMPI could not generate a myth card right now.",
      });
    }
  }
);

export const generateImpiStory = onRequest(
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

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        temperature: 0.9,
        input: [
          {
            role: "system",
            content: `
Create one realistic educational ranger story for IMPI.

The story is for the public to understand:
- what rangers actually do
- what rangers go through
- conservation realities
- human-wildlife conflict
- community conservation
- long patrols and isolation
- ranger wellbeing
- ecosystem management
- difficult ethical decisions
- misconceptions about ranger life

The user is NOT the ranger.
This is not ranger training.
It should feel like a field story that teaches the reader something meaningful.

Return ONLY valid JSON.

{
  "id": "short-unique-id",
  "title": "Story title",
  "subtitle": "Short one-line description",
  "chapters": [
    {
      "chapterTitle": "Chapter 1",
      "body": [
        "Paragraph 1",
        "Paragraph 2",
        "Paragraph 3"
      ]
    },
    {
      "chapterTitle": "Chapter 2",
      "body": [
        "Paragraph 1",
        "Paragraph 2",
        "Paragraph 3"
      ]
    }
  ]
}

Rules:
- Create 2 to 4 chapters.
- Each chapter must have 3 to 5 short paragraphs.
- Keep the language public-friendly.
- Make the story realistic, emotional, and educational.
- Do not make every story about poaching.
- Mix topics naturally.
`,
          },
          {
            role: "user",
            content: "Generate one new IMPI ranger story.",
          },
        ],
      });

      const story = JSON.parse(response.output_text);

      res.status(200).json(story);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "IMPI could not generate a story right now.",
      });
    }
  }
);