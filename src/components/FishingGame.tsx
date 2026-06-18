"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Link from "next/link";
import type { FishingPhase, Thing } from "@/types/thing";
import {
  CATEGORY_LABELS,
  parseThingsCsv,
  pickWeightedThing,
  RARITY_LABELS,
} from "@/utils/things";

const CASTING_MESSAGE = "你把鱼钩抛进了水里……";
const WAITING_MESSAGES = ["水面微微晃动。", "好像有什么东西上钩了。"];
const CASTING_MS = 900;
const WAITING_STEP_MS = 1100;
const COLLECTION_KEY = "fish-fetcher-collection";

const RARITY_STYLES: Record<string, string> = {
  common: "border-white/20 text-white/80",
  rare: "border-sky-400/50 text-sky-300",
  epic: "border-violet-400/50 text-violet-300",
  legendary: "border-amber-400/60 text-amber-300",
};

function loadCollection(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCollection(ids: Set<string>) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify([...ids]));
}

export default function FishingGame() {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<FishingPhase>("idle");
  const [statusText, setStatusText] = useState("");
  const [waitingIndex, setWaitingIndex] = useState(0);
  const [result, setResult] = useState<Thing | null>(null);
  const [collection, setCollection] = useState<Set<string>>(new Set());
  const [isNewCatch, setIsNewCatch] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    fetch("/things.csv")
      .then((res) => res.text())
      .then((text) => setThings(parseThingsCsv(text)))
      .finally(() => setLoading(false));

    setCollection(loadCollection());
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const startFishing = useCallback(() => {
    if (things.length === 0 || phase === "casting" || phase === "waiting") return;

    clearTimers();
    setResult(null);
    setIsNewCatch(false);
    setWaitingIndex(0);
    setPhase("casting");
    setStatusText(CASTING_MESSAGE);

    schedule(() => {
      setPhase("waiting");
      setStatusText(WAITING_MESSAGES[0]);
      setWaitingIndex(0);
    }, CASTING_MS);

    WAITING_MESSAGES.forEach((message, index) => {
      schedule(() => {
        setStatusText(message);
        setWaitingIndex(index);
      }, CASTING_MS + index * WAITING_STEP_MS);
    });

    const picked = pickWeightedThing(things);
    schedule(() => {
      setResult(picked);
      setPhase("revealed");
      setStatusText(picked.flavor);

      const nextCollection = new Set(loadCollection());
      const isNew = !nextCollection.has(picked.id);
      if (isNew) {
        nextCollection.add(picked.id);
        saveCollection(nextCollection);
        setCollection(nextCollection);
      }
      setIsNewCatch(isNew);
    }, CASTING_MS + WAITING_MESSAGES.length * WAITING_STEP_MS);
  }, [clearTimers, phase, schedule, things]);

  const isActive = phase === "casting" || phase === "waiting";

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-green-200/90">今天想钓点什么？</p>

      <div
        className={classNames(
          "mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition",
          { "fishing-water-active": isActive },
        )}
      >
        {loading ? (
          <p className="text-white/60">加载结果池…</p>
        ) : phase === "idle" ? (
          <p className="text-white/50 leading-relaxed">
            水面很安静，鱼钩还没入水。
            <br />
            点下方按钮，把期待抛出去。
          </p>
        ) : (
          <div className="space-y-4">
            <p
              className={classNames("text-base leading-relaxed transition", {
                "text-white/70": phase !== "revealed",
                "text-white/90": phase === "revealed",
              })}
            >
              {statusText}
            </p>

            {phase === "waiting" && (
              <div className="flex justify-center gap-2">
                {WAITING_MESSAGES.map((_, index) => (
                  <span
                    key={index}
                    className={classNames("h-2 w-2 rounded-full transition", {
                      "bg-green-300/80": index <= waitingIndex,
                      "bg-white/20": index > waitingIndex,
                    })}
                  />
                ))}
              </div>
            )}

            {phase === "revealed" && result && (
              <div
                className={classNames(
                  "mt-2 rounded-xl border bg-black/30 p-4 text-left",
                  RARITY_STYLES[result.rarity] ?? RARITY_STYLES.common,
                )}
              >
                {isNewCatch && (
                  <p className="mb-2 text-xs font-medium text-green-300">
                    新收录进图鉴！
                  </p>
                )}
                <p className="text-xl font-bold text-white">{result.name}</p>
                <p className="mt-1 text-sm opacity-80">
                  {RARITY_LABELS[result.rarity]} ·{" "}
                  {CATEGORY_LABELS[result.category]}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {result.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-white/40">
        图鉴 {collection.size} / {things.length || "—"}
      </p>

      <div className="mt-3 w-full">
        <Link
          href="/collection"
          className="block w-full rounded-xl border border-white/10 py-2 text-center text-sm text-white/70 transition hover:bg-white/5 hover:text-white/85"
        >
          查看图鉴
        </Link>
      </div>

      <div className="mt-6 w-full">
        {phase === "revealed" ? (
          <button
            type="button"
            onClick={startFishing}
            className="w-full rounded-xl border border-green-200/50 py-3 text-green-200 transition hover:bg-green-200/10"
          >
            再投一竿
          </button>
        ) : (
          <button
            type="button"
            onClick={startFishing}
            disabled={loading || isActive || things.length === 0}
            className={classNames(
              "w-full rounded-xl border py-3 text-lg transition",
              {
                "border-green-200/60 text-green-200 hover:bg-green-200/10":
                  !loading && !isActive && things.length > 0,
                "border-white/10 text-white/30 cursor-not-allowed":
                  loading || isActive || things.length === 0,
              },
            )}
          >
            {isActive ? "等待中…" : "甩竿"}
          </button>
        )}
      </div>
    </div>
  );
}
