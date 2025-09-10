// app/play.tsx
import React from "react";
import AnimatedCardDraw from "../components/AnimatedCardDraw";
import { PixelCard } from "../components/PixelCard";

export default function PlayScreen() {
  const startGame = () => {
    // Game start logic
    console.log("Game started!");
  };

  startGame();

  return (
    <>
      <PixelCard suit="H" value="A" selected />
      <AnimatedCardDraw card={{ suit: "JOKER", value: "JOKER" }} />
    </>
  );
}