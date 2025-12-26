import { motion } from "framer-motion";
import { Eye, EyeOff, VenetianMask, Palette } from "lucide-react";

export default function RoleCard({
  playerName,
  role, // 'spy' | 'citizen' | 'imposter'
  word,
  category,
  isRevealed,
  onHold,
  onRelease,
  gameMode,
}) {
  const isSpy = role === "spy";
  const isImposter = role === "imposter";

  // Use pointer events for cross-device compatibility
  const handlePointerDown = (e) => {
    // Prevent default to stop text selection and other browser behaviors
    e.preventDefault();
    onHold?.();
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    onRelease?.();
  };

  const handlePointerLeave = (e) => {
    // Only trigger release if we were holding
    if (isRevealed) {
      onRelease?.();
    }
  };

  const handlePointerCancel = (e) => {
    // Handle cases where pointer is cancelled (e.g., system gesture)
    if (isRevealed) {
      onRelease?.();
    }
  };

  // Prevent context menu on long press
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto select-none prevent-select"
      style={{ perspective: "1000px" }}
      onContextMenu={handleContextMenu}
    >
      {/* Card Container - This handles the 3D flip */}
      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer touch-none"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: isRevealed ? 180 : 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.23, 1, 0.32, 1],
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        onContextMenu={handleContextMenu}
      >
        {/* Back of Card (Shows when NOT revealed - user sees this first) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            className={`
              w-full h-full rounded-3xl
              bg-gradient-to-br from-[#2e2a5a] via-[#1e1b4b] to-[#0f0d1a]
              border-2 border-purple-500/30
              flex flex-col items-center justify-center
              shadow-[0_10px_40px_rgba(168,85,247,0.2),0_0_80px_rgba(249,115,22,0.1)]
              overflow-hidden
              relative
            `}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-4 left-4 w-12 h-12 border-2 border-purple-500 rounded-full" />
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-orange-500 rounded-full" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-orange-500 rounded-full" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-purple-500 rounded-full" />
            </div>

            {/* Eye Icon */}
            <motion.div
              animate={{
                scale: isRevealed ? 0.9 : 1,
                opacity: isRevealed ? 0.7 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5),0_0_40px_rgba(168,85,247,0.3)]">
                <Eye size={48} className="text-white" />
              </div>
            </motion.div>

            <p className="text-white/80 text-lg mb-2">بطاقة</p>
            <h2 className="text-2xl font-bold text-white mb-4">{playerName}</h2>

            <motion.div
              className="flex items-center gap-2 text-purple-300"
              animate={{ opacity: isRevealed ? 0.3 : 1 }}
            >
              <EyeOff size={20} />
              <span className="text-sm">اضغط مطولاً للكشف</span>
            </motion.div>

            {/* Press indicator */}
            <motion.div
              className="absolute bottom-6 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isRevealed ? 1 : 0,
                y: isRevealed ? 0 : 10,
              }}
            >
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Front of Card (Shows when revealed - rotated 180deg initially) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className={`
              w-full h-full rounded-3xl
              ${
                isSpy
                  ? "bg-gradient-to-br from-red-900 via-red-800 to-[#0f0d1a] border-red-500/50"
                  : isImposter
                  ? "bg-gradient-to-br from-amber-900 via-amber-800 to-[#0f0d1a] border-amber-500/50"
                  : "bg-gradient-to-br from-purple-900 via-[#1e1b4b] to-[#0f0d1a] border-purple-500/50"
              }
              border-2
              flex flex-col items-center justify-center
              shadow-[0_10px_40px_rgba(168,85,247,0.2),0_0_80px_rgba(249,115,22,0.1)]
              relative
              overflow-hidden
            `}
          >
            {/* Glow effect */}
            <div
              className={`
                absolute inset-0 pointer-events-none
                ${
                  isSpy
                    ? "bg-red-500/10"
                    : isImposter
                    ? "bg-amber-500/10"
                    : "bg-purple-500/10"
                }
                blur-3xl
              `}
            />

            {/* Icon */}
            <div
              className={`
                w-20 h-20 rounded-full mb-6
                ${
                  isSpy
                    ? "bg-gradient-to-br from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    : isImposter
                    ? "bg-gradient-to-br from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                    : "bg-gradient-to-br from-purple-600 to-orange-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                }
                flex items-center justify-center
              `}
            >
              {isSpy ? (
                <VenetianMask size={40} className="text-white" />
              ) : isImposter ? (
                <Palette size={40} className="text-white" />
              ) : (
                <Eye size={40} className="text-white" />
              )}
            </div>

            {/* Category */}
            <p className="text-white/60 text-sm mb-2">{category}</p>

            {/* Role/Word */}
            <div className="text-center px-4">
              {isSpy ? (
                <>
                  <h2 className="text-3xl font-bold text-red-400 mb-2">
                    أنت الجاسوس!
                  </h2>
                  <p className="text-white/70 text-sm">
                    حاول اكتشاف الكلمة السرية
                  </p>
                </>
              ) : isImposter ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">{word}</h2>
                  <p className="text-amber-300/70 text-sm mt-2">
                    قد تكون الحرباء!
                  </p>
                </>
              ) : (
                <h2 className="text-3xl font-bold text-white">{word}</h2>
              )}
            </div>

            {/* Game mode indicator */}
            <div
              className={`
                absolute bottom-6 px-4 py-1 rounded-full text-sm
                ${
                  isSpy
                    ? "bg-red-500/20 text-red-300"
                    : isImposter
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-purple-500/20 text-purple-300"
                }
              `}
            >
              {gameMode === "classic" ? "الجاسوس" : "الحرباء"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isRevealed ? 1 : 0 }}
        className="text-center text-white/50 text-sm mt-4"
      >
        ارفع إصبعك لإخفاء البطاقة
      </motion.p>
    </div>
  );
}
