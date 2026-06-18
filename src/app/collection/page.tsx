"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Thing } from "@/types/thing";
import { CATEGORY_LABELS, parseThingsCsv, RARITY_LABELS } from "@/utils/things";

const COLLECTION_KEY = "fish-fetcher-collection";

function loadCollectionIds(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export default function CollectionPage() {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCollectedIds(loadCollectionIds());
    fetch("/things.csv")
      .then((res) => res.text())
      .then((text) => setThings(parseThingsCsv(text)))
      .finally(() => setLoading(false));
  }, []);

  const collectedThings = useMemo(() => {
    return things.filter((thing) => collectedIds.has(thing.id));
  }, [collectedIds, things]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-green-200">图鉴</h1>
        <Link href="/" className="text-sm text-green-200 hover:text-green-100">
          返回
        </Link>
      </div>

      <p className="mt-2 text-sm text-white/50">
        已收录 {collectedThings.length} / {things.length || "—"}
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <p className="p-6 text-center text-white/60">加载中…</p>
        ) : collectedThings.length === 0 ? (
          <div className="p-6 text-center text-white/60">
            <p>你还没有钓到任何东西。</p>
            <p className="mt-2 text-sm text-white/40">先去甩一竿，开个盒。</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-black/20 text-white/70">
              <tr>
                <th className="px-4 py-3 font-medium">名称</th>
                <th className="px-4 py-3 font-medium">稀有度</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">描述</th>
              </tr>
            </thead>
            <tbody>
              {collectedThings.map((thing) => (
                <tr key={thing.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{thing.name}</td>
                  <td className="px-4 py-3 text-white/70">{RARITY_LABELS[thing.rarity]}</td>
                  <td className="px-4 py-3 text-white/70">{CATEGORY_LABELS[thing.category]}</td>
                  <td className="px-4 py-3 text-white/60">{thing.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

