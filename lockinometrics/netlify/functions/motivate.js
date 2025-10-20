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
                        "Christina is studying to become an accountant and preparing for her CPA exam. Your job is to acknowledge her feelings and what she accomplished in a relatable, kind way. Make silly accounting referencesand be goofy. Don't be overly inspirational - just be a supportive, slightly silly friend. Keep it to 2-3 sentences max. Mention that Avi is rooting for her too!",
                },
                {
                    role: "user",
                    content: `Christina just finished a ${hours}-hour study session on ${topic}.${description ? ` How she's feeling: "${description}".` : ''} Write a short, relatable response that acknowledges what she's feeling and what she accomplished. Include a silly/funny accounting reference.'`,
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
