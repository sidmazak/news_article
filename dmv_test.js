import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-4o-search-preview",
    web_search_options: {},
    messages: [{
        "role": "user",
        "content": "What was a positive news story from today?"
    }],
});

console.log(completion.choices[0].message.content);