import type { GameRoom, Player, Question } from '../types/game.ts';

export class GameManager {
  private rooms = new Map<string, GameRoom>();
  private kv: Deno.Kv;

  constructor(kv: Deno.Kv) {
    this.kv = kv;
  }

  private generateGameCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  async createRoom(playerName: string): Promise<{ room: GameRoom; playerId: string }> {
    const roomId = this.generateId();
    const playerId = this.generateId();
    const code = this.generateGameCode();

    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      connected: true
    };

    const room: GameRoom = {
      id: roomId,
      code,
      players: [player],
      gameState: 'waiting',
      currentPlayerTurn: playerId,
      currentQuestion: null,
      winner: null,
      createdAt: new Date(),
      currentRound: 1,
      maxRounds: 3,
      roundsCompleted: { [playerId]: 0 },
      questionsAsked: { [playerId]: 0 }
    };

    this.rooms.set(roomId, room);
    await this.kv.set(['room', roomId], room);

    return { room, playerId };
  }

  async joinRoom(gameCode: string, playerName: string): Promise<{ room: GameRoom; playerId: string } | null> {
    // Find room by code
    let targetRoom: GameRoom | null = null;
    let targetRoomId: string | null = null;

    for (const [roomId, room] of this.rooms) {
      if (room.code === gameCode && room.gameState === 'waiting' && room.players.length < 2) {
        targetRoom = room;
        targetRoomId = roomId;
        break;
      }
    }

    if (!targetRoom || !targetRoomId) {
      return null;
    }

    const playerId = this.generateId();
    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      connected: true
    };

    targetRoom.players.push(player);
    targetRoom.gameState = 'playing';
    targetRoom.roundsCompleted[playerId] = 0;
    targetRoom.questionsAsked[playerId] = 0;

    this.rooms.set(targetRoomId, targetRoom);
    await this.kv.set(['room', targetRoomId], targetRoom);

    return { room: targetRoom, playerId };
  }

  async submitQuestion(roomId: string, playerId: string, questionData: {
    text: string;
    answers: string[];
    correctAnswer: number;
  }): Promise<GameRoom | null> {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') {
      return null;
    }

    // Check if it's player's turn and no question is pending
    if (room.currentPlayerTurn !== playerId || room.currentQuestion) {
      return null;
    }

    const question: Question = {
      id: this.generateId(),
      text: questionData.text,
      answers: questionData.answers,
      correctAnswer: questionData.correctAnswer,
      askedBy: playerId
    };

    room.currentQuestion = question;
    room.questionsAsked[playerId] = (room.questionsAsked[playerId] || 0) + 1;

    this.rooms.set(roomId, room);
    await this.kv.set(['room', roomId], room);

    return room;
  }

  async submitAnswer(roomId: string, playerId: string, questionId: string, selectedAnswer: number): Promise<{
    room: GameRoom;
    isCorrect: boolean;
    messageCode: string;
    messageParams?: Record<string, any>;
  } | null> {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing' || !room.currentQuestion) {
      return null;
    }

    // Check if it's the right player answering (not the one who asked)
    if (room.currentQuestion.askedBy === playerId || room.currentQuestion.id !== questionId) {
      return null;
    }

    const isCorrect = selectedAnswer === room.currentQuestion.correctAnswer;
    let messageCode = '';
    let messageParams: Record<string, any> = {};

    if (isCorrect) {
      // Award point to answering player
      const answeringPlayer = room.players.find(p => p.id === playerId);
      if (answeringPlayer) {
        answeringPlayer.score++;
        messageCode = 'answerCorrect';
        messageParams = { name: answeringPlayer.name };
      }
    } else {
      const answeringPlayer = room.players.find(p => p.id === playerId);
      const askingPlayer = room.players.find(p => p.id === room.currentQuestion!.askedBy);
      if (answeringPlayer && askingPlayer) {
        messageCode = 'answerIncorrect';
        messageParams = {
          name: answeringPlayer.name,
          correct: room.currentQuestion.answers[room.currentQuestion.correctAnswer]
        };
      }
    }

    // Mark round as completed for the answering player
    room.roundsCompleted[playerId] = (room.roundsCompleted[playerId] || 0) + 1;

    // Clear current question
    room.currentQuestion = null;

    // Check if both players completed the current round
    const allPlayersCompletedRound = room.players.every(player =>
      (room.roundsCompleted[player.id] || 0) >= room.currentRound
    );

    if (allPlayersCompletedRound) {
      // Move to next round or end game
      if (room.currentRound >= room.maxRounds) {
        // Game finished - determine winner
        const maxScore = Math.max(...room.players.map(p => p.score));
        const winners = room.players.filter(p => p.score === maxScore);

        if (winners.length === 1) {
          room.winner = winners[0].id;
          room.gameState = 'finished';
          messageCode = 'gameFinishedWinner';
          messageParams = { name: winners[0].name, score: maxScore };
        } else {
          // Tie - continue with sudden death rounds
          room.currentRound++;
          room.maxRounds++;
          messageCode = 'tieBreaker';
          messageParams = { round: room.currentRound };
        }
      } else {
        // Next round
        room.currentRound++;
        messageCode = 'nextRound';
        messageParams = { prev: room.currentRound - 1, next: room.currentRound };
      }
    }

    // Switch turn to the other player (the one who answered)
    room.currentPlayerTurn = playerId;

    // Check for immediate win condition (first to 3 points)
    const winningPlayer = room.players.find(p => p.score >= 3);
    if (winningPlayer && room.gameState !== 'finished') {
      // But check if the other player had equal chances
      const otherPlayer = room.players.find(p => p.id !== winningPlayer.id);
      if (otherPlayer) {
        const winnerRounds = room.roundsCompleted[winningPlayer.id] || 0;
        const otherRounds = room.roundsCompleted[otherPlayer.id] || 0;

        // If the other player had equal or more chances, end the game
        if (otherRounds >= winnerRounds) {
          room.winner = winningPlayer.id;
          room.gameState = 'finished';
          messageCode = 'gameFinished3Points';
          messageParams = { name: winningPlayer.name };
        }
      }
    }

    this.rooms.set(roomId, room);
    await this.kv.set(['room', roomId], room);

    return { room, isCorrect, messageCode, messageParams };
  }

  async disconnectPlayer(roomId: string, playerId: string): Promise<GameRoom | null> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.connected = false;
    }

    // Only end the game if both players are disconnected for more than 5 minutes
    // For now, just mark as disconnected but keep the game running
    // This allows immediate reconnection

    this.rooms.set(roomId, room);
    await this.kv.set(['room', roomId], room);

    return room;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  async reconnectPlayer(roomId: string, playerId: string): Promise<{ room: GameRoom; player: Player } | null> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return null;
    }

    // Mark player as connected again
    player.connected = true;

    this.rooms.set(roomId, room);
    await this.kv.set(['room', roomId], room);

    return { room, player };
  }

  // Clean up old rooms (call periodically)
  async cleanupOldRooms(): Promise<void> {
    const now = new Date();
    const roomsToDelete: string[] = [];

    for (const [roomId, room] of this.rooms) {
      const ageInHours = (now.getTime() - room.createdAt.getTime()) / (1000 * 60 * 60);

      // Remove rooms older than 24 hours or finished games older than 1 hour
      if (ageInHours > 24 || (room.gameState === 'finished' && ageInHours > 1)) {
        roomsToDelete.push(roomId);
      }
    }

    for (const roomId of roomsToDelete) {
      this.rooms.delete(roomId);
      await this.kv.delete(['room', roomId]);
    }
  }
}