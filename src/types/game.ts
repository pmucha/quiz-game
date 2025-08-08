export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  lastDisconnected?: Date;
}

export interface Question {
  id: string;
  text: string;
  answers: string[];
  correctAnswer: number;
  askedBy: string;
}

export interface GameRoom {
  id: string;
  code: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  currentPlayerTurn: string;
  currentQuestion: Question | null;
  winner: string | null;
  createdAt: Date;
  currentRound: number;
  maxRounds: number;
  roundsCompleted: { [playerId: string]: number };
  questionsAsked: { [playerId: string]: number };
}

export interface CreateGameData {
  playerName: string;
}

export interface JoinGameData {
  gameCode: string;
  playerName: string;
}

export interface QuestionData {
  text: string;
  answers: string[];
  correctAnswer: number;
}

export interface AnswerData {
  questionId: string;
  selectedAnswer: number;
}

export interface GameUpdateData {
  room: GameRoom;
  // Optional human-readable message OR an i18n code with params
  message?: string;
  code?: string;
  params?: Record<string, unknown>;
}

export interface ErrorData {
  message?: string;
  code?: string;
  params?: Record<string, unknown>;
}

export type WebSocketMessageData =
  | CreateGameData
  | JoinGameData
  | QuestionData
  | AnswerData
  | GameUpdateData
  | ErrorData;

export interface WebSocketMessage {
  type:
    | 'create'
    | 'join'
    | 'submitQuestion'
    | 'submitAnswer'
    | 'gameUpdate'
    | 'error'
    | 'playerDisconnected'
    | 'ping'
    | 'rejoin';
  data: WebSocketMessageData;
}
