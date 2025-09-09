"use client";

import { useState, useEffect, useRef } from "react";

const snakeImages = [
  "/arthur.jpg",
  "/gustav.jpg",
  "/tobias.jpg",
];

// Hjälp-funktion för att välja slumpmässigt element från en array
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Game() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const cursorRef = useRef(cursor);

  const [snake, setSnake] = useState(
    snakeImages.map((_, i) => ({
      x: 100 - i * 20,
      y: 100,
    }))
  );
  const snakeRef = useRef(snake);

  const [items, setItems] = useState([]);

  const [itemNames] = useState([
    "twin-swords", "twin-swords", "twin-swords", 
    "sword", "sword", "sword",
    "bow", "bow",
    "needle", "needle", "needle",
    "bomb"
  ]);

  // Track cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      setCursor(pos);
      cursorRef.current = pos;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Snake movement
  useEffect(() => {
    const interval = setInterval(() => {
      setSnake((prev) => {
        const newSnake = [...prev];
        const head = { ...newSnake[0] };
        const { x: targetX, y: targetY } = cursorRef.current;

        const dx = targetX - head.x;
        const dy = targetY - head.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 3;
        if (dist > 1) {
          head.x += (dx / dist) * speed;
          head.y += (dy / dist) * speed;
        }
        newSnake[0] = head;

        for (let i = 1; i < newSnake.length; i++) {
          const prevSeg = newSnake[i - 1];
          const seg = { ...newSnake[i] };
          const dx = prevSeg.x - seg.x;
          const dy = prevSeg.y - seg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 20) {
            seg.x += (dx / dist) * 2;
            seg.y += (dy / dist) * 2;
          }
          newSnake[i] = seg;
        }
        return newSnake;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // keep snakeRef updated
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // Snake collision
  useEffect(() => {
    const interval = setInterval(() => {
      const { x: px, y: py } = cursorRef.current;

      snakeRef.current.forEach((seg) => {
        const dx = seg.x - px;
        const dy = seg.y - py;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          alert("💀 Game Over!");
          window.location.reload();
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Spawn items (tilldela klass och id vid spawn)
  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const klass = pickRandom(itemNames);
      const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

      setItems((prev) => [...prev, { id, x, y, klass }]);
    }, 4000);

    return () => clearInterval(interval);
  }, [itemNames]);

  // Item collision
  useEffect(() => {
    const interval = setInterval(() => {
      const { x: px, y: py } = cursorRef.current;
      setItems((prev) =>
        prev.filter((item) => {
          const dx = item.x - px;
          const dy = item.y - py;
          if (Math.sqrt(dx * dx + dy * dy) < 20) {
            setSnake((s) => (s.length > 1 ? s.slice(0, -1) : s));
            return false;
          }
          return true;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="game-area">
      {/* Player */}
      <div
        className="player"
        style={{ left: cursor.x, top: cursor.y }}
      />

      {/* Snake */}
      {snake.map((seg, i) => (
        <div
          key={i}
          className="snake-seg"
          style={{
            left: seg.x,
            top: seg.y,
            background: `url(${snakeImages[i]}) no-repeat center/contain`,
          }}
        />
      ))}

      {/* Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className={`item ${item.klass}`}   // behåller slumpad klass
          style={{ left: item.x, top: item.y }}
        />
      ))}
    </div>
  );
}
