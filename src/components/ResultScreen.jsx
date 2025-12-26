import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  X,
  RotateCcw,
  Home,
  Eye,
  Target,
  Check,
  Frown,
  PartyPopper,
  Skull,
  VenetianMask,
  Palette,
  CheckCircle,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { Button, Card, Modal } from "./ui";

export default function ResultScreen() {
  const {
    state,
    getMostVotedPlayer,
    setSpyGuess,
    setGameResult,
    resetGame,
    setScreen,
    getAllLocationsForCategory,
  } = useGame();

  const [phase, setPhase] = useState("reveal"); // 'reveal' | 'spy_guess' | 'final'
  const [showVotes, setShowVotes] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [revealAnimation, setRevealAnimation] = useState(false);

  const mostVoted = getMostVotedPlayer();
  const locations = getAllLocationsForCategory();

  // Calculate vote counts
  const voteCounts = useMemo(() => {
    const counts = {};
    Object.values(state.votes).forEach((suspect) => {
      counts[suspect] = (counts[suspect] || 0) + 1;
    });
    return counts;
  }, [state.votes]);

  // Determine if the spy/imposter was caught
  const isSpy = useMemo(() => {
    if (state.gameMode === "classic") {
      return state.spyIndices.some(
        (idx) => state.players[idx] === mostVoted.player
      );
    } else {
      return state.players[state.imposterIndex] === mostVoted.player;
    }
  }, [
    state.gameMode,
    state.spyIndices,
    state.imposterIndex,
    state.players,
    mostVoted.player,
  ]);

  // Get spy/imposter names for display
  const culpritNames = useMemo(() => {
    if (state.gameMode === "classic") {
      return state.spyIndices.map((idx) => state.players[idx]);
    } else {
      return [state.players[state.imposterIndex]];
    }
  }, [state.gameMode, state.spyIndices, state.imposterIndex, state.players]);

  useEffect(() => {
    // Trigger reveal animation
    setTimeout(() => setRevealAnimation(true), 500);
  }, []);

  const handleSpyGuess = (word) => {
    setSelectedGuess(word);
  };

  const handleConfirmGuess = () => {
    setSpyGuess(selectedGuess);

    const isCorrectGuess = selectedGuess === state.selectedWord;

    if (isCorrectGuess) {
      setGameResult("spy_guessed");
    } else {
      setGameResult("spy_caught");
    }

    setPhase("final");
  };

  const handleSkipGuess = () => {
    setGameResult("spy_caught");
    setPhase("final");
  };

  const handleContinueAfterReveal = () => {
    // In classic mode, if spy was caught, give them a chance to guess
    if (state.gameMode === "classic" && isSpy) {
      setPhase("spy_guess");
    } else {
      // Determine final result
      if (isSpy) {
        setGameResult(
          state.gameMode === "classic" ? "spy_caught" : "imposter_caught"
        );
      } else {
        setGameResult(
          state.gameMode === "classic" ? "spy_escaped" : "imposter_escaped"
        );
      }
      setPhase("final");
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    setScreen("home");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col p-4 safe-top safe-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">
        {/* Phase 1: Reveal who was voted */}
        {phase === "reveal" && (
          <motion.div
            key="reveal"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">نتيجة التصويت</h1>
              <p className="text-white/60">من حصل على أكثر الأصوات؟</p>
            </motion.div>

            {/* Most Voted Player */}
            <motion.div
              variants={itemVariants}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: revealAnimation ? 1 : 0,
                  rotate: revealAnimation ? 0 : -180,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className={`
                  w-32 h-32 rounded-full mb-6 flex items-center justify-center
                  ${
                    isSpy
                      ? "bg-gradient-to-br from-red-600 to-red-400"
                      : "bg-gradient-to-br from-green-600 to-green-400"
                  }
                  card-shadow
                `}
              >
                {isSpy ? (
                  <Target size={56} className="text-white" />
                ) : (
                  <Frown size={56} className="text-white" />
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: revealAnimation ? 1 : 0,
                  y: revealAnimation ? 0 : 20,
                }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold mb-2"
              >
                {mostVoted.player}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: revealAnimation ? 1 : 0 }}
                transition={{ delay: 0.7 }}
                className="text-white/60 mb-4"
              >
                حصل على {mostVoted.votes} صوت
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: revealAnimation ? 1 : 0,
                  scale: revealAnimation ? 1 : 0.9,
                }}
                transition={{ delay: 0.9 }}
                className={`
                  px-6 py-3 rounded-full text-lg font-bold
                  ${
                    isSpy
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }
                `}
              >
                {isSpy ? (
                  <span className="flex items-center gap-2">
                    {state.gameMode === "classic" ? (
                      <>
                        <VenetianMask size={20} className="inline" /> هو
                        الجاسوس!
                      </>
                    ) : (
                      <>
                        <Palette size={20} className="inline" /> هو الحرباء!
                      </>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={20} className="inline" /> بريء!
                  </span>
                )}
              </motion.div>

              {/* Actual Spy/Imposter if wrong guess */}
              {!isSpy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealAnimation ? 1 : 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 text-center"
                >
                  <p className="text-white/60 mb-2">
                    {state.gameMode === "classic"
                      ? "الجاسوس الحقيقي:"
                      : "الحرباء الحقيقية:"}
                  </p>
                  <p className="text-xl font-bold text-orange-400">
                    {culpritNames.join("، ")}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Show Votes Button */}
            <motion.div variants={itemVariants} className="space-y-3">
              <Button
                variant="secondary"
                fullWidth
                icon={Eye}
                onClick={() => setShowVotes(true)}
              >
                عرض جميع الأصوات
              </Button>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleContinueAfterReveal}
              >
                {state.gameMode === "classic" && isSpy
                  ? "فرصة الجاسوس"
                  : "النتيجة النهائية"}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Spy's Chance to Guess (Classic Mode Only) */}
        {phase === "spy_guess" && (
          <motion.div
            key="spy_guess"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                <VenetianMask size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">فرصة الجاسوس!</h1>
              <p className="text-white/60">
                {culpritNames[0]}، خمن الكلمة الصحيحة للفوز!
              </p>
            </div>

            <Card className="mb-4">
              <p className="text-center text-white/60 mb-2">الفئة</p>
              <p className="text-center text-xl font-bold text-purple-400">
                {state.selectedCategory}
              </p>
            </Card>

            {/* Location Options */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {locations.map((location) => (
                  <motion.button
                    key={location}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSpyGuess(location)}
                    className={`
                      p-3 rounded-xl border-2 text-sm transition-all
                      ${
                        selectedGuess === location
                          ? "border-orange-500 bg-orange-500/20"
                          : "border-white/10 bg-dark-700/30"
                      }
                    `}
                  >
                    {location}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={Check}
                onClick={handleConfirmGuess}
                disabled={!selectedGuess}
              >
                تأكيد الاختيار
              </Button>

              <Button variant="ghost" fullWidth onClick={handleSkipGuess}>
                تخطي - أقبل الخسارة
              </Button>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Final Result */}
        {phase === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Winner Announcement */}
            {state.gameResult === "spy_guessed" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-6 card-shadow"
                >
                  <Trophy size={56} className="text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center mb-2"
                >
                  🎉 فوز الجاسوس! 🎉
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-center mb-4"
                >
                  {culpritNames[0]} خمن الكلمة الصحيحة!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30"
                >
                  <p className="text-green-300 font-bold text-xl">
                    {state.selectedWord}
                  </p>
                </motion.div>
              </>
            ) : state.gameResult === "spy_caught" ||
              state.gameResult === "imposter_caught" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 card-shadow"
                >
                  <PartyPopper size={56} className="text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center mb-2"
                >
                  🏆 فوز المواطنين! 🏆
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-center mb-4"
                >
                  تم القبض على{" "}
                  {state.gameMode === "classic" ? "الجاسوس" : "الحرباء"}!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <p className="text-white/60 mb-2">الكلمة السرية كانت:</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {state.gameMode === "classic"
                      ? state.selectedWord
                      : state.selectedPair?.distinct}
                  </p>

                  {state.gameMode === "chameleon" && (
                    <div className="mt-4">
                      <p className="text-white/60 mb-1">كلمة الحرباء كانت:</p>
                      <p className="text-lg font-bold text-orange-400">
                        {state.selectedPair?.imposter}
                      </p>
                    </div>
                  )}
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center mb-6 card-shadow"
                >
                  <Skull size={56} className="text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-2"
                >
                  {state.gameMode === "classic" ? (
                    <>
                      <VenetianMask size={28} className="text-red-400" /> فوز
                      الجاسوس!{" "}
                      <VenetianMask size={28} className="text-red-400" />
                    </>
                  ) : (
                    <>
                      <Palette size={28} className="text-orange-400" /> فوز
                      الحرباء! <Palette size={28} className="text-orange-400" />
                    </>
                  )}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-center mb-4"
                >
                  {state.gameMode === "classic"
                    ? "الجاسوس نجا!"
                    : "الحرباء نجت!"}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center"
                >
                  <p className="text-white/60 mb-2">
                    {state.gameMode === "classic"
                      ? "الجاسوس كان:"
                      : "الحرباء كانت:"}
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {culpritNames.join("، ")}
                  </p>
                </motion.div>
              </>
            )}

            {/* Play Again Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-12 w-full space-y-3"
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={RotateCcw}
                onClick={handlePlayAgain}
              >
                لعب مرة أخرى
              </Button>

              <Button
                variant="ghost"
                fullWidth
                icon={Home}
                onClick={handlePlayAgain}
              >
                العودة للرئيسية
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Votes Modal */}
      <Modal
        isOpen={showVotes}
        onClose={() => setShowVotes(false)}
        title="نتائج التصويت"
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {state.players.map((player) => (
            <div
              key={player}
              className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    voteCounts[player] > 0
                      ? "bg-gradient-to-br from-orange-500 to-red-500"
                      : "bg-dark-600"
                  }
                `}
                >
                  <span className="font-bold">{voteCounts[player] || 0}</span>
                </div>
                <span className="font-medium">{player}</span>
              </div>

              {player === mostVoted.player && (
                <span className="text-red-400 text-sm">الأكثر</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm text-center">تفاصيل التصويت</p>
          <div className="mt-2 space-y-1">
            {Object.entries(state.votes).map(([voter, suspect]) => (
              <p key={voter} className="text-sm text-white/40">
                {voter} صوّت ضد {suspect}
              </p>
            ))}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
