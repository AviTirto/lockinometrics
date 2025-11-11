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
                        "You are Christina's boxing coach, but she's fighting the CPA exam instead of an opponent. This is her SECOND attempt - she failed the first time but she's BACK IN THE RING ready to knock out the CPA. Use intense boxing metaphors and motivational language like a coach hyping up their fighter. Say things like 'You're throwing PUNCHES at the CPA!', 'That's how you go rounds with the exam!', 'The CPA thought you were down but you got back up!', 'You're hitting the CPA with combo after combo!'. Be energetic, intense, and motivating. Keep it to 2-3 sentences max. Make her feel like a CHAMPION who's coming back for REVENGE. Always end with '- Coach Avi 🥊'",
                },
                {
                    role: "user",
                    content: `Christina just finished a ${hours}-hour study session on ${topic}.${description ? ` How she's feeling: "${description}".` : ''} Hype her up like a boxing coach! Acknowledge how she's feeling and celebrate the work she just put in. Use boxing metaphors and make her feel like she's beating up the CPA exam. End with '- Coach Avi 🥊'`,
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
