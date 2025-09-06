// app/play.tsx
import React from "react";
import AnimatedCardDraw from "../components/AnimatedCardDraw";
import { PixelButton } from "../components/PixelButton";
import { PixelCard } from "../components/PixelCard";
import { PixelText } from "../components/PixelText";

export default function PlayScreen() {
  const startGame = () => {
    // Game start logic
  };

  return (
    <>
      <PixelText size="large" style={{ textAlign: 'center', marginBottom: 16 }}>
        ¡Prepárate para jugar!
      </PixelText>
      <PixelButton title="Jugar" onPress={startGame} />
      <PixelCard suit="H" value="A" selected />
      <AnimatedCardDraw card={{ suit: "JOKER", value: "JOKER" }} />
    </>
  );
}