import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { gameData } from "../data/words";

// App version for localStorage migration
const CURRENT_VERSION = "v2.0";

// Helper functions for game data
const getRandomCategory = (mode) => {
  const categories = gameData[mode];
  return categories[Math.floor(Math.random() * categories.length)];
};

const getRandomWord = (category) => {
  return category.words[Math.floor(Math.random() * category.words.length)];
};

const getRandomPair = (category) => {
  return category.pairs[Math.floor(Math.random() * category.pairs.length)];
};

const getCategoryByName = (mode, categoryName) => {
  return gameData[mode].find((c) => c.category === categoryName);
};

// Get all category names for a mode
const getAllCategories = (mode) => {
  return gameData[mode].map((c) => c.category);
};

// Helper to safely get from localStorage
const getStoredPlayers = () => {
  try {
    const stored = localStorage.getItem("aljasus_players");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading players from localStorage:", e);
  }
  return [];
};

const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem("aljasus_settings");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading settings from localStorage:", e);
  }
  return null;
};

const getStoredScores = () => {
  try {
    const stored = localStorage.getItem("aljasus_scores");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading scores from localStorage:", e);
  }
  return {};
};

// Create initial state with localStorage values (lazy initialization)
const createInitialState = () => {
  const storedPlayers = getStoredPlayers();
  const storedSettings = getStoredSettings();
  const storedScores = getStoredScores();

  return {
    // Player Management - LOAD FROM STORAGE
    players: storedPlayers,

    // Game Settings - LOAD FROM STORAGE
    gameMode: storedSettings?.gameMode || "classic",
    subMode: storedSettings?.subMode || "freeTalk",
    timerDuration: storedSettings?.timerDuration || 180,
    spyCount: storedSettings?.spyCount || 1,
    targetScore: storedSettings?.targetScore || 200,
    selectedGenre: storedSettings?.selectedGenre || "random",

    // Scoring System
    scores: storedScores,
    roundNumber: 1,

    // Current Game State
    currentScreen: "home",
    currentPlayerIndex: 0,
    selectedCategory: null,
    selectedWord: null,
    selectedPair: null,
    spyIndices: [],
    imposterIndex: null,

    // Gameplay State
    timeRemaining: storedSettings?.timerDuration || 180,
    isTimerRunning: false,
    currentAsker: null,
    currentTarget: null,
    questionHistory: [],

    // Voting
    votes: {},
    votingComplete: false,

    // Results
    spyGuess: null,
    gameResult: null,
    roundScores: {}, // Points earned this round
    gameWinner: null, // Player who reached target score
  };
};

// Action Types
const ACTIONS = {
  SET_PLAYERS: "SET_PLAYERS",
  ADD_PLAYER: "ADD_PLAYER",
  REMOVE_PLAYER: "REMOVE_PLAYER",
  SET_GAME_MODE: "SET_GAME_MODE",
  SET_SUB_MODE: "SET_SUB_MODE",
  SET_TIMER_DURATION: "SET_TIMER_DURATION",
  SET_SPY_COUNT: "SET_SPY_COUNT",
  SET_TARGET_SCORE: "SET_TARGET_SCORE",
  SET_SELECTED_GENRE: "SET_SELECTED_GENRE",
  START_GAME: "START_GAME",
  SET_SCREEN: "SET_SCREEN",
  NEXT_PLAYER: "NEXT_PLAYER",
  START_TIMER: "START_TIMER",
  PAUSE_TIMER: "PAUSE_TIMER",
  TICK_TIMER: "TICK_TIMER",
  RESET_TIMER: "RESET_TIMER",
  SET_QUESTION_PAIR: "SET_QUESTION_PAIR",
  ADD_TO_QUESTION_HISTORY: "ADD_TO_QUESTION_HISTORY",
  CAST_VOTE: "CAST_VOTE",
  COMPLETE_VOTING: "COMPLETE_VOTING",
  SET_SPY_GUESS: "SET_SPY_GUESS",
  SET_GAME_RESULT: "SET_GAME_RESULT",
  CALCULATE_ROUND_SCORES: "CALCULATE_ROUND_SCORES",
  START_NEXT_ROUND: "START_NEXT_ROUND",
  RESET_GAME: "RESET_GAME",
  RESET_TOURNAMENT: "RESET_TOURNAMENT",
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PLAYERS:
      return { ...state, players: action.payload };

    case ACTIONS.ADD_PLAYER: {
      if (state.players.includes(action.payload) || !action.payload.trim()) {
        return state;
      }
      const newPlayers = [...state.players, action.payload.trim()];
      // Initialize score for new player
      const newScores = { ...state.scores, [action.payload.trim()]: 0 };
      return { ...state, players: newPlayers, scores: newScores };
    }

    case ACTIONS.REMOVE_PLAYER: {
      const playerToRemove = state.players[action.payload];
      const newPlayers = state.players.filter(
        (_, index) => index !== action.payload
      );
      // Remove score for deleted player
      const newScores = { ...state.scores };
      delete newScores[playerToRemove];
      // Immediately update localStorage
      localStorage.setItem("aljasus_players", JSON.stringify(newPlayers));
      localStorage.setItem("aljasus_scores", JSON.stringify(newScores));
      return { ...state, players: newPlayers, scores: newScores };
    }

    case ACTIONS.SET_GAME_MODE:
      return { ...state, gameMode: action.payload, selectedGenre: "random" };

    case ACTIONS.SET_SUB_MODE:
      return { ...state, subMode: action.payload };

    case ACTIONS.SET_TIMER_DURATION:
      return {
        ...state,
        timerDuration: action.payload,
        timeRemaining: action.payload,
      };

    case ACTIONS.SET_SPY_COUNT:
      return { ...state, spyCount: action.payload };

    case ACTIONS.SET_TARGET_SCORE:
      return { ...state, targetScore: action.payload };

    case ACTIONS.SET_SELECTED_GENRE:
      return { ...state, selectedGenre: action.payload };

    case ACTIONS.START_GAME: {
      const { category, word, pair, spyIndices, imposterIndex } =
        action.payload;
      // Initialize scores for all players if not exists
      const initialScores = { ...state.scores };
      state.players.forEach((player) => {
        if (initialScores[player] === undefined) {
          initialScores[player] = 0;
        }
      });
      return {
        ...state,
        currentScreen: "distribution",
        currentPlayerIndex: 0,
        selectedCategory: category,
        selectedWord: word,
        selectedPair: pair,
        spyIndices: spyIndices || [],
        imposterIndex: imposterIndex,
        timeRemaining: state.timerDuration,
        votes: {},
        votingComplete: false,
        spyGuess: null,
        gameResult: null,
        questionHistory: [],
        roundScores: {},
        scores: initialScores,
      };
    }

    case ACTIONS.SET_SCREEN:
      return { ...state, currentScreen: action.payload };

    case ACTIONS.NEXT_PLAYER:
      return {
        ...state,
        currentPlayerIndex: state.currentPlayerIndex + 1,
      };

    case ACTIONS.START_TIMER:
      return { ...state, isTimerRunning: true };

    case ACTIONS.PAUSE_TIMER:
      return { ...state, isTimerRunning: false };

    case ACTIONS.TICK_TIMER:
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
      };

    case ACTIONS.RESET_TIMER:
      return {
        ...state,
        timeRemaining: state.timerDuration,
        isTimerRunning: false,
      };

    case ACTIONS.SET_QUESTION_PAIR:
      return {
        ...state,
        currentAsker: action.payload.asker,
        currentTarget: action.payload.target,
      };

    case ACTIONS.ADD_TO_QUESTION_HISTORY:
      return {
        ...state,
        questionHistory: [...state.questionHistory, action.payload],
      };

    case ACTIONS.CAST_VOTE:
      return {
        ...state,
        votes: {
          ...state.votes,
          [action.payload.voter]: action.payload.suspect,
        },
      };

    case ACTIONS.COMPLETE_VOTING:
      return { ...state, votingComplete: true };

    case ACTIONS.SET_SPY_GUESS:
      return { ...state, spyGuess: action.payload };

    case ACTIONS.SET_GAME_RESULT:
      return { ...state, gameResult: action.payload };

    case ACTIONS.CALCULATE_ROUND_SCORES: {
      const { result, votes, spyIndices, imposterIndex, players, gameMode } =
        action.payload;
      const roundScores = {};
      const newScores = { ...state.scores };

      // Initialize round scores
      players.forEach((player) => {
        roundScores[player] = 0;
      });

      // Get the spy/imposter names
      const culpritNames =
        gameMode === "classic"
          ? spyIndices.map((idx) => players[idx])
          : [players[imposterIndex]];

      if (result === "spy_caught" || result === "imposter_caught") {
        // Citizens who voted for the spy get +100
        Object.entries(votes).forEach(([voter, suspect]) => {
          if (culpritNames.includes(suspect)) {
            roundScores[voter] = 100;
            newScores[voter] = (newScores[voter] || 0) + 100;
          }
        });
      } else if (result === "spy_guessed") {
        // Spy guessed the word correctly, spy gets +100
        culpritNames.forEach((name) => {
          roundScores[name] = 100;
          newScores[name] = (newScores[name] || 0) + 100;
        });
      } else if (result === "spy_escaped" || result === "imposter_escaped") {
        // Spy/Imposter escaped, they get +100
        culpritNames.forEach((name) => {
          roundScores[name] = 100;
          newScores[name] = (newScores[name] || 0) + 100;
        });
      }

      // Check for winner
      let gameWinner = null;
      Object.entries(newScores).forEach(([player, score]) => {
        if (score >= state.targetScore && players.includes(player)) {
          if (!gameWinner || score > newScores[gameWinner]) {
            gameWinner = player;
          }
        }
      });

      // Save scores to localStorage
      localStorage.setItem("aljasus_scores", JSON.stringify(newScores));

      return {
        ...state,
        roundScores,
        scores: newScores,
        gameWinner,
      };
    }

    case ACTIONS.START_NEXT_ROUND: {
      return {
        ...state,
        currentScreen: "home",
        currentPlayerIndex: 0,
        selectedCategory: null,
        selectedWord: null,
        selectedPair: null,
        spyIndices: [],
        imposterIndex: null,
        timeRemaining: state.timerDuration,
        votes: {},
        votingComplete: false,
        spyGuess: null,
        gameResult: null,
        questionHistory: [],
        roundScores: {},
        roundNumber: state.roundNumber + 1,
        gameWinner: null,
      };
    }

    case ACTIONS.RESET_GAME: {
      return {
        ...createInitialState(),
        players: state.players,
        gameMode: state.gameMode,
        subMode: state.subMode,
        timerDuration: state.timerDuration,
        spyCount: state.spyCount,
        targetScore: state.targetScore,
        selectedGenre: state.selectedGenre,
        timeRemaining: state.timerDuration,
        scores: state.scores,
        roundNumber: state.roundNumber,
      };
    }

    case ACTIONS.RESET_TOURNAMENT: {
      // Reset all scores to 0
      const resetScores = {};
      state.players.forEach((player) => {
        resetScores[player] = 0;
      });
      localStorage.setItem("aljasus_scores", JSON.stringify(resetScores));
      return {
        ...createInitialState(),
        players: state.players,
        gameMode: state.gameMode,
        subMode: state.subMode,
        timerDuration: state.timerDuration,
        spyCount: state.spyCount,
        targetScore: state.targetScore,
        selectedGenre: state.selectedGenre,
        timeRemaining: state.timerDuration,
        scores: resetScores,
        roundNumber: 1,
      };
    }

    default:
      return state;
  }
}

// Context
const GameContext = createContext(null);

// Provider Component
export function GameProvider({ children }) {
  // Version check - clear localStorage if version mismatch
  useEffect(() => {
    const storedVersion = localStorage.getItem("app_version");
    if (storedVersion !== CURRENT_VERSION) {
      // Clear all app data for fresh start
      localStorage.clear();
      localStorage.setItem("app_version", CURRENT_VERSION);
      // Reload to ensure clean state with new structure
      window.location.reload();
    }
  }, []);

  // Use lazy initialization - third arg is init function
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  // Track if initial load is complete to prevent overwriting localStorage on mount
  const isInitialized = useRef(false);

  // Mark as initialized after first render
  useEffect(() => {
    // Small delay to ensure we don't save on first render
    const timer = setTimeout(() => {
      isInitialized.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save players to localStorage when they change (after initialization)
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem("aljasus_players", JSON.stringify(state.players));
    }
  }, [state.players]);

  // Save settings to localStorage when they change (after initialization)
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(
        "aljasus_settings",
        JSON.stringify({
          gameMode: state.gameMode,
          subMode: state.subMode,
          timerDuration: state.timerDuration,
          spyCount: state.spyCount,
          targetScore: state.targetScore,
          selectedGenre: state.selectedGenre,
        })
      );
    }
  }, [
    state.gameMode,
    state.subMode,
    state.timerDuration,
    state.spyCount,
    state.targetScore,
    state.selectedGenre,
  ]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (state.isTimerRunning && state.timeRemaining > 0) {
      interval = setInterval(() => {
        dispatch({ type: ACTIONS.TICK_TIMER });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning, state.timeRemaining]);

  // Actions
  const actions = {
    addPlayer: useCallback((name) => {
      dispatch({ type: ACTIONS.ADD_PLAYER, payload: name });
    }, []),

    removePlayer: useCallback((index) => {
      dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: index });
    }, []),

    setGameMode: useCallback((mode) => {
      dispatch({ type: ACTIONS.SET_GAME_MODE, payload: mode });
    }, []),

    setSubMode: useCallback((mode) => {
      dispatch({ type: ACTIONS.SET_SUB_MODE, payload: mode });
    }, []),

    setTimerDuration: useCallback((duration) => {
      dispatch({ type: ACTIONS.SET_TIMER_DURATION, payload: duration });
    }, []),

    setSpyCount: useCallback((count) => {
      dispatch({ type: ACTIONS.SET_SPY_COUNT, payload: count });
    }, []),

    setTargetScore: useCallback((score) => {
      dispatch({ type: ACTIONS.SET_TARGET_SCORE, payload: score });
    }, []),

    setSelectedGenre: useCallback((genre) => {
      dispatch({ type: ACTIONS.SET_SELECTED_GENRE, payload: genre });
    }, []),

    startGame: useCallback(() => {
      const playerCount = state.players.length;

      if (state.gameMode === "classic") {
        // Get category based on selected genre
        let category;
        if (state.selectedGenre === "random") {
          category = getRandomCategory("classic");
        } else {
          category = getCategoryByName("classic", state.selectedGenre);
          if (!category) {
            category = getRandomCategory("classic");
          }
        }

        const word = getRandomWord(category);

        const spyIndices = [];
        const availableIndices = [...Array(playerCount).keys()];

        for (
          let i = 0;
          i < state.spyCount && availableIndices.length > 0;
          i++
        ) {
          const randomIdx = Math.floor(Math.random() * availableIndices.length);
          spyIndices.push(availableIndices[randomIdx]);
          availableIndices.splice(randomIdx, 1);
        }

        dispatch({
          type: ACTIONS.START_GAME,
          payload: {
            category: category.category,
            word,
            pair: null,
            spyIndices,
            imposterIndex: null,
          },
        });
      } else {
        // Get category based on selected genre
        let category;
        if (state.selectedGenre === "random") {
          category = getRandomCategory("chameleon");
        } else {
          category = getCategoryByName("chameleon", state.selectedGenre);
          if (!category) {
            category = getRandomCategory("chameleon");
          }
        }

        const pair = getRandomPair(category);
        const imposterIndex = Math.floor(Math.random() * playerCount);

        dispatch({
          type: ACTIONS.START_GAME,
          payload: {
            category: category.category,
            word: null,
            pair,
            spyIndices: [],
            imposterIndex,
          },
        });
      }
    }, [
      state.players.length,
      state.gameMode,
      state.spyCount,
      state.selectedGenre,
    ]),

    setScreen: useCallback((screen) => {
      dispatch({ type: ACTIONS.SET_SCREEN, payload: screen });
    }, []),

    nextPlayer: useCallback(() => {
      dispatch({ type: ACTIONS.NEXT_PLAYER });
    }, []),

    startTimer: useCallback(() => {
      dispatch({ type: ACTIONS.START_TIMER });
    }, []),

    pauseTimer: useCallback(() => {
      dispatch({ type: ACTIONS.PAUSE_TIMER });
    }, []),

    resetTimer: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_TIMER });
    }, []),

    generateNewQuestionPair: useCallback(() => {
      const availablePlayers = state.players.filter((p) => {
        if (state.questionHistory.length > 0) {
          const lastQuestion =
            state.questionHistory[state.questionHistory.length - 1];
          return p !== lastQuestion.asker;
        }
        return true;
      });

      const asker =
        availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      const targets = state.players.filter((p) => p !== asker);
      const target = targets[Math.floor(Math.random() * targets.length)];

      dispatch({
        type: ACTIONS.SET_QUESTION_PAIR,
        payload: { asker, target },
      });

      dispatch({
        type: ACTIONS.ADD_TO_QUESTION_HISTORY,
        payload: { asker, target },
      });
    }, [state.players, state.questionHistory]),

    castVote: useCallback((voter, suspect) => {
      dispatch({ type: ACTIONS.CAST_VOTE, payload: { voter, suspect } });
    }, []),

    completeVoting: useCallback(() => {
      dispatch({ type: ACTIONS.COMPLETE_VOTING });
    }, []),

    setSpyGuess: useCallback((guess) => {
      dispatch({ type: ACTIONS.SET_SPY_GUESS, payload: guess });
    }, []),

    setGameResult: useCallback((result) => {
      dispatch({ type: ACTIONS.SET_GAME_RESULT, payload: result });
    }, []),

    calculateRoundScores: useCallback(
      (result) => {
        dispatch({
          type: ACTIONS.CALCULATE_ROUND_SCORES,
          payload: {
            result,
            votes: state.votes,
            spyIndices: state.spyIndices,
            imposterIndex: state.imposterIndex,
            players: state.players,
            gameMode: state.gameMode,
          },
        });
      },
      [
        state.votes,
        state.spyIndices,
        state.imposterIndex,
        state.players,
        state.gameMode,
      ]
    ),

    startNextRound: useCallback(() => {
      dispatch({ type: ACTIONS.START_NEXT_ROUND });
    }, []),

    resetGame: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_GAME });
    }, []),

    resetTournament: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_TOURNAMENT });
    }, []),

    getMostVotedPlayer: useCallback(() => {
      const voteCounts = {};
      Object.values(state.votes).forEach((suspect) => {
        voteCounts[suspect] = (voteCounts[suspect] || 0) + 1;
      });

      let maxVotes = 0;
      let mostVoted = null;

      Object.entries(voteCounts).forEach(([player, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          mostVoted = player;
        }
      });

      return { player: mostVoted, votes: maxVotes };
    }, [state.votes]),

    getPlayerRole: useCallback(
      (playerIndex) => {
        if (state.gameMode === "classic") {
          return state.spyIndices.includes(playerIndex) ? "spy" : "citizen";
        } else {
          return playerIndex === state.imposterIndex ? "imposter" : "citizen";
        }
      },
      [state.gameMode, state.spyIndices, state.imposterIndex]
    ),

    getPlayerWord: useCallback(
      (playerIndex) => {
        if (state.gameMode === "classic") {
          if (state.spyIndices.includes(playerIndex)) {
            return null;
          }
          return state.selectedWord;
        } else {
          if (playerIndex === state.imposterIndex) {
            return state.selectedPair?.imposter;
          }
          return state.selectedPair?.distinct;
        }
      },
      [
        state.gameMode,
        state.spyIndices,
        state.imposterIndex,
        state.selectedWord,
        state.selectedPair,
      ]
    ),

    getAllLocationsForCategory: useCallback(() => {
      if (state.gameMode !== "classic" || !state.selectedCategory) return [];

      const category = gameData.classic.find(
        (c) => c.category === state.selectedCategory
      );
      return category ? category.words : [];
    }, [state.gameMode, state.selectedCategory]),

    getAllCategories: useCallback(
      (mode) => {
        return getAllCategories(mode || state.gameMode);
      },
      [state.gameMode]
    ),
  };

  return (
    <GameContext.Provider value={{ state, ...actions }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
