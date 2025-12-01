"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ClickerGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

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
      setScore((s) => s + 10);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="text-2xl">Score: {score}</div>
      <div className="text-xl">Time: {timeLeft}s</div>
      {gameOver ? (
        <>
          <div className="text-3xl font-bold">GAME OVER</div>
          <div className="text-xl">Final Score: {score}</div>
          <Button onClick={handlePlayAgain}>PLAY AGAIN</Button>
        </>
      ) : (
        <Button onClick={handleClick}>CLICK ME</Button>
      )}
    </div>
  );
}
