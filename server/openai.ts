import OpenAI from "openai";
import type { Question, QuestionType, DifficultyLevel } from "@shared/schema";
import { randomUUID } from "crypto";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.warn("OpenAI client initialization failed:", error);
}

interface GenerateQuestionsParams {
  topic: string;
  numberOfQuestions: number;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
}

export async function generateQuestions(params: GenerateQuestionsParams): Promise<Question[]> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please add your OPENAI_API_KEY to use AI generation.");
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
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz creator who generates engaging, accurate, and educational quiz questions. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const parsed = JSON.parse(content);
    const questions: Question[] = parsed.questions.map((q: any) => ({
      id: randomUUID(),
      type: q.type as QuestionType,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: 10,
    }));

    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
}
