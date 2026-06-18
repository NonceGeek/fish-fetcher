import type { Thing, ThingCategory, ThingRarity } from "@/types/thing";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  fields.push(current);
  return fields;
}

export function parseThingsCsv(csv: string): Thing[] {
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const [id, name, description, rarity, category, weight, flavor] =
      parseCsvLine(line);

    return {
      id,
      name,
      description,
      rarity: rarity as ThingRarity,
      category: category as ThingCategory,
      weight: Number(weight),
      flavor,
    };
  });
}

export function pickWeightedThing(things: Thing[]): Thing {
  const totalWeight = things.reduce((sum, thing) => sum + thing.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const thing of things) {
    roll -= thing.weight;
    if (roll <= 0) return thing;
  }

  return things[things.length - 1];
}

export const RARITY_LABELS: Record<ThingRarity, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
};

export const CATEGORY_LABELS: Record<ThingCategory, string> = {
  fish: "鱼",
  trash: "垃圾",
  chest: "宝箱",
  item: "道具",
  event: "事件",
  hidden: "隐藏",
  limited: "限定",
  absurd: "荒诞",
};
