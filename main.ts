import { serveDir } from "@std/http/file-server";
import { GameManager } from "./src/server/gameManager.ts";
import type { WebSocketMessage, CreateGameData, JoinGameData, QuestionData, AnswerData, GameRoom } from "./src/types/game.ts";


declare const Deno: any;

// Initialize Deno KV
const kv = await Deno.openKv();
const gameManager = new GameManager(kv);

// Store WebSocket connections with their associated room and player IDs
const connections = new Map<WebSocket, { roomId?: string; playerId?: string }>();

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.log("WebSocket connection opened");
      connections.set(socket, {});
    };

    socket.onmessage = async (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        await handleMessage(socket, message);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      handleDisconnection(socket);
    };

    return response;
  }

  // Serve static files
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return await serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
    });
  }

  // Handle game code URLs like /1234 and /1234/
  const gameCodeMatch = url.pathname.match(/^\/(\d{4})\/$/);
  if (gameCodeMatch) {
    return await serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
    });
  }

  // Serve other static files
  return await serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
  });
}

async function handleMessage(socket: WebSocket, message: WebSocketMessage) {
  const connection = connections.get(socket);
  if (!connection) return;

  try {
    switch (message.type) {
      case 'create': {
        const data = message.data as CreateGameData;
        const result = await gameManager.createRoom(data.playerName);
        connection.roomId = result.room.id;
        connection.playerId = result.playerId;
        socket.send(JSON.stringify({
          type: 'gameUpdate',
          data: {
            room: result.room,
            code: 'gameCreated',
            params: { code: result.room.code }
          }
        }));
        break;
      }
      case 'join': {
        const data = message.data as JoinGameData;
        const result = await gameManager.joinRoom(String(data.gameCode), data.playerName);
        if (result) {
          connection.roomId = result.room.id;
          connection.playerId = result.playerId;
          broadcastToRoom(result.room.id, {
            type: 'gameUpdate',
            data: {
              room: result.room,
              code: 'playerJoined',
              params: { name: data.playerName }
            }
          });
        } else {
          socket.send(JSON.stringify({
            type: 'error',
            data: { code: 'errorJoinRoom' }
          }));
        }
        break;
      }

      case 'submitQuestion': {
        if (!connection.roomId || !connection.playerId) return;

        const data = message.data as QuestionData;
        const result = await gameManager.submitQuestion(
          connection.roomId,
          connection.playerId,
          data
        );

        if (result) {
          broadcastToRoom(connection.roomId, {
            type: 'gameUpdate',
            data: {
              room: result,
              code: 'questionSubmitted'
            }
          });
        } else {
          socket.send(JSON.stringify({
            type: 'error',
            data: { code: 'errorSubmitQuestion' }
          }));
        }
        break;
      }

      case 'submitAnswer': {
        if (!connection.roomId || !connection.playerId) return;

        const data = message.data as AnswerData;
        const result = await gameManager.submitAnswer(
          connection.roomId,
          connection.playerId,
          data.questionId,
          data.selectedAnswer
        );

        if (result) {
          broadcastToRoom(connection.roomId, {
            type: 'gameUpdate',
            data: {
              room: result.room,
              code: result.messageCode,
              params: result.messageParams
            }
          });
        } else {
          socket.send(JSON.stringify({
            type: 'error',
            data: { code: 'errorSubmitAnswer' }
          }));
        }
        break;
      }

      case 'ping': {
        // Respond to ping with pong
        socket.send(JSON.stringify({
          type: 'pong',
          data: { timestamp: Date.now() }
        }));
        break;
      }

      case 'rejoin': {
        const data = message.data as { roomId: string; playerId: string; playerName: string };
        const room = gameManager.getRoom(data.roomId);

        if (room) {
          // Check if player exists in the room
          const player = room.players.find(p => p.id === data.playerId && p.name === data.playerName);

          if (player) {
            // Update connection info
            connection.roomId = data.roomId;
            connection.playerId = data.playerId;

            // Mark player as connected again using the new method
            const result = await gameManager.reconnectPlayer(data.roomId, data.playerId);
            if (result) {
              socket.send(JSON.stringify({
                type: 'rejoinSuccess',
                data: {
                  room: result.room,
                  player: result.player,
                  code: 'reconnectSuccess'
                }
              }));

              // Notify other players
              broadcastToRoom(data.roomId, {
                type: 'gameUpdate',
                data: {
                  room: result.room,
                  code: 'playerRejoined',
                  params: { name: data.playerName }
                }
              }, socket);
            }
          } else {
            socket.send(JSON.stringify({
              type: 'rejoinFailed',
              data: { code: 'errorPlayerNotFound' }
            }));
          }
        } else {
          socket.send(JSON.stringify({
            type: 'rejoinFailed',
            data: { code: 'errorRoomNotFound' }
          }));
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
    socket.send(JSON.stringify({
      type: 'error',
      data: { message: 'Wystąpił błąd serwera' }
    }));
  }
}

function handleDisconnection(socket: WebSocket) {
  const connection = connections.get(socket);
  if (connection?.roomId && connection?.playerId) {
    gameManager.disconnectPlayer(connection.roomId, connection.playerId)
      .then(room => {
        if (room) {
          broadcastToRoom(connection.roomId!, {
            type: 'playerDisconnected',
            data: {
              room,
              message: 'Gracz rozłączył się'
            }
          });
        }
      });
  }
  connections.delete(socket);
}

interface BroadcastMessage {
  type: string;
  data: {
    room?: GameRoom;
    message?: string;
    code?: string;
    params?: Record<string, unknown>;
    player?: any;
  };
}

function broadcastToRoom(roomId: string, message: BroadcastMessage, excludeSocket?: WebSocket) {
  for (const [socket, connection] of connections) {
    if (connection.roomId === roomId && socket.readyState === WebSocket.OPEN && socket !== excludeSocket) {
      socket.send(JSON.stringify(message));
    }
  }
}

const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on http://localhost:${port}`);

Deno.serve({ port }, handler);