"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const exercises = [
  "PUSH-UP",
  "SQUAT",
  "BURPEE",
  "PLANK",
  "JUMPING JACK",
  "LUNGE",
  "CRUNCH",
  "MOUNTAIN CLIMBER",
];

function randomExercise() {
  return exercises[Math.floor(Math.random() * exercises.length)];
}

export default function ClickerGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [exercise, setExercise] = useState(randomExercise());
  const [combo, setCombo] = useState(1);
  const [flash, setFlash] = useState(false);
  const [motivation, setMotivation] = useState("KEEP GOING");

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleClick = () => {
    if (!gameOver) {
      setScore((s) => s + 10 * combo);
      setCombo((c) => c + 1);
      setExercise(randomExercise());
      setFlash(true);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMotivation(newCombo >= 5 ? "BEAST MODE" : "KEEP GOING");
      setTimeout(() => setFlash(false), 200);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setExercise(randomExercise());
    setCombo(1);
    setMotivation("KEEP GOING");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="text-2xl">Score: {score}</div>
      <div className="text-xl">Time: {timeLeft}s</div>
      <div className="text-xl">Combo: {combo}x</div>
      <div className="text-xl">{motivation}</div>
      {gameOver ? (
        <>
          <div className="text-3xl font-bold">WORKOUT COMPLETE</div>
          <div className="text-xl">Final Score: {score}</div>
          <Button onClick={handlePlayAgain}>TRAIN AGAIN</Button>
        </>
      ) : (
        <>
          <div className={`text-4xl font-bold ${flash ? "text-green-500" : ""}`}>
            {exercise}
          </div>
          <Button onClick={handleClick}>{exercise}</Button>
        </>
      )}
    </div>
  );
}
