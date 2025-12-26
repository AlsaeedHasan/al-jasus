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
  Crown,
  ArrowRight,
  Medal,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { Button, Card, Modal, PlayerName } from "./ui";

export default function ResultScreen() {
  const {
    state,
    getMostVotedPlayer,
    setSpyGuess,
    setGameResult,
    calculateRoundScores,
    startNextRound,
    resetTournament,
    setScreen,
    getAllLocationsForCategory,
  } = useGame();

  const [phase, setPhase] = useState("reveal"); // 'reveal' | 'spy_guess' | 'scores' | 'final' | 'winner'
  const [showVotes, setShowVotes] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [revealAnimation, setRevealAnimation] = useState(false);
  const [scoresCalculated, setScoresCalculated] = useState(false);

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

  // Sorted leaderboard
  const leaderboard = useMemo(() => {
    return state.players
      .map((player) => ({
        name: player,
        score: state.scores[player] || 0,
        roundPoints: state.roundScores[player] || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [state.players, state.scores, state.roundScores]);

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
    const result = isCorrectGuess ? "spy_guessed" : "spy_caught";

    setGameResult(result);
    calculateRoundScores(result);
    setScoresCalculated(true);
    setPhase("scores");
  };

  const handleSkipGuess = () => {
    setGameResult("spy_caught");
    calculateRoundScores("spy_caught");
    setScoresCalculated(true);
    setPhase("scores");
  };

  const handleContinueAfterReveal = () => {
    // In classic mode, if spy was caught, give them a chance to guess
    if (state.gameMode === "classic" && isSpy) {
      setPhase("spy_guess");
    } else {
      // Determine final result
      const result = isSpy
        ? state.gameMode === "classic"
          ? "spy_caught"
          : "imposter_caught"
        : state.gameMode === "classic"
        ? "spy_escaped"
        : "imposter_escaped";

      setGameResult(result);
      calculateRoundScores(result);
      setScoresCalculated(true);
      setPhase("scores");
    }
  };

  const handleContinueAfterScores = () => {
    // Check if there's a winner
    if (state.gameWinner) {
      setPhase("winner");
    } else {
      setPhase("final");
    }
  };

  const handleNextRound = () => {
    startNextRound();
  };

  const handleNewTournament = () => {
    resetTournament();
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
                  : "عرض النتائج"}
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

        {/* Phase 3: Scores/Leaderboard */}
        {phase === "scores" && (
          <motion.div
            key="scores"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Trophy size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">نتائج الجولة</h1>
              <p className="text-white/60">الجولة {state.roundNumber}</p>
            </div>

            {/* Round Result Summary */}
            <Card className="mb-4 text-center">
              <p className="text-white/60 mb-2">
                {state.gameResult === "spy_guessed"
                  ? "الجاسوس خمن الكلمة الصحيحة!"
                  : state.gameResult === "spy_caught" ||
                    state.gameResult === "imposter_caught"
                  ? "تم القبض على الجاسوس!"
                  : "الجاسوس نجا!"}
              </p>
              <p className="text-lg font-bold text-purple-400">
                الكلمة:{" "}
                {state.gameMode === "classic"
                  ? state.selectedWord
                  : state.selectedPair?.distinct}
              </p>
            </Card>

            {/* Leaderboard */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Medal size={20} className="text-yellow-400" />
                لوحة المتصدرين
              </h3>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <motion.div
                    key={player.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      flex items-center justify-between p-4 rounded-xl
                      ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                          : index === 2
                          ? "bg-gradient-to-r from-amber-700/20 to-amber-600/20 border border-amber-600/30"
                          : "bg-dark-700/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold
                        ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                            ? "bg-gray-400 text-black"
                            : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-dark-600 text-white"
                        }
                      `}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold">
                          <PlayerName name={player.name} />
                        </p>
                        {player.roundPoints > 0 && (
                          <p className="text-sm text-green-400">
                            +{player.roundPoints} هذه الجولة
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold">{player.score}</p>
                      <p className="text-xs text-white/50">نقطة</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Target Score Progress */}
            <Card className="mt-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">الهدف</span>
                <span className="font-bold">{state.targetScore} نقطة</span>
              </div>
              <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      ((leaderboard[0]?.score || 0) / state.targetScore) * 100
                    )}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-center text-white/50 text-sm mt-2">
                <PlayerName name={leaderboard[0]?.name} /> في المقدمة بـ{" "}
                {leaderboard[0]?.score} نقطة
              </p>
            </Card>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              iconPosition="end"
              onClick={handleContinueAfterScores}
            >
              متابعة
            </Button>
          </motion.div>
        )}

        {/* Phase 4: Final Result (No Winner Yet) */}
        {phase === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Result Icon */}
            {state.gameResult === "spy_guessed" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-6 card-shadow"
                >
                  <VenetianMask size={56} className="text-white" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center mb-2"
                >
                  فوز الجاسوس!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-center mb-4"
                >
                  {culpritNames[0]} خمن الكلمة الصحيحة!
                </motion.p>
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
                  فوز المواطنين!
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
                      الجاسوس!
                    </>
                  ) : (
                    <>
                      <Palette size={28} className="text-orange-400" /> فوز
                      الحرباء!
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
              </>
            )}

            {/* Next Round Button */}
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
                onClick={handleNextRound}
              >
                الجولة التالية
              </Button>

              <Button
                variant="ghost"
                fullWidth
                icon={Home}
                onClick={handleNewTournament}
              >
                جيم جديد
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 5: Grand Winner */}
        {phase === "winner" && (
          <motion.div
            key="winner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Confetti Effect (visual only) */}
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    background: `hsl(${Math.random() * 360}, 80%, 60%)`,
                  }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{
                    y: "100vh",
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>

            {/* Crown */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="mb-4"
            >
              <Crown size={60} className="text-yellow-400" />
            </motion.div>

            {/* Winner Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center mb-6 card-shadow"
              style={{
                boxShadow:
                  "0 0 60px rgba(234, 179, 8, 0.5), 0 0 100px rgba(249, 115, 22, 0.3)",
              }}
            >
              <Trophy size={70} className="text-white" />
            </motion.div>

            {/* Winner Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-center mb-2 gradient-text"
            >
              <PlayerName name={state.gameWinner} />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-bold text-yellow-400 mb-2"
            >
              🏆 الفائز! 🏆
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/60 text-center mb-8"
            >
              وصل إلى {state.scores[state.gameWinner]} نقطة!
            </motion.p>

            {/* Final Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="w-full mb-8"
            >
              <Card>
                <h3 className="text-center font-bold mb-3">الترتيب النهائي</h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((player, index) => (
                    <div
                      key={player.name}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                          ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                              ? "bg-gray-400 text-black"
                              : index === 2
                              ? "bg-amber-600 text-white"
                              : "bg-dark-600 text-white"
                          }
                        `}
                        >
                          {index + 1}
                        </span>
                        <PlayerName name={player.name} />
                      </div>
                      <span className="font-bold">{player.score}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* New Tournament Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="w-full"
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={RotateCcw}
                onClick={handleNewTournament}
              >
                جيم جديد
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
