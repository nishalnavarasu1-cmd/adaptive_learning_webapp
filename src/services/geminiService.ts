import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateLesson(params: {
  topic: string;
  subject: string;
  level: string;
  learningStyle: string;
  engagement: string;
  videos?: any[];
  features: {
    blooms: boolean;
    analogy: boolean;
    spacedRepetition: boolean;
    career: boolean;
  };
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const videoContext = params.videos && params.videos.length > 0 
    ? `\n### 📺 Available Videos for this Lesson:
${params.videos.map((v, i) => `${i + 1}. **${v.title}** by ${v.channelTitle} (${v.id})`).join("\n")}
Please reference these videos in the lesson where appropriate (e.g., "Watch [Video Title] to see this in action").`
    : "";

  const prompt = `
Generate a comprehensive, interactive lesson based on the following parameters:
- **Topic**: ${params.topic}
- **Subject**: ${params.subject}
- **Level**: ${params.level}
- **Learning Style**: ${params.learningStyle}
- **Engagement Level**: ${params.engagement}
${videoContext}

Follow this exact structure and formatting:

## 🎯 Lesson: [TOPIC] — [SUBJECT]

## 🧠 Personalised Explanation
Adapt your explanation precisely to the parameters. Use structured explanations with clear signposting. Connect to prior knowledge.
If learning style is visual, prioritise spatial diagrams, labelled mental imagery, and step-by-step visual walkthroughs.

## 🌍 Real-World Relevance
Open with a compelling real-world hook — a question, scenario, or surprising fact.

## 🎨 Visual Learning Section
Describe at least 2 imaginary diagrams in precise spatial language. Label all components. End each diagram with: "What do you notice about [element]?"

## 🎧 Audio Explanation Script
Write a full voiceover script (300–400 words). Use natural pauses: [pause], [breathe], [emphasis]. End with: "Before we move on, say this back to yourself: [one-sentence summary]"

## ⚡ Interactive Checkpoints
Insert 3 "Pause & Think" moments inside the lesson.
Each checkpoint must:
1. Pose a question.
2. Give a 10-second thinking prompt.
3. Reveal the answer with a short explanation.

### Adaptive Quiz
Generate exactly 8 questions tiered as: 3 easy → 3 medium → 2 hard.
${params.features.blooms ? "Tag each question with [Bloom's level: Remember / Understand / Apply / Analyse / Evaluate / Create]" : ""}
For each question provide: correct answer + why it's correct + 2 common wrong answers + diagnostic hint.

### Memory Architecture
- Primary mnemonic (acronym or rhyme)
- Story-based encoding
${params.features.spacedRepetition ? "- Spaced repetition schedule: Day 1 → Day 3 → Day 7 → Day 21" : ""}
- One "hook" image description.

### Real-World Bridge
- 2 concrete examples from everyday life.
${params.features.career ? "- Connect the topic to a current event, technology, or career path." : ""}
- "So what?" statement.

## ✅ Instant Feedback Engine
For every quiz question, provide:
- ✓ Correct answer with explanation.
- ✗ Common wrong answer and cognitive error.
- 💡 A retrieval hint.

## 📌 Summary Notes
5-bullet "exam-ready" summary. Highlight the most commonly examined point. Include one "danger zone" warning.

## 🚀 Adaptive Recommendation
1. Sub-topic to revisit.
2. Logical next topic.
3. 3-day micro practice plan.
4. Recommended resource type.

**Output language**: English
**Format rule**: Use Markdown headers, bold text, and clear sections. Avoid walls of text.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
