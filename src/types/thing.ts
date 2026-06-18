export type ThingRarity = "common" | "rare" | "epic" | "legendary";

export type ThingCategory =
  | "fish"
  | "trash"
  | "chest"
  | "item"
  | "event"
  | "hidden"
  | "limited"
  | "absurd";

export interface Thing {
  id: string;
  name: string;
  description: string;
  rarity: ThingRarity;
  category: ThingCategory;
  weight: number;
  flavor: string;
}

export type FishingPhase = "idle" | "casting" | "waiting" | "revealed";
