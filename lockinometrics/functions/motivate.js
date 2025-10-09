const OpenAI = require("openai").default;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async function(event) {
    try {
        // Ensure API key exists
        if (!process.env.OPENAI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Missing OpenAI API key" }),
            };
        }


        // Parse request body safely
        let data;
        try {
            data = JSON.parse(event.body);
        } catch {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid JSON input" }),
            };
        }

        const { topic, hours, description } = data;

        // Validate required fields (description is optional)
        if (!topic || !hours) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Missing required fields: topic or hours",
                }),
            };
        }

        // Generate motivational message
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a hype coach for Christina, a competitive CPA exam candidate who's training to become a CPA. She's an avid runner who loves to win, enjoys going out on weekends, and thrives on competitive energy. Use running and winning metaphors. Be energetic, competitive, and motivating. Keep it to 2-3 sentences max. Reference her weekend fun as a reward for grinding hard during the week.",
                },
                {
                    role: "user",
                    content: `Christina just finished a ${hours}-hour study session on ${topic}.${description ? ` What she worked on: "${description}".` : ''} Give her a competitive, energetic message that celebrates her win and keeps her fired up!`,
                },
            ],
        });

        const message = completion.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ topic, hours, message }),
        };


    } catch (error) {
        console.error("Motivate error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
