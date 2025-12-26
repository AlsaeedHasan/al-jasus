import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameProvider, useGame } from "./context/GameContext";
import SetupScreen from "./components/SetupScreen";
import GameScreen from "./components/GameScreen";
import VotingScreen from "./components/VotingScreen";
import ResultScreen from "./components/ResultScreen";
import SplashScreen from "./components/SplashScreen";

// Screen wrapper with animations
function ScreenWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

// Main Game Router
function GameRouter() {
  const { state } = useGame();

  return (
    <AnimatePresence mode="wait">
      {state.currentScreen === "home" && (
        <ScreenWrapper key="home">
          <SetupScreen />
        </ScreenWrapper>
      )}

      {(state.currentScreen === "distribution" ||
        state.currentScreen === "gameplay") && (
        <ScreenWrapper key="game">
          <GameScreen />
        </ScreenWrapper>
      )}

      {state.currentScreen === "voting" && (
        <ScreenWrapper key="voting">
          <VotingScreen />
        </ScreenWrapper>
      )}

      {state.currentScreen === "results" && (
        <ScreenWrapper key="results">
          <ResultScreen />
        </ScreenWrapper>
      )}
    </AnimatePresence>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GameProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <motion.div
            key="main"
            className="min-h-screen py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GameRouter />
          </motion.div>
        )}
      </AnimatePresence>
    </GameProvider>
  );
}

export default App;
