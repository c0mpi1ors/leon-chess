import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Player = 'white' | 'black';

interface MoveRecord {
  moveNumber: number;
  white?: string;
  black?: string;
}

const INITIAL_TIME = 10 * 60; // 10 minutes in seconds
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Wood theme colors - high contrast on wood background
const woodTheme = {
  text: '#FFF8DC', // Cream/cornsilk - light color for contrast
  textShadow: '#2F1810', // Dark brown shadow
  accent: '#FFD700', // Gold accent
  timerColor: '#4A90D9', // Blue for timer
  buttonBg: '#8B4513', // Saddle brown
  buttonDanger: '#B22222', // Firebrick red
  activePlayer: 'rgba(255, 215, 0, 0.3)', // Gold highlight
};

export default function GameScreen() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 32, 400);

  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [gameStatus, setGameStatus] = useState('游戏进行中');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([INITIAL_FEN]);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);

  // Timer effect
  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    const interval = setInterval(() => {
      if (currentPlayer === 'white') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setGameStatus('黑方获胜 - 白方超时');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setGameStatus('白方获胜 - 黑方超时');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPlayer, isGameStarted, isGameOver]);

  const handleMove = useCallback(
    ({ move, state }: { move: { san: string }; state: { fen: string; in_check: boolean; in_checkmate: boolean; in_stalemate: boolean; in_draw: boolean; in_threefold_repetition: boolean; game_over: boolean } }) => {
      if (!isGameStarted) {
        setIsGameStarted(true);
      }

      // Save FEN for undo
      setFenHistory((prev) => [...prev, state.fen]);

      // Update move history with actual move notation (SAN)
      const moveNotation = move.san;
      setMoveHistory((prev) => {
        const newHistory = [...prev];
        if (currentPlayer === 'white') {
          newHistory.push({
            moveNumber: newHistory.length + 1,
            white: moveNotation,
          });
        } else if (newHistory.length > 0) {
          newHistory[newHistory.length - 1].black = moveNotation;
        }
        return newHistory;
      });

      // Check game state
      if (state.in_checkmate) {
        setIsGameOver(true);
        setGameStatus(currentPlayer === 'white' ? '白方获胜 - 将死' : '黑方获胜 - 将死');
      } else if (state.in_stalemate) {
        setIsGameOver(true);
        setGameStatus('平局 - 僵局');
      } else if (state.in_draw || state.in_threefold_repetition) {
        setIsGameOver(true);
        setGameStatus('平局');
      } else if (state.in_check) {
        setGameStatus('将军！');
      } else {
        setGameStatus('游戏进行中');
      }

      // Switch player
      setCurrentPlayer((prev) => (prev === 'white' ? 'black' : 'white'));
    },
    [currentPlayer, isGameStarted]
  );

  const handleUndo = useCallback(() => {
    if (isGameOver || fenHistory.length <= 1) return;

    // Get previous FEN
    const newFenHistory = fenHistory.slice(0, -1);
    const previousFen = newFenHistory[newFenHistory.length - 1];

    // Reset board to previous state
    chessboardRef.current?.resetBoard(previousFen);
    setFenHistory(newFenHistory);

    setCurrentPlayer((prev) => (prev === 'white' ? 'black' : 'white'));
    setMoveHistory((prev) => {
      const newHistory = [...prev];
      if (newHistory.length > 0) {
        const last = newHistory[newHistory.length - 1];
        if (last.black) {
          last.black = undefined;
        } else {
          newHistory.pop();
        }
      }
      return newHistory;
    });
    setGameStatus('游戏进行中');
  }, [isGameOver, fenHistory]);

  const handleReset = useCallback(() => {
    chessboardRef.current?.resetBoard();
    setCurrentPlayer('white');
    setGameStatus('游戏进行中');
    setIsGameOver(false);
    setIsGameStarted(false);
    setMoveHistory([]);
    setFenHistory([INITIAL_FEN]);
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/images/wood-texture.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>LEON国际象棋</Text>

        {/* Black player info */}
        <View style={[styles.playerInfo, currentPlayer === 'black' && !isGameOver && styles.activePlayer]}>
          <Text style={styles.playerName}>黑方</Text>
          <Text style={styles.timer}>{formatTime(blackTime)}</Text>
          {currentPlayer === 'black' && !isGameOver && <Text style={styles.turnIndicator}>◀</Text>}
        </View>

        {/* Chessboard */}
        <View style={styles.boardContainer}>
          <Chessboard
            ref={chessboardRef}
            boardSize={boardSize}
            gestureEnabled={!isGameOver}
            onMove={handleMove}
            durations={{ move: 200 }}
          />
        </View>

        {/* White player info */}
        <View style={[styles.playerInfo, currentPlayer === 'white' && !isGameOver && styles.activePlayer]}>
          <Text style={styles.playerName}>白方</Text>
          <Text style={styles.timer}>{formatTime(whiteTime)}</Text>
          {currentPlayer === 'white' && !isGameOver && <Text style={styles.turnIndicator}>◀</Text>}
        </View>

        {/* Game status */}
        <Text style={styles.status}>{gameStatus}</Text>

        {/* Control buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { opacity: (isGameOver || fenHistory.length <= 1) ? 0.5 : 1 }]}
            onPress={handleUndo}
            disabled={isGameOver || fenHistory.length <= 1}
          >
            <Text style={styles.buttonText}>撤销</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>重新开始</Text>
          </TouchableOpacity>
        </View>

        {/* Move history button */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push({ pathname: '/steps', params: { moves: JSON.stringify(moveHistory) } })}
        >
          <Text style={styles.historyButtonText}>移动记录</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 12,
    color: woodTheme.text,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  activePlayer: {
    backgroundColor: woodTheme.activePlayer,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: woodTheme.text,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    color: woodTheme.timerColor,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  turnIndicator: {
    fontSize: 16,
    color: woodTheme.accent,
  },
  boardContainer: {
    marginVertical: 12,
  },
  status: {
    fontSize: 16,
    marginVertical: 8,
    color: woodTheme.text,
    textShadowColor: woodTheme.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: woodTheme.buttonBg,
  },
  resetButton: {
    backgroundColor: woodTheme.buttonDanger,
  },
  buttonText: {
    color: woodTheme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
