// Local development API endpoint
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, hours, description } = req.body;

    if (!topic || !hours) {
      return res.status(400).json({
        error: 'Missing required fields: topic or hours'
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a hype coach for Christina, a competitive CPA exam candidate who's training to become a CPA. She's an avid runner who loves to win, enjoys going out on weekends, and thrives on competitive energy. Use running and winning metaphors. Be energetic, competitive, and motivating. Keep it to 2-3 sentences max. Reference her weekend fun as a reward for grinding hard during the week.",
        },
        {
          role: "user",
          content: `Christina just finished a ${hours}-hour study session on ${topic}.${description ? ` What she worked on: "${description}".` : ''} Give her a competitive, energetic message that celebrates her win and keeps her fired up!`,
        },
      ],
    });

    const message = completion.choices[0].message.content;

    return res.status(200).json({ topic, hours, message });
  } catch (error) {
    console.error('Motivate error:', error);
    return res.status(500).json({ error: error.message });
  }
}
