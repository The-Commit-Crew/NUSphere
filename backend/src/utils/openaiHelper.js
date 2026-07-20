import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

export const generateEmbedding = async (text) => {
  if (process.env.JEST_WORKER_ID) {
    return Array(1536).fill(0.1);
  }
  try {
    const openai = new OpenAI();
    const cleanedText = text.replace(/\n/g, " ");
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanedText,
      encoding_format: "float",
    });
    return embedding.data[0].embedding;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating OpenAI embedding:", error);
    throw new Error("Failed to generate vector embedding", { cause: error });
  }
};

export const evalTopicSubsumption = async (
  newTopicName,
  newTopicDescription,
  existingTopics,
) => {
  if (process.env.JEST_WORKER_ID) {
    if (process.env.MOCK_DUPLICATE_TOPIC_ID) {
      return {
        isDuplicate: true,
        existingTopicId: parseInt(process.env.MOCK_DUPLICATE_TOPIC_ID),
        reason: "Subsumed by existing topic mock.",
      };
    }
    return {
      isDuplicate: false,
      existingTopicId: null,
      reason: "Test bypass",
    };
  }
  try {
    const openai = new OpenAI();

    const SubsumptionSchema = z.object({
      isDuplicate: z.boolean(),
      existingTopicId: z.number().nullable(),
      reason: z.string(),
    });

    const systemPrompt = `
      You are an intelligent community moderator for a forum for the National University of Singapore (NUS). 
      Your goal is to prevent duplicate or highly redundant topics from being created, keeping the forum organized.
      You will receive a list of 'Existing Topics' and a 'Proposed New Topic'.
      
      Determine if the proposed topic is fundamentally the same as, or completely subsumed by, an existing topic.
      For example: "Dorms" is subsumed by "Campus Housing". "CS2040C" is subsumed by "Academics".
      
      You MUST respond with a raw JSON object exactly matching this schema:
      {
        "isDuplicate": boolean,
        "existingTopicId": number | null,
        "reason": "A 1-sentence explanation of your decision, whether duplicate or sumsumption"
      }
    `;
    const userPrompt = `
      Existing Topics:
      ${JSON.stringify(existingTopics, null, 2)}

      Proposed New Topic:
      Name: ${newTopicName},
      Description: ${newTopicDescription}
    `;
    const response = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: zodTextFormat(SubsumptionSchema, "subsumption_eval"),
      },
      temperature: 0.1,
    });
    return response.output_parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error evaluating topic subsumption:", error);
    return {
      isDuplicate: false,
      existingTopicId: null,
      reason: "AI Check Failed",
    };
  }
};
