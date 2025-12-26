import { motion } from "framer-motion";
import { VenetianMask } from "lucide-react";

export default function SplashScreen() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-[#0f0d1a] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl" />
      </motion.div>

      {/* Logo Icon */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center shadow-2xl"
          animate={{
            boxShadow: [
              "0 0 30px rgba(168, 85, 247, 0.5)",
              "0 0 60px rgba(249, 115, 22, 0.6)",
              "0 0 30px rgba(168, 85, 247, 0.5)",
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <VenetianMask size={64} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        className="relative z-10 text-4xl md:text-5xl font-bold text-white mb-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        الجاسوس
      </motion.h1>

      {/* Main Tagline */}
      <motion.p
        className="relative z-10 text-2xl md:text-3xl font-bold text-white mb-8 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        هتعرف تهبد صح؟
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        className="relative z-10 flex gap-2 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Developer Signature */}
      <motion.p
        className="absolute bottom-8 z-10 text-sm font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <span className="text-white/60">Developed by </span>
        <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent font-bold">
          Alsaeed
        </span>
      </motion.p>
    </motion.div>
  );
}
