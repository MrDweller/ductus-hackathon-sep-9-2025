"use client";

import { useState, useEffect, useRef } from "react";
import HealthBar from "./health-bar"; 


const snakeImages = [
    "/arthur.jpg",
    "/gustav.jpg",
    "/tobias.jpg",
];

export default function Game() {
    const [cursor, setCursor] = useState({ x: 0, y: 0 });
    const cursorRef = useRef(cursor);
    const [snake, setSnake] = useState(
        snakeImages.map((img, i) => ({
            x: 100 - i * 20,
            y: 100,
            img,
        }))
    );
    const snakeRef = useRef(snake);
    const [items, setItems] = useState([]);

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

  // --- Snake movement ---
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
          const ddx = prevSeg.x - seg.x;
          const ddy = prevSeg.y - seg.y;
          const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (ddist > 20) {
            seg.x += (ddx / ddist) * 2;
            seg.y += (ddy / ddist) * 2;
          }
          newSnake[i] = seg;
        }
        return newSnake;
      });
    }, 30);

    return () => clearInterval(interval);
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

  
    // Item collision
    useEffect(() => {
        const interval = setInterval(() => {
            const { x: px, y: py } = cursorRef.current;
            setItems((prev) =>
                prev.filter((item) => {
                    const dx = item.x - px;
                    const dy = item.y - py;
                    if (Math.sqrt(dx * dx + dy * dy) < 20) {
                        setSnake((s) => {
                            if (s.length > 1) {
                                return s.slice(0, -1); // remove last segment
                            } else {
                                return []; // snake dead (can handle respawn elsewhere)
                            }
                        });
                        return false;
                    }
                    return true;
                })
            );
        }, 50);

    return () => clearInterval(interval);
  }, []);

  // --- Spawn items ---
  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      setItems((prev) => [...prev, { x, y }]);
    }, 4000);

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
          style={{ left: seg.x, top: seg.y, position: "absolute", background: `url(${seg.img}) no-repeat center/contain` }}
        />
      ))}

      {/* Items */}
      {items.map((item, i) => (
        <div
          key={i}
          className="item"
          style={{ left: item.x, top: item.y, position: "absolute" }}
        />
      ))}

      {/* --- HEALTH FOOTER --- */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.8)",
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: "16px",
          color: "#fff",
          zIndex: 1000,
        }}
      >
{/* Hero */}
<div style={{ textAlign: "center" }}>
  <div style={{ marginBottom: 6, fontWeight: 700 }}>Hero</div>
  <HealthBar maxValue={100} heal={heroHeal} damage={heroDamage} />
</div>

{/* Enemies */}
{["Arthur", "Gustav", "Victor", "Tobias"].map((name, i) => (
  <div key={name} style={{ textAlign: "center" }}>
    <div style={{ marginBottom: 6, fontWeight: 700 }}>{name}</div>
    <HealthBar
      maxValue={100}
      heal={enemyHeals[i]}
      damage={enemyDamages[i]}
      isEnemy
    />
  </div>
))}


      </footer>
    </div>
  );
}
