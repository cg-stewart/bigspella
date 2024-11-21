import { z } from "zod";
import { Resource } from "sst";

export module GameRoom {
  // Schema for player data
  export const Player = z.object({
    id: z.string(),
    username: z.string(),
    score: z.number(),
    isHost: z.boolean(),
    isReady: z.boolean(),
    joinedAt: z.string(),
    lastActive: z.string(),
  });
  export type Player = z.infer<typeof Player>;

  // Schema for room settings
  export const RoomSettings = z.object({
    maxPlayers: z.number().min(2).max(32),
    roundDuration: z.number().min(30).max(300),
    difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
    isPrivate: z.boolean(),
    allowSpectators: z.boolean(),
  });
  export type RoomSettings = z.infer<typeof RoomSettings>;

  // Schema for room state
  export const RoomState = z.enum([
    "LOBBY",
    "STARTING",
    "IN_PROGRESS",
    "ROUND_END",
    "GAME_END",
  ]);
  export type RoomState = z.infer<typeof RoomState>;

  // Schema for game room
  export const Room = z.object({
    id: z.string(),
    name: z.string(),
    settings: RoomSettings,
    state: RoomState,
    players: z.array(Player),
    currentRound: z.number(),
    totalRounds: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    currentWord: z.string().optional(),
  });
  export type Room = z.infer<typeof Room>;

  // Default room settings
  export const DEFAULT_SETTINGS: RoomSettings = {
    maxPlayers: 4,
    roundDuration: 60,
    difficultyLevel: "MEDIUM",
    isPrivate: false,
    allowSpectators: true,
  };

  /**
   * Create a new game room
   */
  export function createRoom(
    name: string,
    hostPlayer: Omit<Player, "isHost" | "isReady" | "joinedAt" | "lastActive">,
    settings: Partial<RoomSettings> = {}
  ): Room {
    const now = new Date().toISOString();

    return {
      id: generateRoomId(),
      name,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      state: "LOBBY",
      players: [
        {
          ...hostPlayer,
          isHost: true,
          isReady: false,
          joinedAt: now,
          lastActive: now,
        },
      ],
      currentRound: 0,
      totalRounds: 10,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Add a player to a room
   */
  export function addPlayer(
    room: Room,
    player: Omit<Player, "isHost" | "isReady" | "joinedAt" | "lastActive">
  ): Room {
    if (room.players.length >= room.settings.maxPlayers) {
      throw new Error("Room is full");
    }

    if (room.state !== "LOBBY") {
      throw new Error("Cannot join room - game is in progress");
    }

    const now = new Date().toISOString();
    const newPlayer: Player = {
      ...player,
      isHost: false,
      isReady: false,
      joinedAt: now,
      lastActive: now,
    };

    return {
      ...room,
      players: [...room.players, newPlayer],
      updatedAt: now,
    };
  }

  /**
   * Remove a player from a room
   */
  export function removePlayer(room: Room, playerId: string): Room {
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error("Player not found in room");
    }

    const now = new Date().toISOString();
    const newPlayers = room.players.filter((p) => p.id !== playerId);

    // If the host left, assign a new host
    if (room.players[playerIndex].isHost && newPlayers.length > 0) {
      newPlayers[0].isHost = true;
    }

    return {
      ...room,
      players: newPlayers,
      updatedAt: now,
    };
  }

  /**
   * Update player ready status
   */
  export function updatePlayerReady(
    room: Room,
    playerId: string,
    isReady: boolean
  ): Room {
    const now = new Date().toISOString();
    const players = room.players.map((player) =>
      player.id === playerId ? { ...player, isReady, lastActive: now } : player
    );

    return {
      ...room,
      players,
      updatedAt: now,
    };
  }

  /**
   * Check if game can start
   */
  export function canStartGame(room: Room): boolean {
    return (
      room.state === "LOBBY" &&
      room.players.length >= 2 &&
      room.players.every((player) => player.isReady)
    );
  }

  /**
   * Start the game
   */
  export function startGame(room: Room): Room {
    if (!canStartGame(room)) {
      throw new Error("Cannot start game - not all players are ready");
    }

    return {
      ...room,
      state: "STARTING",
      currentRound: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update player score
   */
  export function updatePlayerScore(
    room: Room,
    playerId: string,
    score: number
  ): Room {
    const now = new Date().toISOString();
    const players = room.players.map((player) =>
      player.id === playerId ? { ...player, score, lastActive: now } : player
    );

    return {
      ...room,
      players,
      updatedAt: now,
    };
  }

  /**
   * Generate a unique room ID
   */
  function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }
}
