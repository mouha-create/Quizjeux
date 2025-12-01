import Anthropic from "@anthropic-ai/sdk";
import type { Question, QuestionType, DifficultyLevel } from "@shared/schema";
import { randomUUID } from "crypto";

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

let anthropic: Anthropic | null = null;

try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
} catch (error) {
  console.warn("Anthropic client initialization failed:", error);
}

interface GenerateQuestionsParams {
  topic: string;
  numberOfQuestions: number;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
}

export async function generateQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
  if (!anthropic) {
    throw new Error("Anthropic API key is not configured. Please add your ANTHROPIC_API_KEY to use AI generation.");
  }

  const { topic, numberOfQuestions, difficulty, questionTypes } = params;

  const difficultyGuide = {
    beginner: "simple, straightforward questions suitable for newcomers to the topic",
    intermediate: "moderately challenging questions requiring some knowledge",
    expert: "complex, nuanced questions for those with deep expertise",
  };

  const typeInstructions = questionTypes.map((type) => {
    switch (type) {
      case "multiple":
        return "Multiple choice with 4 options (A, B, C, D)";
      case "truefalse":
        return "True/False questions";
      case "text":
        return "Short answer questions (1-3 words expected)";
      case "ranking":
        return "Ranking/ordering questions with 3-5 items";
      default:
        return "Multiple choice";
    }
  }).join(", ");

  const prompt = `Generate ${numberOfQuestions} quiz questions about "${topic}".

Difficulty level: ${difficulty} - ${difficultyGuide[difficulty]}

Question types to include: ${typeInstructions}

For each question, provide:
1. The question text
2. The question type ("multiple", "truefalse", "text", or "ranking")
3. For multiple choice: 4 options labeled A, B, C, D
4. For true/false: options ["True", "False"]
5. The correct answer (for ranking, provide the correct order as an array)
6. A brief explanation of why the answer is correct

Respond with a JSON object in this exact format:
{
  "questions": [
    {
      "type": "multiple",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Explanation of why this is correct"
    },
    {
      "type": "truefalse",
      "question": "Statement to evaluate?",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Explanation of why this is true"
    }
  ]
}

Make questions engaging, educational, and accurate. Ensure there is variety in the questions and that they cover different aspects of the topic.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4096,
      system: "You are an expert quiz creator who generates engaging, accurate, and educational quiz questions. Always respond with valid JSON only, no additional text.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error("Empty response from AI");
    }

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error(`Unexpected response type: ${content.type}`);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content.text);
    } catch (parseError) {
      console.error("JSON parse error. Raw response:", content.text);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`);
    }

    if (!parsed || !Array.isArray(parsed.questions)) {
      console.error("Invalid response structure. Parsed:", parsed);
      throw new Error("AI response missing 'questions' array");
    }

    const questions: Question[] = parsed.questions.map((q: any, index: number) => {
      if (!q.type || !q.question || !q.options || q.correctAnswer === undefined) {
        throw new Error(`Question ${index + 1} is missing required fields (type, question, options, or correctAnswer)`);
      }
      
      return {
        id: randomUUID(),
        type: q.type as QuestionType,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        points: 10,
      };
    });

    if (questions.length === 0) {
      throw new Error("No questions generated");
    }

    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    if (error instanceof Error) {
      // Preserve specific error messages
      throw error;
    }
    throw new Error("Failed to generate questions. Please try again.");
  }
}
