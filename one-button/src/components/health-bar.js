import { useState, useEffect } from "react";

export default function HealthBar({ maxValue = 100, heal = 0, damage = 0, isEnemy = false }) {
  const [currentValue, setCurrentValue] = useState(maxValue);

  // Update health when props change
  useEffect(() => {
    if (heal > 0) {
      setCurrentValue((prev) => Math.min(prev + heal, maxValue));
    }
  }, [heal, maxValue]);

  useEffect(() => {
    if (damage > 0) {
      setCurrentValue((prev) => Math.max(prev - damage, 0));
    }
  }, [damage, maxValue]);

  const percentage = (currentValue / maxValue) * 100;

  // Color logic
  let barColor = "green";
  if (isEnemy) {
    barColor = "red"; // always red for enemies
  } else {
    if (percentage <= 50 && percentage > 25) barColor = "yellow";
    else if (percentage <= 25) barColor = "red";
  }

  return (
    <div
      style={{
        width: "200px",
        height: "25px",
        backgroundColor: "black",
        border: "2px solid #444",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: barColor,
          transition: "width 0.3s ease, background-color 0.3s ease",
        }}
      />
    </div>
  );
}
