import type { InsertQuiz } from "@shared/schema";
import { storage } from "./storage";

export const exampleQuizzes: InsertQuiz[] = [
  {
    title: "World Geography Basics",
    description: "Test your knowledge of world geography, capitals, and landmarks.",
    theme: "blue",
    difficulty: "beginner",
    questions: [
      {
        id: "geo1",
        type: "multiple",
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: "Paris",
        points: 10,
        explanation: "Paris is the capital and largest city of France.",
      },
      {
        id: "geo2",
        type: "multiple",
        question: "Which is the largest ocean?",
        options: ["Atlantic", "Pacific", "Indian", "Arctic"],
        correctAnswer: "Pacific",
        points: 10,
        explanation: "The Pacific Ocean is the largest and deepest ocean on Earth.",
      },
      {
        id: "geo3",
        type: "truefalse",
        question: "Mount Everest is the tallest mountain in the world.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "Mount Everest stands at 8,848 meters above sea level.",
      },
      {
        id: "geo4",
        type: "multiple",
        question: "Which continent is the largest by land area?",
        options: ["Africa", "Asia", "North America", "Europe"],
        correctAnswer: "Asia",
        points: 10,
        explanation: "Asia is the largest continent, covering about 30% of Earth's land area.",
      },
      {
        id: "geo5",
        type: "text",
        question: "What is the longest river in the world?",
        correctAnswer: "Nile",
        points: 10,
        explanation: "The Nile River is approximately 6,650 km long.",
      },
    ],
  },
  {
    title: "JavaScript Fundamentals",
    description: "Test your understanding of JavaScript basics, ES6 features, and common patterns.",
    theme: "green",
    difficulty: "intermediate",
    questions: [
      {
        id: "js1",
        type: "multiple",
        question: "What does 'const' keyword do in JavaScript?",
        options: [
          "Creates a constant variable that cannot be reassigned",
          "Creates a variable that can be reassigned",
          "Creates a function",
          "Creates an object",
        ],
        correctAnswer: "Creates a constant variable that cannot be reassigned",
        points: 10,
        explanation: "const creates a block-scoped constant that cannot be reassigned.",
      },
      {
        id: "js2",
        type: "multiple",
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        points: 10,
        explanation: "push() adds one or more elements to the end of an array.",
      },
      {
        id: "js3",
        type: "truefalse",
        question: "JavaScript is a compiled language.",
        options: ["True", "False"],
        correctAnswer: "False",
        points: 10,
        explanation: "JavaScript is an interpreted language, not compiled.",
      },
      {
        id: "js4",
        type: "multiple",
        question: "What is the result of: typeof null?",
        options: ["null", "object", "undefined", "string"],
        correctAnswer: "object",
        points: 10,
        explanation: "This is a known quirk in JavaScript - typeof null returns 'object'.",
      },
      {
        id: "js5",
        type: "text",
        question: "What does 'NaN' stand for?",
        correctAnswer: "Not a Number",
        points: 10,
        explanation: "NaN represents a value that is not a valid number.",
      },
    ],
  },
  {
    title: "World History Timeline",
    description: "Test your knowledge of major historical events and their timelines.",
    theme: "purple",
    difficulty: "intermediate",
    questions: [
      {
        id: "hist1",
        type: "multiple",
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswer: "1945",
        points: 10,
        explanation: "World War II ended in 1945 with the surrender of Japan.",
      },
      {
        id: "hist2",
        type: "multiple",
        question: "Who was the first person to walk on the moon?",
        options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"],
        correctAnswer: "Neil Armstrong",
        points: 10,
        explanation: "Neil Armstrong was the first person to step on the moon in 1969.",
      },
      {
        id: "hist3",
        type: "truefalse",
        question: "The Berlin Wall fell in 1989.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era.",
      },
      {
        id: "hist4",
        type: "multiple",
        question: "Which ancient civilization built the pyramids?",
        options: ["Greeks", "Romans", "Egyptians", "Mayans"],
        correctAnswer: "Egyptians",
        points: 10,
        explanation: "The ancient Egyptians built the famous pyramids as tombs for pharaohs.",
      },
      {
        id: "hist5",
        type: "ranking",
        question: "Order these events chronologically (oldest to newest):",
        correctAnswer: ["Renaissance", "Industrial Revolution", "World War I", "Internet Age"],
        points: 10,
        explanation: "Renaissance (14th-17th century), Industrial Revolution (18th-19th century), WWI (1914-1918), Internet Age (1990s-present).",
      },
    ],
  },
  {
    title: "Science & Nature",
    description: "Explore questions about biology, chemistry, physics, and the natural world.",
    theme: "orange",
    difficulty: "intermediate",
    questions: [
      {
        id: "sci1",
        type: "multiple",
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "NaCl"],
        correctAnswer: "H2O",
        points: 10,
        explanation: "H2O represents two hydrogen atoms and one oxygen atom.",
      },
      {
        id: "sci2",
        type: "multiple",
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        points: 10,
        explanation: "Mars appears red due to iron oxide (rust) on its surface.",
      },
      {
        id: "sci3",
        type: "truefalse",
        question: "Light travels faster than sound.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "Light travels at approximately 300,000 km/s, while sound travels at about 343 m/s in air.",
      },
      {
        id: "sci4",
        type: "multiple",
        question: "What is the smallest unit of life?",
        options: ["Atom", "Molecule", "Cell", "Organ"],
        correctAnswer: "Cell",
        points: 10,
        explanation: "The cell is the basic structural and functional unit of all living organisms.",
      },
      {
        id: "sci5",
        type: "text",
        question: "What force keeps planets in orbit around the sun?",
        correctAnswer: "Gravity",
        points: 10,
        explanation: "Gravity is the force that attracts objects with mass toward each other.",
      },
    ],
  },
  {
    title: "Mathematics Essentials",
    description: "Test your math skills with algebra, geometry, and arithmetic problems.",
    theme: "orange",
    difficulty: "beginner",
    questions: [
      {
        id: "math1",
        type: "multiple",
        question: "What is 15 × 4?",
        options: ["50", "60", "70", "80"],
        correctAnswer: "60",
        points: 10,
        explanation: "15 multiplied by 4 equals 60.",
      },
      {
        id: "math2",
        type: "multiple",
        question: "What is the square root of 64?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8",
        points: 10,
        explanation: "8 × 8 = 64, so the square root of 64 is 8.",
      },
      {
        id: "math3",
        type: "truefalse",
        question: "A triangle always has three sides.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "By definition, a triangle is a polygon with exactly three sides.",
      },
      {
        id: "math4",
        type: "multiple",
        question: "What is the value of π (pi) approximately?",
        options: ["2.14", "3.14", "4.14", "5.14"],
        correctAnswer: "3.14",
        points: 10,
        explanation: "π (pi) is approximately 3.14159...",
      },
      {
        id: "math5",
        type: "text",
        question: "What is 2 + 2?",
        correctAnswer: "4",
        points: 10,
        explanation: "2 + 2 equals 4.",
      },
    ],
  },
  {
    title: "Literature & Books",
    description: "Test your knowledge of famous books, authors, and literary works.",
    theme: "pink",
    difficulty: "intermediate",
    questions: [
      {
        id: "lit1",
        type: "multiple",
        question: "Who wrote '1984'?",
        options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "J.D. Salinger"],
        correctAnswer: "George Orwell",
        points: 10,
        explanation: "George Orwell wrote the dystopian novel '1984' in 1949.",
      },
      {
        id: "lit2",
        type: "multiple",
        question: "Which Shakespeare play features the character Hamlet?",
        options: ["Macbeth", "Hamlet", "Romeo and Juliet", "Othello"],
        correctAnswer: "Hamlet",
        points: 10,
        explanation: "Hamlet is the title character of Shakespeare's famous tragedy.",
      },
      {
        id: "lit3",
        type: "truefalse",
        question: "'The Great Gatsby' was written by F. Scott Fitzgerald.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "F. Scott Fitzgerald wrote 'The Great Gatsby' in 1925.",
      },
      {
        id: "lit4",
        type: "multiple",
        question: "Who wrote 'To Kill a Mockingbird'?",
        options: ["Harper Lee", "Mark Twain", "Ernest Hemingway", "John Steinbeck"],
        correctAnswer: "Harper Lee",
        points: 10,
        explanation: "Harper Lee wrote 'To Kill a Mockingbird' in 1960.",
      },
      {
        id: "lit5",
        type: "text",
        question: "What is the first book in the 'Harry Potter' series?",
        correctAnswer: "Harry Potter and the Philosopher's Stone",
        points: 10,
        explanation: "The first book is 'Harry Potter and the Philosopher's Stone' (or Sorcerer's Stone in the US).",
      },
    ],
  },
  {
    title: "Sports & Games",
    description: "Test your knowledge of sports, athletes, and major sporting events.",
    theme: "pink",
    difficulty: "beginner",
    questions: [
      {
        id: "sport1",
        type: "multiple",
        question: "How many players are on a basketball team on the court at once?",
        options: ["4", "5", "6", "7"],
        correctAnswer: "5",
        points: 10,
        explanation: "A basketball team has 5 players on the court at any given time.",
      },
      {
        id: "sport2",
        type: "multiple",
        question: "Which sport is played at Wimbledon?",
        options: ["Tennis", "Golf", "Cricket", "Rugby"],
        correctAnswer: "Tennis",
        points: 10,
        explanation: "Wimbledon is the oldest and most prestigious tennis tournament.",
      },
      {
        id: "sport3",
        type: "truefalse",
        question: "Soccer is the most popular sport in the world.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "Soccer (football) is played by over 250 million people worldwide.",
      },
      {
        id: "sport4",
        type: "multiple",
        question: "In which sport would you perform a slam dunk?",
        options: ["Football", "Basketball", "Volleyball", "Tennis"],
        correctAnswer: "Basketball",
        points: 10,
        explanation: "A slam dunk is a basketball move where a player jumps and forces the ball through the hoop.",
      },
      {
        id: "sport5",
        type: "text",
        question: "What is the maximum score in a single frame of bowling?",
        correctAnswer: "10",
        points: 10,
        explanation: "A strike (knocking down all 10 pins) gives you 10 points plus the next two rolls.",
      },
    ],
  },
  {
    title: "Technology & Computing",
    description: "Test your knowledge of computers, internet, and modern technology.",
    theme: "blue",
    difficulty: "advanced",
    questions: [
      {
        id: "tech1",
        type: "multiple",
        question: "What does 'CPU' stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Unit",
          "Computer Processing Unit",
        ],
        correctAnswer: "Central Processing Unit",
        points: 10,
        explanation: "CPU stands for Central Processing Unit, the brain of a computer.",
      },
      {
        id: "tech2",
        type: "multiple",
        question: "Which company created the iPhone?",
        options: ["Samsung", "Google", "Apple", "Microsoft"],
        correctAnswer: "Apple",
        points: 10,
        explanation: "Apple Inc. created and released the first iPhone in 2007.",
      },
      {
        id: "tech3",
        type: "truefalse",
        question: "RAM stands for Random Access Memory.",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 10,
        explanation: "RAM (Random Access Memory) is temporary storage that computers use for active programs.",
      },
      {
        id: "tech4",
        type: "multiple",
        question: "What does 'HTTP' stand for?",
        options: [
          "HyperText Transfer Protocol",
          "High Transfer Text Protocol",
          "Hyper Transfer Text Protocol",
          "High Text Transfer Protocol",
        ],
        correctAnswer: "HyperText Transfer Protocol",
        points: 10,
        explanation: "HTTP is the protocol used for transferring web pages on the internet.",
      },
      {
        id: "tech5",
        type: "text",
        question: "What does 'AI' stand for?",
        correctAnswer: "Artificial Intelligence",
        points: 10,
        explanation: "AI stands for Artificial Intelligence - machines that can learn and make decisions.",
      },
    ],
  },
];

export async function seedExampleQuizzes(): Promise<void> {
  try {
    const existingQuizzes = await storage.getQuizzes();
    console.log(`Found ${existingQuizzes.length} existing quizzes in database`);

    // Only seed if database is empty or has very few quizzes
    if (existingQuizzes.length < 3) {
      console.log("Seeding example quizzes...");
      let seeded = 0;
      for (const quiz of exampleQuizzes) {
        try {
          await storage.createQuiz(quiz);
          seeded++;
        } catch (error: any) {
          // Quiz might already exist, skip it
          if (!error?.message?.includes("duplicate") && !error?.message?.includes("unique")) {
            console.error(`Error seeding quiz "${quiz.title}":`, error);
          }
        }
      }
      console.log(`Successfully seeded ${seeded} example quizzes`);
    } else {
      console.log("Database already has quizzes, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding example quizzes:", error);
  }
}

