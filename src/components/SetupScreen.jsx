import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  X,
  Users,
  Play,
  Settings,
  Clock,
  UserMinus,
  VenetianMask,
  Palette,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { Button, Card, Input, Logo, Modal } from "./ui";

export default function SetupScreen() {
  const {
    state,
    addPlayer,
    removePlayer,
    setGameMode,
    setSubMode,
    setTimerDuration,
    setSpyCount,
    startGame,
  } = useGame();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      setError("الرجاء إدخال اسم اللاعب");
      return;
    }

    if (state.players.includes(newPlayerName.trim())) {
      setError("هذا الاسم موجود بالفعل");
      return;
    }

    addPlayer(newPlayerName.trim());
    setNewPlayerName("");
    setError("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  const canStartGame = state.players.length >= 3;

  const timerOptions = [
    { value: 60, label: "١ دقيقة" },
    { value: 120, label: "٢ دقيقة" },
    { value: 180, label: "٣ دقائق" },
    { value: 240, label: "٤ دقائق" },
    { value: 300, label: "٥ دقائق" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen p-4 pb-8 safe-top safe-bottom"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center pt-4 pb-6"
      >
        <Logo size="md" />
      </motion.div>

      {/* Player Input */}
      <motion.div variants={itemVariants}>
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-purple-400" />
            <h2 className="text-lg font-bold">
              اللاعبين ({state.players.length})
            </h2>
          </div>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="اسم اللاعب"
              value={newPlayerName}
              onChange={(e) => {
                setNewPlayerName(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              error={error}
              className="flex-1"
            />
            <Button
              onClick={handleAddPlayer}
              icon={UserPlus}
              size="md"
              className="shrink-0"
            />
          </div>

          {/* Player List */}
          <AnimatePresence mode="popLayout">
            {state.players.length > 0 && (
              <motion.div
                className="mt-4 space-y-2 max-h-48 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {state.players.map((player, index) => (
                  <motion.div
                    key={player}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex items-center justify-between bg-dark-700/50 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{player}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removePlayer(index)}
                      className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                      <X size={18} className="text-red-400" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {state.players.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/40 mt-4 py-4"
            >
              أضف ٣ لاعبين على الأقل للبدء
            </motion.p>
          )}

          {state.players.length > 0 && state.players.length < 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-orange-400 mt-4 text-sm"
            >
              تحتاج {3 - state.players.length} لاعب/لاعبين إضافيين للبدء
            </motion.p>
          )}
        </Card>
      </motion.div>

      {/* Game Mode Selection */}
      <motion.div variants={itemVariants}>
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-purple-400" />
            <h2 className="text-lg font-bold">نوع اللعبة</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameMode("classic")}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${
                  state.gameMode === "classic"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-dark-700/30 hover:border-white/30"
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${
                    state.gameMode === "classic"
                      ? "bg-gradient-to-br from-purple-500 to-purple-700"
                      : "bg-dark-600"
                  }
                `}
                >
                  <VenetianMask size={24} className="text-white" />
                </div>
                <span className="font-bold">الجاسوس</span>
                <span className="text-xs text-white/50">الوضع الكلاسيكي</span>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameMode("chameleon")}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${
                  state.gameMode === "chameleon"
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-white/10 bg-dark-700/30 hover:border-white/30"
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${
                    state.gameMode === "chameleon"
                      ? "bg-gradient-to-br from-orange-500 to-orange-700"
                      : "bg-dark-600"
                  }
                `}
                >
                  <Palette size={24} className="text-white" />
                </div>
                <span className="font-bold">الحرباء</span>
                <span className="text-xs text-white/50">الكلمات المتشابهة</span>
              </div>
            </motion.button>
          </div>

          {/* Sub-mode for Classic */}
          <AnimatePresence>
            {state.gameMode === "classic" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <p className="text-sm text-white/60 mb-3">نوع الأسئلة</p>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSubMode("freeTalk")}
                    className={`
                      p-3 rounded-xl border transition-all flex items-center gap-2
                      ${
                        state.subMode === "freeTalk"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-dark-700/30"
                      }
                    `}
                  >
                    <MessageCircle size={18} />
                    <span className="text-sm">حوار حر</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSubMode("directed")}
                    className={`
                      p-3 rounded-xl border transition-all flex items-center gap-2
                      ${
                        state.subMode === "directed"
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-dark-700/30"
                      }
                    `}
                  >
                    <HelpCircle size={18} />
                    <span className="text-sm">أسئلة موجهة</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Settings Button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="secondary"
          fullWidth
          icon={Settings}
          onClick={() => setShowSettings(true)}
          className="mb-4"
        >
          إعدادات اللعبة
        </Button>
      </motion.div>

      {/* Start Button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="primary"
          size="xl"
          fullWidth
          icon={Play}
          onClick={startGame}
          disabled={!canStartGame}
          className="mt-4"
        >
          ابدأ اللعب
        </Button>
      </motion.div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="إعدادات اللعبة"
      >
        <div className="space-y-6">
          {/* Timer Duration */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-purple-400" />
              <span className="font-medium">مدة اللعب</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timerOptions.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimerDuration(value)}
                  className={`
                    p-3 rounded-xl border text-sm transition-all
                    ${
                      state.timerDuration === value
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-white/10 bg-dark-700/30"
                    }
                  `}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Spy Count (only for classic mode) */}
          {state.gameMode === "classic" && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <VenetianMask size={20} className="text-purple-400" />
                <span className="font-medium">عدد الجواسيس</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSpyCount(Math.max(1, state.spyCount - 1))}
                  disabled={state.spyCount <= 1}
                  className={`
                    w-12 h-12 rounded-full border flex items-center justify-center
                    ${
                      state.spyCount <= 1
                        ? "border-white/10 text-white/30"
                        : "border-purple-500 bg-purple-500/20 text-white"
                    }
                  `}
                >
                  <Minus size={20} />
                </motion.button>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
                  <span className="text-2xl font-bold">{state.spyCount}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setSpyCount(
                      Math.min(
                        Math.floor(state.players.length / 2),
                        state.spyCount + 1
                      )
                    )
                  }
                  disabled={
                    state.spyCount >= Math.floor(state.players.length / 2)
                  }
                  className={`
                    w-12 h-12 rounded-full border flex items-center justify-center
                    ${
                      state.spyCount >= Math.floor(state.players.length / 2)
                        ? "border-white/10 text-white/30"
                        : "border-purple-500 bg-purple-500/20 text-white"
                    }
                  `}
                >
                  <Plus size={20} />
                </motion.button>
              </div>
              <p className="text-center text-white/50 text-sm mt-2">
                الحد الأقصى: {Math.max(1, Math.floor(state.players.length / 2))}{" "}
                جاسوس
              </p>
            </div>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={() => setShowSettings(false)}
          >
            حفظ
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
