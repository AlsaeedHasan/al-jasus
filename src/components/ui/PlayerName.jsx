import { motion } from "framer-motion";
import { Crown } from "lucide-react";

// VIP names list (normalized to lowercase for comparison)
const VIP_NAMES = ["سعيد", "السعيد", "saeed", "alsaeed"];

export default function PlayerName({ name, className = "" }) {
  // Normalize name for comparison
  const normalizedName = name?.trim().toLowerCase() || "";
  const isVIP = VIP_NAMES.includes(normalizedName);

  if (!name) return null;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{name}</span>
      {isVIP && (
        <motion.span
          className="inline-flex items-center mr-1"
          animate={{
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Crown
            size={18}
            className="w-5 h-5 text-yellow-400 fill-yellow-400 inline-block"
          />
        </motion.span>
      )}
    </span>
  );
}
