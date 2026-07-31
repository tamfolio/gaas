import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const WGER_BASE = "https://wger.de/api/v2";

type WgerExercise = {
  id: number;
  category: { id: number; name: string } | null;
  muscles: { id: number; name_en: string }[];
  equipment: { id: number; name: string }[];
  images: { image: string; is_main: boolean }[];
  translations: {
    name: string;
    language: number | { id: number; short_name: string };
    description: string;
  }[];
};

async function seed(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = 100;

  const url = `${WGER_BASE}/exerciseinfo/?format=json&language=2&limit=${limit}&offset=${offset}`;

  let wgerData: { count: number; next: string | null; results: WgerExercise[] };
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`wger responded ${res.status}`);
    wgerData = await res.json();
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch from wger: ${err}` }, { status: 502 });
  }

  const rows = wgerData.results
    .map((ex) => {
      // wger may return language as an integer (2) or as an object {id:2, short_name:"en"}
      // Since we fetch with ?language=2, fall back to first translation if no exact match
      const en =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ex.translations as any[])?.find(
          (t) => t.language === 2 || t.language?.id === 2 || t.language?.short_name === "en"
        ) ?? ex.translations?.[0];
      if (!en?.name?.trim()) return null;

      const mainImage =
        ex.images?.find((img) => img.is_main)?.image ??
        ex.images?.[0]?.image ??
        null;

      return {
        wger_id: ex.id,
        name: en.name.trim(),
        category: ex.category?.name ?? null,
        muscles: ex.muscles?.map((m) => m.name_en).filter(Boolean) ?? [],
        equipment: ex.equipment?.map((e) => e.name).filter(Boolean) ?? [],
        description: en.description?.replace(/<[^>]*>/g, "").trim() || null,
        image_url: mainImage,
      };
    })
    .filter(Boolean);

  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("exercises")
    .upsert(rows, { onConflict: "wger_id", count: "exact" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    inserted: count ?? rows.length,
    total_available: wgerData.count,
    offset,
    has_more: !!wgerData.next,
    next_offset: wgerData.next ? offset + limit : null,
  });
}

// Visit this URL in your browser while pnpm dev is running:
// http://localhost:3000/api/admin/seed-exercises?secret=YOUR_CRON_SECRET
// Repeat with &offset=100, &offset=200, &offset=300 for more exercises.
export async function GET(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return seed(request);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return seed(request);
}
