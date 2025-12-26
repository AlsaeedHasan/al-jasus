import { motion } from "framer-motion";
import { Crown, Gem } from "lucide-react";
import { getVipData } from "../../data/vipList";

export default function PlayerName({ name, className = "" }) {
  if (!name) return null;

  // Get VIP data for this player
  const vipData = getVipData(name);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{name}</span>
      {vipData && (
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
          {vipData.type === "QUEEN" ? (
            <Gem
              size={18}
              className="w-5 h-5 text-pink-400 fill-pink-400 inline-block"
            />
          ) : (
            <Crown
              size={18}
              className="w-5 h-5 text-yellow-400 fill-yellow-400 inline-block"
            />
          )}
        </motion.span>
      )}
    </span>
  );
}
