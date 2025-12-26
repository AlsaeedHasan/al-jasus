import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Timer({
  timeRemaining,
  totalTime,
  isRunning,
  size = "lg", // 'sm' | 'md' | 'lg'
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const percentage = (timeRemaining / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const getColor = () => {
    if (percentage > 50)
      return { stroke: "#22c55e", glow: "rgba(34, 197, 94, 0.5)" };
    if (percentage > 25)
      return { stroke: "#eab308", glow: "rgba(234, 179, 8, 0.5)" };
    return { stroke: "#ef4444", glow: "rgba(239, 68, 68, 0.5)" };
  };

  const colors = getColor();

  const sizes = {
    sm: { container: "w-24 h-24", text: "text-xl", strokeWidth: 4 },
    md: { container: "w-36 h-36", text: "text-2xl", strokeWidth: 5 },
    lg: { container: "w-48 h-48", text: "text-4xl", strokeWidth: 6 },
  };

  const { container, text, strokeWidth } = sizes[size];
  const radius = size === "sm" ? 40 : size === "md" ? 60 : 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`${container} relative`}>
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: 0 }}
          animate={{
            strokeDashoffset: mounted ? offset : 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 10px ${colors.glow})`,
          }}
        />
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`${text} font-bold text-white`}
          animate={{
            scale: percentage <= 10 && isRunning ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: percentage <= 10 && isRunning ? Infinity : 0,
          }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </motion.span>

        {size !== "sm" && (
          <span className="text-white/50 text-sm mt-1">
            {isRunning ? "جاري اللعب" : "متوقف"}
          </span>
        )}
      </div>

      {/* Pulse effect when low */}
      {percentage <= 25 && isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}
