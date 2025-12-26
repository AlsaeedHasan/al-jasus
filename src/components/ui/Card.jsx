import { motion } from "framer-motion";

export default function Card({
  children,
  className = "",
  glow = false,
  hover = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={`
        bg-gradient-to-br from-dark-800/80 to-dark-700/50
        backdrop-blur-lg
        border border-purple-500/20
        rounded-2xl
        p-6
        ${glow ? "card-shadow" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
