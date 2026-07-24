import Anthropic from "@anthropic-ai/sdk";
import type { WorkoutPlanData } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface MemberProfile {
  full_name: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  goal: string;
  fitness_level: "beginner" | "intermediate" | "advanced";
  days_per_week: number;
  injuries: string | null;
}

export async function generateWorkoutPlan(member: MemberProfile): Promise<WorkoutPlanData> {
  const prompt = `Generate a personalized ${member.days_per_week}-day per week workout plan for a gym member with the following profile:

- Name: ${member.full_name}
- BMI: ${member.bmi} (Weight: ${member.weight_kg}kg, Height: ${member.height_cm}cm)
- Fitness Goal: ${member.goal}
- Fitness Level: ${member.fitness_level}
- Days per week: ${member.days_per_week}
- Injuries/Limitations: ${member.injuries || "None"}

Return a 4-week progressive workout plan as a JSON object matching this exact structure:
{
  "goal": "string describing the main goal",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": "Monday",
          "exercises": [
            {
              "name": "Exercise name",
              "sets": 3,
              "reps": "10-12",
              "rest_seconds": 60,
              "notes": "form tip or null"
            }
          ]
        }
      ]
    }
  ]
}

Only return the JSON object, no additional text.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text) as WorkoutPlanData;
}
