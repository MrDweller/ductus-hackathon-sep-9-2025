"use client";

import { useState, useEffect, useRef } from "react";
import HealthBar from "./health-bar"; 


const snakeImages = [
    "/victor.png",
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
        snakeImages.map((img, i) => ({
            x: 2000 - i * 20,
            y: 600,
            img,
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

  // --- Health pulses (parent-controlled) ---
  const [heroHeal, setHeroHeal] = useState(0);
  const [heroDamage, setHeroDamage] = useState(0);

  const [enemyHeals, setEnemyHeals] = useState([0, 0, 0, 0]);
  const [enemyDamages, setEnemyDamages] = useState([0, 0, 0, 0]);

  // Helper to send a "pulse" (set value then reset to 0) so the child applies it every time
  const pulseSetter = (setter, idx = null) => (amount) => {
    if (idx === null) {
      setter(amount);
      // reset after render tick
      setTimeout(() => setter(0), 0);
    } else {
      setter((prev) => {
        const copy = [...prev];
        copy[idx] = amount;
        return copy;
      });
      setTimeout(() =>
        setter((prev) => {
          const copy = [...prev];
          copy[idx] = 0;
          return copy;
        }), 0
      );
    }
  };

  // Public-ish actions you can call from anywhere in this component:
  const healHero = pulseSetter(setHeroHeal);
  const damageHero = pulseSetter(setHeroDamage);
  const healEnemy = (i, amount) => pulseSetter(setEnemyHeals, i)(amount);
  const damageEnemy = (i, amount) => pulseSetter(setEnemyDamages, i)(amount);


  // --- Cursor tracking ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      setCursor(pos);
      cursorRef.current = pos;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

// --- Snake movement with increasing speed ---
useEffect(() => {
  let speed = 12; 
  const spacing = 100;

  // every 5 seconds increase speed
  const speedInterval = setInterval(() => {
    speed += 1;
    console.log("Speed increased:", speed);
  }, 2000);

  const moveInterval = setInterval(() => {
    setSnake((prev) => {
      const newSnake = [...prev];
      const head = { ...newSnake[0] };
      const { x: targetX, y: targetY } = cursorRef.current;

      const dx = targetX - head.x;
      const dy = targetY - head.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        head.x += (dx / dist) * speed;
        head.y += (dy / dist) * speed;
      }
      newSnake[0] = head;

      for (let i = 1; i < newSnake.length; i++) {
        const prevSeg = newSnake[i - 1];
        const seg = { ...newSnake[i] };
        const ddx = prevSeg.x - seg.x;
        const ddy = prevSeg.y - seg.y;
        const ddist = Math.sqrt(ddx * ddx + ddy * ddy);

        if (ddist > spacing) {
          seg.x += (ddx / ddist) * speed;
          seg.y += (ddy / ddist) * speed;
        }

        newSnake[i] = seg;
      }

      return newSnake;
    });
  }, 30);

  return () => {
    clearInterval(moveInterval);
    clearInterval(speedInterval);
  };
}, []);



  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // --- Snake collision ---
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
    setItems((prev) => {
      if (prev.length >= 3) {
        // redan max antal ute, spawnar inget nytt
        return prev;
      }

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const klass = pickRandom(itemNames);
      const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

      return [...prev, { id, x, y, klass }];
    });
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
    <div className="game-area" style={{ minHeight: "100vh", position: "relative" }}>
      {/* Player */}
      <div className="player" style={{ left: cursor.x, top: cursor.y, position: "absolute" }} />

      {/* Snake */}
{snake.map((seg, i) => (
  <div
    key={i}
    className="snake-seg"
    style={{
      left: seg.x,
      top: seg.y,
      position: "absolute",
      width: "80px",     // 3× bigger
      height: "80px",    // 3× bigger
      background: `url(${seg.img}) no-repeat center/cover`,
      borderRadius: "50%", // optional, makes them circular
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
