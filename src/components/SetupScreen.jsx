import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  X,
  Users,
  Play,
  Settings,
  Clock,
  VenetianMask,
  Palette,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Minus,
  Plus,
  Trophy,
  Folder,
  Shuffle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { Button, Card, Input, Logo, Modal, PlayerName } from "./ui";

export default function SetupScreen() {
  const {
    state,
    addPlayer,
    removePlayer,
    setGameMode,
    setSubMode,
    setTimerDuration,
    setSpyCount,
    setTargetScore,
    setSelectedGenre,
    startGame,
    getAllCategories,
    resetTournament,
  } = useGame();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");
  const [vipToast, setVipToast] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

    const trimmedName = newPlayerName.trim();
    addPlayer(trimmedName);

    // Check if VIP player
    const VIP_NAMES = ["سعيد", "السعيد", "saeed", "alsaeed"];
    if (VIP_NAMES.includes(trimmedName.toLowerCase())) {
      setVipToast("وسع للباشا عشان هيلعب 🔥👑");
      setTimeout(() => setVipToast(null), 4000);
    }

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

  const targetScoreOptions = [
    { value: 100, label: "١٠٠" },
    { value: 200, label: "٢٠٠" },
    { value: 300, label: "٣٠٠" },
    { value: 500, label: "٥٠٠" },
  ];

  // Get categories based on current game mode
  const categories = getAllCategories(state.gameMode);

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

  // Calculate if there are any scores
  const hasScores = Object.values(state.scores).some((score) => score > 0);

  // Handle tournament reset - show confirmation modal
  const handleResetTournament = () => {
    setShowResetConfirm(true);
  };

  // Confirm reset and close modal
  const confirmResetTournament = () => {
    resetTournament();
    setShowResetConfirm(false);
  };

  return (
    <motion.div
      className="min-h-screen p-4 pb-8 safe-top safe-bottom"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* VIP Toast Notification */}
      <AnimatePresence>
        {vipToast && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            initial={{ scale: 0, y: -50, rotate: -10 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-6 py-4 rounded-2xl border-2 border-yellow-300 shadow-2xl shadow-orange-500/50">
              <p className="text-white text-xl font-bold drop-shadow-lg text-center whitespace-nowrap">
                {vipToast}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center pt-4 pb-6"
      >
        <Logo size="md" />
      </motion.div>

      {/* Round & Scores Banner */}
      {hasScores && (
        <motion.div variants={itemVariants}>
          <Card className="mb-4 bg-gradient-to-r from-purple-900/50 to-orange-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                <span className="font-bold">الجولة {state.roundNumber}</span>
              </div>
              <div className="text-sm text-white/60">
                الهدف: {state.targetScore} نقطة
              </div>
            </div>

            {/* Mini Scoreboard */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {state.players
                  .slice()
                  .sort(
                    (a, b) => (state.scores[b] || 0) - (state.scores[a] || 0)
                  )
                  .slice(0, 4)
                  .map((player, index) => (
                    <div
                      key={player}
                      className={`
                        px-3 py-1 rounded-full text-sm flex items-center gap-2
                        ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-dark-700/50 text-white/70"
                        }
                      `}
                    >
                      <PlayerName name={player} />
                      <span className="font-bold">
                        {state.scores[player] || 0}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

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
                      <PlayerName name={player} className="font-medium" />
                      {hasScores && (
                        <span className="text-sm text-purple-400">
                          ({state.scores[player] || 0})
                        </span>
                      )}
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

      {/* Genre/Category Selection */}
      <motion.div variants={itemVariants}>
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Folder size={20} className="text-purple-400" />
            <h2 className="text-lg font-bold">فئة الكلمات</h2>
          </div>

          <div className="relative">
            <select
              value={state.selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full p-4 rounded-xl bg-dark-700/50 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="random">🎲 عشوائي (Random)</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
            />
          </div>

          {state.selectedGenre !== "random" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-purple-400 mt-2 text-center"
            >
              سيتم استخدام فئة "{state.selectedGenre}" فقط
            </motion.p>
          )}
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

      {/* Reset Tournament Button */}
      {hasScores && (
        <motion.div variants={itemVariants}>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            icon={Trash2}
            onClick={handleResetTournament}
            className="mt-3 !bg-red-500/20 !border-red-500/50 hover:!bg-red-500/30 !text-red-400"
          >
            إنهاء الجيم
          </Button>
        </motion.div>
      )}

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

          {/* Target Score */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-yellow-400" />
              <span className="font-medium">هدف النقاط</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {targetScoreOptions.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTargetScore(value)}
                  className={`
                    p-3 rounded-xl border text-sm transition-all
                    ${
                      state.targetScore === value
                        ? "border-yellow-500 bg-yellow-500/20"
                        : "border-white/10 bg-dark-700/30"
                    }
                  `}
                >
                  {label}
                </motion.button>
              ))}
            </div>
            <p className="text-center text-white/50 text-sm mt-2">
              أول لاعب يصل إلى {state.targetScore} نقطة يفوز!
            </p>
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

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                إنهاء الجيم؟
              </h3>
              <p className="text-gray-400 text-center mb-6">
                هل أنت متأكد؟ هيتم مسح كل النقاط والبدء من جديد.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmResetTournament}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  إنهاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
