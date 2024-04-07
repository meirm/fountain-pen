"use server";

import { OpenAI } from "openai"; // Import OpenAI library

const openai = new OpenAI(); // Initialize OpenAI with your API key

export type outlineResponse = {
    level: string;
    text: string;
    description?: string;
};

// const dummy_data: outlineResponse[] = [
//     {
//         level: "heading",
//         text: "Dummy Heading 1",
//         description: "this is a dummy heading for dev",
//     },
//     {
//         level: "subheading",
//         text: "Dummy Sub-Heading 1",
//         description: "this is a dummy subheading for test",
//     },
//     {
//         level: "heading",
//         text: "Dummy Heading 2",
//         description: "this is a dummy heading 2 for dev",
//     },
//     {
//         level: "subheading",
//         text: "Dummy Sub-Heading 2",
//         description: "this is a dummy heading 2 for dev",
//     },
// ];

// const env = "dev";

export async function generateOutline({
    title,
    titleNotes,
}: {
    title: string | null;
    titleNotes?: string | null;
}): Promise<outlineResponse[] | null> {
    console.log("from generateOutline", title, titleNotes);
    if (!title && !titleNotes) {
        return null;
    }
    const system_prompt = [
        "Develop an outline for an article discussing the topic give by the user.",
        "Incorporate the rough titleNotes (if provided by the user) into your outline.",
        "Consider structuring your outline with an introduction, main sections, supporting points or arguments, and a conclusion.",
        "Aim to create a clear and logical flow of ideas that effectively communicates your message to the reader.",
        "Aim to create headings that cover distinct aspects of the topic that do not overlap with each other",
        "Remember to add conclusion and references headings towards the end of the outline",
        "Respond with an array of objects as JSON array where every object is of the following type \n",
        `[{
            level: string ("heading"),
            text: string,
            description: what to write about in this heading or subheading,
        }, {...}]`,
    ].join(" ");

    const user_prompt: string = [
        `Topic: ${title}`,
        titleNotes ? `Rough titleNotes: ${titleNotes}.` : "",
        "Also suggest more ideas and headings (apart from my titleNotes) that I can write about",
    ].join("\n");

    // console.log(system_prompt, user_prompt);
    let outlineObject = null;
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: system_prompt },
                { role: "user", content: user_prompt },
            ],
            model: "gpt-3.5-turbo",
            // response_format: { type: "json_object" },
        });

        let outlineResponse = completion.choices[0].message.content?.replace(
            /```json\n?|```/g,
            ""
        );
        // console.log(outlineResponse);
        outlineObject = JSON.parse(outlineResponse ? outlineResponse : "[]");
    } catch (e) {
        outlineObject = null;
        console.log(e);
    } finally {
        return outlineObject;
    }
}
