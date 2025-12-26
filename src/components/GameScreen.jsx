import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Hand,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { Button, Card, Timer, RoleCard, PlayerName } from "./ui";

// Distribution Screen - Pass and Play
function DistributionScreen() {
  const { state, nextPlayer, setScreen, getPlayerRole, getPlayerWord } =
    useGame();

  const [phase, setPhase] = useState("waiting"); // 'waiting' | 'card'
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isLastPlayer = state.currentPlayerIndex === state.players.length - 1;
  const role = getPlayerRole(state.currentPlayerIndex);
  const word = getPlayerWord(state.currentPlayerIndex);

  // Handle hold to reveal
  const handleHold = useCallback(() => {
    setIsRevealed(true);
  }, []);

  // Handle release to hide
  const handleRelease = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handleNext = () => {
    if (isLastPlayer) {
      setScreen("gameplay");
    } else {
      setPhase("waiting");
      setIsRevealed(false);
      nextPlayer();
    }
  };

  const handleReady = () => {
    setPhase("card");
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col p-4 safe-top safe-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>توزيع الأدوار</span>
          <span>
            {state.currentPlayerIndex + 1} / {state.players.length}
          </span>
        </div>
        <div className="h-2 bg-[#1e1b4b] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((state.currentPlayerIndex + 1) / state.players.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center w-full"
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(168, 85, 247, 0.5)",
                    "0 0 40px rgba(249, 115, 22, 0.5)",
                    "0 0 20px rgba(168, 85, 247, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Hand size={40} className="text-white" />
              </motion.div>

              <motion.h2
                className="text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                مرر الجهاز إلى
              </motion.h2>

              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PlayerName name={currentPlayer} />
              </motion.div>

              <motion.p
                className="text-white/60 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                تأكد أن لا أحد يرى الشاشة
              </motion.p>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleReady}
              >
                أنا {currentPlayer} - جاهز
              </Button>
            </motion.div>
          )}

          {phase === "card" && (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full"
            >
              <RoleCard
                playerName={currentPlayer}
                role={role}
                word={word}
                category={state.selectedCategory}
                isRevealed={isRevealed}
                onHold={handleHold}
                onRelease={handleRelease}
                gameMode={state.gameMode}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={isLastPlayer ? Play : ArrowRight}
                  iconPosition="end"
                  onClick={handleNext}
                >
                  {isLastPlayer ? "بدء اللعب" : "التالي"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Gameplay Screen
function GameplayScreen() {
  const {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    setScreen,
    generateNewQuestionPair,
  } = useGame();

  const [showPauseOverlay, setShowPauseOverlay] = useState(false);

  useEffect(() => {
    // Start timer when entering gameplay
    startTimer();

    // Generate first question pair if directed mode
    if (state.subMode === "directed") {
      generateNewQuestionPair();
    }

    return () => pauseTimer();
  }, []);

  useEffect(() => {
    // Check if timer ended
    if (state.timeRemaining === 0 && state.isTimerRunning) {
      pauseTimer();
      setScreen("voting");
    }
  }, [state.timeRemaining, state.isTimerRunning]);

  const handlePause = () => {
    pauseTimer();
    setShowPauseOverlay(true);
  };

  const handleResume = () => {
    startTimer();
    setShowPauseOverlay(false);
  };

  const handleNextQuestion = () => {
    generateNewQuestionPair();
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col p-4 safe-top safe-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-white/60">
          <span className="text-sm">الفئة:</span>
          <span className="text-white font-medium">
            {state.selectedCategory}
          </span>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
          {state.gameMode === "classic" ? "الجاسوس" : "الحرباء"}
        </div>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <Timer
          timeRemaining={state.timeRemaining}
          totalTime={state.timerDuration}
          isRunning={state.isTimerRunning}
          size="lg"
        />

        {/* Directed Questions */}
        {state.subMode === "directed" && state.currentAsker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full"
          >
            <Card className="text-center">
              <p className="text-white/60 text-sm mb-2">الدور الحالي</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl font-bold text-purple-400">
                  <PlayerName name={state.currentAsker} />
                </span>
                <ArrowLeft size={24} className="text-orange-400" />
                <span className="text-xl font-bold text-orange-400">
                  <PlayerName name={state.currentTarget} />
                </span>
              </div>
              <p className="text-white/40 text-sm mt-2">
                <PlayerName name={state.currentAsker} /> يسأل{" "}
                <PlayerName name={state.currentTarget} />
              </p>

              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={handleNextQuestion}
              >
                سؤال جديد
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Free Talk Mode */}
        {state.subMode === "freeTalk" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-white/60">تحدثوا عن الكلمة السرية!</p>
            <p className="text-white/40 text-sm mt-1">حاولوا اكتشاف الجاسوس</p>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            icon={state.isTimerRunning ? Pause : Play}
            onClick={state.isTimerRunning ? handlePause : handleResume}
          >
            {state.isTimerRunning ? "إيقاف" : "استمرار"}
          </Button>

          <Button variant="secondary" icon={RotateCcw} onClick={resetTimer}>
            إعادة
          </Button>
        </div>

        <Button
          variant="danger"
          fullWidth
          size="lg"
          icon={AlertTriangle}
          onClick={() => {
            pauseTimer();
            setScreen("voting");
          }}
        >
          اجتماع طارئ - التصويت
        </Button>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {showPauseOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="text-center"
            >
              <Pause size={64} className="mx-auto mb-6 text-purple-400" />
              <h2 className="text-3xl font-bold mb-2">اللعبة متوقفة</h2>
              <p className="text-white/60 mb-8">
                الوقت المتبقي: {Math.floor(state.timeRemaining / 60)}:
                {String(state.timeRemaining % 60).padStart(2, "0")}
              </p>

              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={handleResume}
              >
                استمرار
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Game Screen Component
export default function GameScreen() {
  const { state } = useGame();

  if (state.currentScreen === "distribution") {
    return <DistributionScreen />;
  }

  return <GameplayScreen />;
}
