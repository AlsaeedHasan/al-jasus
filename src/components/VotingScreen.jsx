import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Check,
  ChevronRight,
  Users,
  AlertCircle,
  Fingerprint,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { Button, Card } from "./ui";

export default function VotingScreen() {
  const { state, castVote, completeVoting, setScreen } = useGame();

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [phase, setPhase] = useState("voting"); // 'voting' | 'confirm' | 'done'

  const currentVoter = state.players[currentVoterIndex];
  const isLastVoter = currentVoterIndex === state.players.length - 1;

  // Get players who can be voted for (excluding current voter)
  const votablePlayer = useMemo(() => {
    return state.players.filter((p) => p !== currentVoter);
  }, [state.players, currentVoter]);

  const handleSelectSuspect = (suspect) => {
    setSelectedSuspect(suspect);
  };

  const handleConfirmVote = () => {
    if (!selectedSuspect) return;

    castVote(currentVoter, selectedSuspect);

    if (isLastVoter) {
      completeVoting();
      setScreen("results");
    } else {
      setSelectedSuspect(null);
      setPhase("waiting");
    }
  };

  const handleNextVoter = () => {
    setCurrentVoterIndex((prev) => prev + 1);
    setPhase("voting");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col p-4 safe-top safe-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Vote size={20} className="text-purple-400" />
            <span className="font-bold">التصويت</span>
          </div>
          <span className="text-white/60 text-sm">
            {currentVoterIndex + 1} / {state.players.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
            animate={{
              width: `${
                ((currentVoterIndex + 1) / state.players.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "voting" && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Current Voter */}
            <Card className="mb-6 text-center">
              <p className="text-white/60 text-sm mb-1">دور التصويت</p>
              <h2 className="text-2xl font-bold gradient-text">
                {currentVoter}
              </h2>
              <p className="text-white/40 text-sm mt-2">من تشك أنه الجاسوس؟</p>
            </Card>

            {/* Player List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 space-y-3 overflow-y-auto"
            >
              {votablePlayer.map((player, index) => (
                <motion.button
                  key={player}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectSuspect(player)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all
                    flex items-center justify-between
                    ${
                      selectedSuspect === player
                        ? "border-orange-500 bg-orange-500/20"
                        : "border-white/10 bg-dark-700/30 hover:border-white/30"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${
                        selectedSuspect === player
                          ? "bg-gradient-to-br from-orange-500 to-red-500"
                          : "bg-dark-600"
                      }
                    `}
                    >
                      <Fingerprint
                        size={20}
                        className={
                          selectedSuspect === player
                            ? "text-white"
                            : "text-purple-400"
                        }
                      />
                    </div>
                    <span className="font-medium text-lg">{player}</span>
                  </div>

                  {selectedSuspect === player && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"
                    >
                      <Check size={18} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Confirm Button */}
            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={ChevronRight}
                iconPosition="end"
                onClick={handleConfirmVote}
                disabled={!selectedSuspect}
              >
                تأكيد التصويت
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users size={40} className="text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2 text-center">
              تم تسجيل صوت {currentVoter}
            </h2>

            <p className="text-white/60 mb-8 text-center">
              مرر الجهاز إلى {state.players[currentVoterIndex + 1]}
            </p>

            <Button variant="primary" size="lg" onClick={handleNextVoter}>
              أنا {state.players[currentVoterIndex + 1]} - جاهز
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
