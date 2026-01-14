"use client";

import { useState, useRef } from "react";
import TetrisGame from "@/components/TetrisGame";

interface AnimatedTextProps {
  text: string;
  className: string;
}

function AnimatedText({ text, className }: AnimatedTextProps) {
  const [scatterTransforms, setScatterTransforms] = useState<{ [key: number]: { x: number; y: number } }>({});
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const words = text.split(" ");

  const calculateTransforms = (mouseX: number, mouseY: number) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      return {};
    }

    const transforms: { [key: number]: { x: number; y: number } } = {};

    words.forEach((_, index) => {
      const wordElement = wordRefs.current[index];
      if (!wordElement) {
        transforms[index] = { x: 0, y: 0 };
        return;
      }

      const wordRect = wordElement.getBoundingClientRect();
      const wordX = wordRect.left - containerRect.left + wordRect.width / 2;
      const wordY = wordRect.top - containerRect.top + wordRect.height / 2;

      const dx = mouseX - wordX;
      const dy = mouseY - wordY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 120;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const angle = Math.atan2(dy, dx);
        const scatterX = Math.cos(angle + Math.PI) * force * 35;
        const scatterY = Math.sin(angle + Math.PI) * force * 35;
        transforms[index] = { x: scatterX, y: scatterY };
      } else {
        transforms[index] = { x: 0, y: 0 };
      }
    });

    return transforms;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const transforms = calculateTransforms(mouseX, mouseY);
      setScatterTransforms(transforms);
    }
  };

  const handleMouseLeave = () => {
    setScatterTransforms({});
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <p>
        {words.map((word, index) => {
          const scatter = scatterTransforms[index] || { x: 0, y: 0 };

          return (
            <span
              key={index}
              ref={(el) => {
                wordRefs.current[index] = el;
              }}
              className="inline-block transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${scatter.x}px, ${scatter.y}px)`,
              }}
            >
              {word}
              {index < words.length - 1 && "\u00A0"}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-800 to-orange-300" />

      <div className="relative z-10 min-h-screen flex">
        <main className="flex-1 flex items-center px-8 md:px-12 pb-32">
          <div className="w-full max-w-2xl space-y-12 md:space-y-16">
            <AnimatedText
              text="Anisha Bhat"
              className="text-orange-100 text-base md:text-3xl font-normal leading-relaxed"
            />

            <AnimatedText
              text="Hi! I'm a full stack software engineer based in NYC. I enjoy building web applications and designing reliable backend systems."
              className="text-white text-base md:text-xl font-normal leading-relaxed"
            />

            <AnimatedText
              text="When I'm not coding, I'm usually playing pickleball, trying a new recipe, or taking pictures of the sunset."
              className="text-white text-base md:text-xl font-normal leading-relaxed"
            />

            <AnimatedText
              text="https://linkedin.com/in/anishabhat/"
              className="text-violet-400 text-base md:text-xl font-normal leading-relaxed"
            />

            <AnimatedText
              text="https://github.com/anishasbhat"
              className="text-pink-200 text-base md:text-xl font-light leading-relaxed"
            />
          </div>
        </main>

        <aside className="flex-1 flex items-center justify-center border-l border-white/10">
          <TetrisGame />
        </aside>
      </div>
    </div>
  );
}
