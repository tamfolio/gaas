"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function calcBmi(weightKg: number, heightCm: number) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  let category: "underweight" | "normal" | "overweight" | "obese";
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";
  return { bmi: Math.round(bmi * 10) / 10, category };
}

export async function recordBmi(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const weightKg = parseFloat(formData.get("weight_kg") as string);
  const heightCm = parseFloat(formData.get("height_cm") as string);

  if (isNaN(weightKg) || isNaN(heightCm) || weightKg <= 0 || heightCm <= 0) {
    return { error: "Invalid weight or height" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) return { error: "Profile not found" };

  const { data: member } = await supabase
    .from("gym_members")
    .select("id")
    .eq("profile_id", user.id)
    .eq("gym_id", profile.gym_id)
    .single();

  if (!member) return { error: "Member record not found" };

  const { bmi, category } = calcBmi(weightKg, heightCm);

  const { error } = await supabase.from("bmi_records").insert({
    gym_member_id: member.id,
    weight_kg: weightKg,
    height_cm: heightCm,
    bmi,
    category,
  });

  if (error) return { error: error.message };

  revalidatePath("/member/bmi");
  return { success: true };
}
