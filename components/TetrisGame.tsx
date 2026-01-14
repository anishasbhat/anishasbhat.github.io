"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;
const SCORE_PER_LINE = 100;
const LINES_PER_LEVEL = 10;
const BASE_DROP_SPEED = 1000;
const MIN_DROP_SPEED = 100;
const SPEED_INCREMENT = 50;

const PINK_OUTLINE = "rgb(252 211 211)";

type Position = { x: number; y: number };
type Piece = {
  shape: number[][];
};

const PIECES: Piece[] = [
  { shape: [[1, 1, 1, 1]] },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
];

type GameState = {
  board: number[][];
  currentPiece: Piece | null;
  currentPosition: Position;
  currentRotation: number;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  gameStarted: boolean;
};

type EdgeState = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export default function TetrisGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0)),
    currentPiece: null,
    currentPosition: { x: 0, y: 0 },
    currentRotation: 0,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    gameStarted: false,
  });

  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const lastKeyTimeRef = useRef<{ [key: string]: number }>({});
  const pieceIdCounterRef = useRef<number>(1);

  const createPiece = useCallback((): Piece => {
    return { ...PIECES[Math.floor(Math.random() * PIECES.length)] };
  }, []);

  const rotatePiece = useCallback((piece: Piece, rotation: number): number[][] => {
    let shape = piece.shape;
    for (let i = 0; i < rotation % 4; i++) {
      shape = shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
    }
    return shape;
  }, []);

  const isValidPosition = useCallback(
    (piece: Piece, position: Position, rotation: number, board: number[][]): boolean => {
      const shape = rotatePiece(piece, rotation);
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newX = position.x + x;
            const newY = position.y + y;

            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && board[newY][newX] !== 0)
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [rotatePiece]
  );

  const placePiece = useCallback(
    (
      board: number[][],
      piece: Piece,
      position: Position,
      rotation: number,
      pieceId: number
    ): number[][] => {
      const newBoard = board.map((row) => [...row]);
      const shape = rotatePiece(piece, rotation);

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newY = position.y + y;
            if (newY >= 0) {
              newBoard[newY][position.x + x] = pieceId;
            }
          }
        }
      }
      return newBoard;
    },
    [rotatePiece]
  );

  const clearLines = useCallback(
    (board: number[][]): { newBoard: number[][]; linesCleared: number } => {
      const newBoard = board.filter((row) => !row.every((cell) => cell !== 0));
      const linesCleared = BOARD_HEIGHT - newBoard.length;
      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      }
      return { newBoard, linesCleared };
    },
    []
  );

  const spawnPiece = useCallback(
    (board: number[][]): { piece: Piece; position: Position } | null => {
      const piece = createPiece();
      const position = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };

      if (!isValidPosition(piece, position, 0, board)) {
        return null;
      }

      return { piece, position };
    },
    [createPiece, isValidPosition]
  );

  const dropPiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || !prev.gameStarted) {
        return prev;
      }

      const newPosition = { ...prev.currentPosition, y: prev.currentPosition.y + 1 };

      if (isValidPosition(prev.currentPiece, newPosition, prev.currentRotation, prev.board)) {
        return { ...prev, currentPosition: newPosition };
      }

      const pieceId = pieceIdCounterRef.current++;
      const newBoard = placePiece(
        prev.board,
        prev.currentPiece,
        prev.currentPosition,
        prev.currentRotation,
        pieceId
      );
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      const newScore = prev.score + linesCleared * SCORE_PER_LINE * prev.level;
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;

      const nextPiece = spawnPiece(clearedBoard);
      if (!nextPiece) {
        return { ...prev, gameOver: true, board: clearedBoard };
      }

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: nextPiece.piece,
        currentPosition: nextPiece.position,
        currentRotation: 0,
        score: newScore,
        level: newLevel,
        lines: newLines,
      };
    });
  }, [isValidPosition, placePiece, clearLines, spawnPiece]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      setGameState((prev) => {
        if (!prev.currentPiece || prev.gameOver || !prev.gameStarted) {
          return prev;
        }

        const newPosition = {
          x: prev.currentPosition.x + dx,
          y: prev.currentPosition.y + dy,
        };

        if (isValidPosition(prev.currentPiece, newPosition, prev.currentRotation, prev.board)) {
          return { ...prev, currentPosition: newPosition };
        }
        return prev;
      });
    },
    [isValidPosition]
  );

  const rotateCurrentPiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || !prev.gameStarted) {
        return prev;
      }

      const newRotation = (prev.currentRotation + 1) % 4;
      if (
        isValidPosition(prev.currentPiece, prev.currentPosition, newRotation, prev.board)
      ) {
        return { ...prev, currentRotation: newRotation };
      }
      return prev;
    });
  }, [isValidPosition]);

  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver || !prev.gameStarted) {
        return prev;
      }

      let y = prev.currentPosition.y;
      while (
        isValidPosition(
          prev.currentPiece,
          { x: prev.currentPosition.x, y: y + 1 },
          prev.currentRotation,
          prev.board
        )
      ) {
        y++;
      }
      const newPosition = { x: prev.currentPosition.x, y };

      const pieceId = pieceIdCounterRef.current++;
      const newBoard = placePiece(
        prev.board,
        prev.currentPiece,
        newPosition,
        prev.currentRotation,
        pieceId
      );
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      const newScore = prev.score + linesCleared * SCORE_PER_LINE * prev.level;
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;

      const nextPiece = spawnPiece(clearedBoard);
      if (!nextPiece) {
        return { ...prev, gameOver: true, board: clearedBoard };
      }

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: nextPiece.piece,
        currentPosition: nextPiece.position,
        currentRotation: 0,
        score: newScore,
        level: newLevel,
        lines: newLines,
      };
    });
  }, [isValidPosition, placePiece, clearLines, spawnPiece]);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const handleMovement = () => {
      const now = Date.now();
      const keys = keysRef.current;

      if (keys.has("arrowleft")) {
        if (!lastKeyTimeRef.current["left"] || now - lastKeyTimeRef.current["left"] > 100) {
          movePiece(-1, 0);
          lastKeyTimeRef.current["left"] = now;
        }
      }
      if (keys.has("arrowright")) {
        if (!lastKeyTimeRef.current["right"] || now - lastKeyTimeRef.current["right"] > 100) {
          movePiece(1, 0);
          lastKeyTimeRef.current["right"] = now;
        }
      }
      if (keys.has("arrowdown")) {
        if (!lastKeyTimeRef.current["down"] || now - lastKeyTimeRef.current["down"] > 50) {
          movePiece(0, 1);
          lastKeyTimeRef.current["down"] = now;
        }
      }
      if (keys.has("arrowup")) {
        if (!lastKeyTimeRef.current["up"] || now - lastKeyTimeRef.current["up"] > 200) {
          rotateCurrentPiece();
          lastKeyTimeRef.current["up"] = now;
        }
      }
    };

    const interval = setInterval(handleMovement, 16);
    return () => clearInterval(interval);
  }, [gameState.gameStarted, gameState.gameOver, movePiece, rotateCurrentPiece]);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
      return;
    }

    const dropSpeed = Math.max(
      MIN_DROP_SPEED,
      BASE_DROP_SPEED - (gameState.level - 1) * SPEED_INCREMENT
    );

    if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current);
    }

    dropIntervalRef.current = setInterval(() => {
      dropPiece();
    }, dropSpeed);

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, gameState.level, dropPiece]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      if (key === " ") {
        e.preventDefault();
        if (!gameState.gameStarted) {
          const newPiece = spawnPiece(gameState.board);
          if (newPiece) {
            setGameState((prev) => ({
              ...prev,
              gameStarted: true,
              currentPiece: newPiece.piece,
              currentPosition: newPiece.position,
            }));
          }
        } else if (gameState.gameStarted && !gameState.gameOver) {
          hardDrop();
        }
      }

      if (key === "arrowdown") {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.gameStarted, gameState.gameOver, spawnPiece, hardDrop, gameState.board]);

  const resetGame = () => {
    const newPiece = spawnPiece(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0))
    );
    if (newPiece) {
      setGameState({
        board: Array(BOARD_HEIGHT)
          .fill(null)
          .map(() => Array(BOARD_WIDTH).fill(0)),
        currentPiece: newPiece.piece,
        currentPosition: newPiece.position,
        currentRotation: 0,
        score: 0,
        level: 1,
        lines: 0,
        gameOver: false,
        gameStarted: true,
      });
      lastKeyTimeRef.current = {};
    }
  };

  const renderBoard = (): number[][] => {
    const board = gameState.board.map((row) => [...row]);

    if (gameState.currentPiece && !gameState.gameOver) {
      const shape = rotatePiece(gameState.currentPiece, gameState.currentRotation);
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newY = gameState.currentPosition.y + y;
            const newX = gameState.currentPosition.x + x;
            if (
              newY >= 0 &&
              newY < BOARD_HEIGHT &&
              newX >= 0 &&
              newX < BOARD_WIDTH &&
              board[newY][newX] === 0
            ) {
              board[newY][newX] = 2;
            }
          }
        }
      }
    }

    return board;
  };

  const isEdge = (board: number[][], x: number, y: number, cellValue: number): EdgeState => {
    if (cellValue === 0) {
      return { top: false, right: false, bottom: false, left: false };
    }

    return {
      top: y === 0 || board[y - 1][x] !== cellValue,
      right: x === BOARD_WIDTH - 1 || board[y][x + 1] !== cellValue,
      bottom: y === BOARD_HEIGHT - 1 || board[y + 1][x] !== cellValue,
      left: x === 0 || board[y][x - 1] !== cellValue,
    };
  };

  const displayBoard = renderBoard();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {!gameState.gameStarted && (
        <div className="mb-4 text-white/80 text-sm text-center">
          <div>Press Space to Start</div>
        </div>
      )}

      <div
        className="relative border border-white/30 rounded"
        style={{
          width: BOARD_WIDTH * CELL_SIZE,
          height: BOARD_HEIGHT * CELL_SIZE,
        }}
        onClick={gameState.gameOver ? resetGame : undefined}
      >
        {displayBoard.map((row, y) =>
          row.map((cell, x) => {
            const edges = isEdge(displayBoard, x, y, cell);
            const isPiece = cell !== 0;
            const isCurrentPiece = cell === 2;

            return (
              <div
                key={`${y}-${x}`}
                className={`absolute ${
                  isPiece ? "bg-white" : "bg-transparent border border-white/10"
                }`}
                style={{
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  ...(isPiece && {
                    borderTop: edges.top ? `2px solid ${PINK_OUTLINE}` : "none",
                    borderRight: edges.right ? `2px solid ${PINK_OUTLINE}` : "none",
                    borderBottom: edges.bottom ? `2px solid ${PINK_OUTLINE}` : "none",
                    borderLeft: edges.left ? `2px solid ${PINK_OUTLINE}` : "none",
                  }),
                  opacity: isCurrentPiece ? 0.6 : 1,
                }}
              />
            );
          })
        )}

        {gameState.gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded">
            <div className="text-white text-center">
              <div className="text-lg mb-2">Game Over</div>
              <div className="text-sm mb-4">Score: {gameState.score}</div>
              <div className="text-sm opacity-80">Click to restart</div>
            </div>
          </div>
        )}
      </div>

      {gameState.gameStarted && !gameState.gameOver && (
        <div className="mt-4 text-white/60 text-xs text-center max-w-xs">
          <div>Arrow Keys: Move & Rotate</div>
          <div>Space: Hard Drop</div>
        </div>
      )}
    </div>
  );
}
