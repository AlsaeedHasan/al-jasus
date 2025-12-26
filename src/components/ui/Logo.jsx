import { motion } from "framer-motion";
import { VenetianMask } from "lucide-react";

export default function Logo({ size = "lg" }) {
  const sizes = {
    sm: { container: "w-16 h-16", text: "text-xl", subtext: "text-xs" },
    md: { container: "w-24 h-24", text: "text-2xl", subtext: "text-sm" },
    lg: { container: "w-32 h-32", text: "text-4xl", subtext: "text-base" },
  };

  const { container, text, subtext } = sizes[size];

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`${container} relative`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 blur-xl opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main logo circle */}
        <motion.div
          className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center shadow-2xl"
          animate={{
            boxShadow: [
              "0 0 20px rgba(168, 85, 247, 0.5)",
              "0 0 40px rgba(249, 115, 22, 0.5)",
              "0 0 20px rgba(168, 85, 247, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <VenetianMask className={`${text} text-white`} />
        </motion.div>
      </motion.div>

      <motion.h1
        className={`mt-4 font-bold gradient-text ${text}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        الجاسوس
      </motion.h1>

      <motion.p
        className={`text-white/50 ${subtext}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        هتعرف تهبد صح؟
      </motion.p>
    </motion.div>
  );
}
