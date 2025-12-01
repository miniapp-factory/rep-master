"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Monster = {
  name: string;
  baseHp: number;
  baseAttack: number;
  baseGold: number;
  emoji: string;
};

const MONSTERS: Monster[] = [
  { name: "Slime", baseHp: 20, baseAttack: 2, baseGold: 5, emoji: "🟢" },
  { name: "Goblin", baseHp: 50, baseAttack: 5, baseGold: 15, emoji: "🐸" },
  { name: "Wolf", baseHp: 100, baseAttack: 8, baseGold: 30, emoji: "🐺" },
  { name: "Orc", baseHp: 200, baseAttack: 15, baseGold: 75, emoji: "👹" },
  { name: "Troll", baseHp: 500, baseAttack: 25, baseGold: 200, emoji: "🗿" },
  { name: "Dragon", baseHp: 2000, baseAttack: 50, baseGold: 1000, emoji: "🐲" },
];

type Equipment = {
  name: string;
  cost: number;
  attack?: number;
  defense?: number;
  hp?: number;
  emoji: string;
};

const WEAPONS: Equipment[] = [
  { name: "Rusty Sword", cost: 20, attack: 3, emoji: "🗡️" },
  { name: "Iron Sword", cost: 100, attack: 10, emoji: "🗡️" },
  { name: "Steel Blade", cost: 500, attack: 30, emoji: "🗡️" },
  { name: "Legendary Axe", cost: 2000, attack: 100, emoji: "🪓" },
];

const ARMORS: Equipment[] = [
  { name: "Leather Armor", cost: 30, defense: 2, hp: 5, emoji: "🛡️" },
  { name: "Chainmail", cost: 150, defense: 5, hp: 20, emoji: "🛡️" },
  { name: "Plate Armor", cost: 800, defense: 15, hp: 80, emoji: "🛡️" },
  { name: "Dragon Scale", cost: 3000, defense: 40, hp: 300, emoji: "🛡️" },
];

export default function DungeonClicker() {
  // Player stats
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [gold, setGold] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [mp, setMp] = useState(50);
  const [maxMp, setMaxMp] = useState(50);
  const [attack, setAttack] = useState(5);
  const [defense, setDefense] = useState(0);

  // Equipment owned
  const [weaponCount, setWeaponCount] = useState(0);
  const [armorCount, setArmorCount] = useState(0);

  // Skill state
  const [powerStrikeActive, setPowerStrikeActive] = useState(false);

  // Monster state
  const [currentMonster, setCurrentMonster] = useState<Monster>(MONSTERS[0]);
  const [monsterHp, setMonsterHp] = useState(currentMonster.baseHp);
  const [monsterMaxHp, setMonsterMaxHp] = useState(currentMonster.baseHp);

  // Floating text
  const [floating, setFloating] = useState<
    { id: number; value: string; color: string }[]
  >([]);

  // Load from localStorage
  useEffect(() => {
    const data = localStorage.getItem("dungeonClickerSave");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setLevel(parsed.level ?? 1);
        setExp(parsed.exp ?? 0);
        setGold(parsed.gold ?? 0);
        setHp(parsed.hp ?? 100);
        setMaxHp(parsed.maxHp ?? 100);
        setMp(parsed.mp ?? 50);
        setMaxMp(parsed.maxMp ?? 50);
        setAttack(parsed.attack ?? 5);
        setDefense(parsed.defense ?? 0);
        setWeaponCount(parsed.weaponCount ?? 0);
        setArmorCount(parsed.armorCount ?? 0);
        setPowerStrikeActive(parsed.powerStrikeActive ?? false);
        setCurrentMonster(parsed.currentMonster ?? MONSTERS[0]);
        setMonsterHp(parsed.monsterHp ?? MONSTERS[0].baseHp);
        setMonsterMaxHp(parsed.monsterMaxHp ?? MONSTERS[0].baseHp);
      } catch {}
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    const save = {
      level,
      exp,
      gold,
      hp,
      maxHp,
      mp,
      maxMp,
      attack,
      defense,
      weaponCount,
      armorCount,
      powerStrikeActive,
      currentMonster,
      monsterHp,
      monsterMaxHp,
    };
    localStorage.setItem("dungeonClickerSave", JSON.stringify(save));
  }, [
    level,
    exp,
    gold,
    hp,
    maxHp,
    mp,
    maxMp,
    attack,
    defense,
    weaponCount,
    armorCount,
    powerStrikeActive,
    currentMonster,
    monsterHp,
    monsterMaxHp,
  ]);

  // Auto attack
  useEffect(() => {
    const interval = setInterval(() => {
      handleAttack(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [attack, powerStrikeActive, monsterHp, currentMonster]);

  // Monster auto attack
  useEffect(() => {
    const interval = setInterval(() => {
      if (monsterHp <= 0) return;
      const dmg = Math.max(0, currentMonster.baseAttack - defense);
      setHp((prev) => Math.max(0, prev - dmg));
      setFloating((prev) => [
        ...prev,
        { id: Date.now(), value: `-${dmg}`, color: "red" },
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [defense, monsterHp, currentMonster]);

  // Mana regen
  useEffect(() => {
    const interval = setInterval(() => {
      setMp((prev) => Math.min(maxMp, prev + 5));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxMp]);

  // Level up logic
  useEffect(() => {
    if (exp >= level * 100) {
      setLevel((l) => l + 1);
      setExp((e) => e - level * 100);
      setMaxHp((mh) => mh + 10);
      setHp((h) => h + 10);
      setMaxMp((mm) => mm + 5);
      setMp((m) => m + 5);
      setAttack((a) => a + 2);
      setFloating((prev) => [
        ...prev,
        { id: Date.now(), value: `LEVEL UP!`, color: "yellow" },
      ]);
    }
  }, [exp, level]);

  // Handle click attack
  const handleAttack = (isClick: boolean) => {
    if (monsterHp <= 0) return;
    let dmg = attack;
    if (powerStrikeActive) {
      dmg *= 2;
      setPowerStrikeActive(false);
    }
    setMonsterHp((prev) => Math.max(0, prev - dmg));
    setFloating((prev) => [
      ...prev,
      { id: Date.now(), value: `-${dmg}`, color: "orange" },
    ]);
    if (monsterHp - dmg <= 0) {
      // Monster dies
      const goldEarned = currentMonster.baseGold;
      const expEarned = Math.floor(currentMonster.baseHp / 10);
      setGold((g) => g + goldEarned);
      setExp((e) => e + expEarned);
      setFloating((prev) => [
        ...prev,
        { id: Date.now(), value: `+${goldEarned} G`, color: "gold" },
      ]);
      // Spawn new monster
      const nextIndex = (MONSTERS.findIndex((m) => m.name === currentMonster.name) + 1) % MONSTERS.length;
      const next = MONSTERS[nextIndex];
      setCurrentMonster(next);
      setMonsterHp(next.baseHp);
      setMonsterMaxHp(next.baseHp);
    }
  };

  // Skill handlers
  const useFireball = () => {
    if (mp < 20) return;
    setMp((m) => m - 20);
    const dmg = 50;
    setMonsterHp((prev) => Math.max(0, prev - dmg));
    setFloating((prev) => [
      ...prev,
      { id: Date.now(), value: `-${dmg}`, color: "purple" },
    ]);
  };

  const useHeal = () => {
    if (mp < 30) return;
    setMp((m) => m - 30);
    const heal = 40;
    setHp((prev) => Math.min(maxHp, prev + heal));
    setFloating((prev) => [
      ...prev,
      { id: Date.now(), value: `+${heal}`, color: "green" },
    ]);
  };

  const usePowerStrike = () => {
    if (mp < 15) return;
    setMp((m) => m - 15);
    setPowerStrikeActive(true);
    setFloating((prev) => [
      ...prev,
      { id: Date.now(), value: `POWER STRIKE!`, color: "cyan" },
    ]);
  };

  // Purchase equipment
  const buyWeapon = () => {
    const cost = WEAPONS[weaponCount].cost;
    if (gold < cost) return;
    setGold((g) => g - cost);
    setWeaponCount((c) => c + 1);
    setAttack((a) => a + WEAPONS[weaponCount].attack!);
    setFloating((prev) => [
      ...prev,
      { id: Date.now(), value: `+${WEAPONS[weaponCount].attack} ATK`, color: "blue" },
    ]);
  };

  const buyArmor = () => {
    const cost = ARMORS[armorCount].cost;
    if (gold < cost) return;
    setGold((g) => g - cost);
    setArmorCount((c) => c + 1);
    setDefense((d) => d + ARMORS[armorCount].defense!);
    setMaxHp((mh) => mh + ARMORS[armorCount].hp!);
    setHp((h) => h + ARMORS[armorCount].hp!);
    setFloating((prev) => [
      ...prev,
      { id: Date.now(), value: `+${ARMORS[armorCount].hp} HP`, color: "blue" },
    ]);
  };

  // Offline progress (simplified)
  useEffect(() => {
    const last = localStorage.getItem("dungeonClickerLast");
    if (last) {
      const diff = Date.now() - parseInt(last, 10);
      if (diff > 0) {
        const seconds = Math.floor(diff / 1000);
        const goldEarned = Math.floor(seconds * (monsterMaxHp / 100));
        const expEarned = Math.floor(seconds * (monsterMaxHp / 200));
        setGold((g) => g + goldEarned);
        setExp((e) => e + expEarned);
        setFloating((prev) => [
          ...prev,
          { id: Date.now(), value: `+${goldEarned} G (offline)`, color: "gold" },
        ]);
      }
    }
    localStorage.setItem("dungeonClickerLast", Date.now().toString());
  }, [monsterMaxHp]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white space-y-6 p-4">
      {/* Player stats */}
      <div className="text-2xl font-bold">
        Level {level} | HP {hp}/{maxHp} | MP {mp}/{maxMp} | Gold {gold} | ATK {attack} | DEF {defense}
      </div>

      {/* Monster */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-4xl">{currentMonster.emoji}</div>
        <div className="text-2xl font-semibold">{currentMonster.name}</div>
        <Progress value={(monsterHp / monsterMaxHp) * 100} className="w-64" />
        <div>{monsterHp}/{monsterMaxHp}</div>
      </div>

      {/* Attack button */}
      <Button
        size="lg"
        className="px-8 py-4 text-2xl font-bold bg-red-600 hover:bg-red-700"
        onClick={() => handleAttack(true)}
      >
        ATTACK
      </Button>

      {/* Skills */}
      <div className="flex space-x-4">
        <Button variant="outline" onClick={useFireball} disabled={mp < 20}>
          Fireball (20 MP)
        </Button>
        <Button variant="outline" onClick={useHeal} disabled={mp < 30}>
          Heal (30 MP)
        </Button>
        <Button variant="outline" onClick={usePowerStrike} disabled={mp < 15}>
          Power Strike (15 MP)
        </Button>
      </div>

      {/* Shop */}
      <div className="w-full max-w-md space-y-4">
        <div className="text-xl font-bold">Weapons</div>
        {WEAPONS.map((w, idx) => (
          <div key={w.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <div>{w.emoji} {w.name}</div>
            <div>
              <div>Cost: {w.cost}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={buyWeapon}
                disabled={gold < w.cost}
              >
                {gold < w.cost ? "NOT ENOUGH" : "BUY"}
              </Button>
            </div>
          </div>
        ))}
        <div className="text-xl font-bold">Armors</div>
        {ARMORS.map((a, idx) => (
          <div key={a.name} className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <div>{a.emoji} {a.name}</div>
            <div>
              <div>Cost: {a.cost}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={buyArmor}
                disabled={gold < a.cost}
              >
                {gold < a.cost ? "NOT ENOUGH" : "BUY"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating text */}
      <div className="absolute inset-0 pointer-events-none">
        {floating.map((f) => (
          <span
            key={f.id}
            className={`absolute text-${f.color} font-bold text-xl animate-float`}
          >
            {f.value}
          </span>
        ))}
      </div>
    </div>
  );
}
