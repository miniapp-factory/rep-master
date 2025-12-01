"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Upgrade = {
  name: string;
  baseCost: number;
  income: number;
  emoji: string;
};

const UPGRADE_LIST: Upgrade[] = [
  { name: "Dumbbells", baseCost: 10, income: 1, emoji: "🏋️‍♂️" },
  { name: "Protein Shake", baseCost: 50, income: 5, emoji: "🥤" },
  { name: "Personal Trainer", baseCost: 200, income: 20, emoji: "💪" },
  { name: "Gym Membership", baseCost: 500, income: 50, emoji: "🏢" },
  { name: "Steroids", baseCost: 2000, income: 200, emoji: "💉" },
];

export default function GymHero() {
  const [gains, setGains] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [upgradeCounts, setUpgradeCounts] = useState<number[]>(
    UPGRADE_LIST.map(() => 0)
  );
  const [upgradeCosts, setUpgradeCosts] = useState<number[]>(
    UPGRADE_LIST.map((u) => u.baseCost)
  );
  const [floating, setFloating] = useState<{ id: number; value: string }[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem("gymHeroSave");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setGains(parsed.gains ?? 0);
        setTokenCount(parsed.tokenCount ?? 0);
        setUpgradeCounts(parsed.upgradeCounts ?? UPGRADE_LIST.map(() => 0));
        setUpgradeCosts(parsed.upgradeCosts ?? UPGRADE_LIST.map((u) => u.baseCost));
      } catch {}
    }
  }, []);

  // Persist to localStorage whenever relevant state changes
  useEffect(() => {
    const save = {
      gains,
      tokenCount,
      upgradeCounts,
      upgradeCosts,
    };
    localStorage.setItem("gymHeroSave", JSON.stringify(save));
  }, [gains, tokenCount, upgradeCounts, upgradeCosts]);

  // Calculate gains per second
  const gps =
    upgradeCounts.reduce(
      (sum, count, idx) => sum + count * UPGRADE_LIST[idx].income,
      0
    ) * (1 + tokenCount * 0.1);

  // Passive income every second
  useEffect(() => {
    const interval = setInterval(() => {
      setGains((prev) => prev + gps);
    }, 1000);
    return () => clearInterval(interval);
  }, [gps]);

  const handleWorkout = () => {
    setGains((prev) => prev + 1);
    const id = Date.now();
    setFloating((prev) => [...prev, { id, value: "+1" }]);
    setTimeout(() => setFloating((prev) => prev.filter((f) => f.id !== id)), 800);
  };

  const handleBuy = (idx: number) => {
    const cost = upgradeCosts[idx];
    if (gains < cost) return;
    setGains((prev) => prev - cost);
    setUpgradeCounts((prev) => {
      const newArr = [...prev];
      newArr[idx] += 1;
      return newArr;
    });
    setUpgradeCosts((prev) => {
      const newArr = [...prev];
      newArr[idx] = Math.floor(cost * 1.15);
      return newArr;
    });
  };

  const handleBulkUp = () => {
    setGains(0);
    setUpgradeCounts(UPGRADE_LIST.map(() => 0));
    setUpgradeCosts(UPGRADE_LIST.map((u) => u.baseCost));
    setTokenCount((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white space-y-6 p-4">
      {/* Top section */}
      <div className="text-2xl font-bold">
        Gains: {gains.toLocaleString()} | Gps: {gps.toFixed(1)}
      </div>

      {/* Workout button */}
      <div className="relative">
        <Button
          size="lg"
          className="px-8 py-4 text-2xl font-bold bg-red-600 hover:bg-red-700"
          onClick={handleWorkout}
        >
          WORKOUT
        </Button>
        {floating.map((f) => (
          <span
            key={f.id}
            className="absolute text-green-400 font-bold text-xl animate-float"
          >
            {f.value}
          </span>
        ))}
      </div>

      {/* Upgrade shop */}
      <div className="w-full max-w-md space-y-4">
        {UPGRADE_LIST.map((u, idx) => (
          <div
            key={u.name}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{u.emoji}</span>
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-sm">
                  {upgradeCounts[idx]} x {u.income} Gps
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm">
                Cost: {upgradeCosts[idx].toLocaleString()}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBuy(idx)}
                disabled={gains < upgradeCosts[idx]}
              >
                {gains < upgradeCosts[idx] ? "NOT ENOUGH" : "BUY"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk up button */}
      {gains >= 10000 && (
        <Button
          variant="secondary"
          onClick={handleBulkUp}
          className="mt-4 bg-yellow-500 hover:bg-yellow-600"
        >
          BULK UP (Token {tokenCount})
        </Button>
      )}
    </div>
  );
}
