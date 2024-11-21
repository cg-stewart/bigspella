import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";
import { db } from "../db/drizzle";
import { games } from "../db/schema/game.sql";
import { eq } from "drizzle-orm";

export module GameService {
  const chime = new ChimeSDKMeetings({ region: "us-east-1" });

  export type GameSettings = {
    maxPlayers: number;
    roundDuration: number;
    difficultyLevel: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    totalRounds: number;
  };

  export type Player = {
    id: string;
    username: string;
    score: number;
    attendeeId: string;
    isHost: boolean;
    isReady: boolean;
  };

  const DEFAULT_SETTINGS: GameSettings = {
    maxPlayers: 4,
    roundDuration: 60,
    difficultyLevel: "MEDIUM",
    totalRounds: 10,
  };

  /**
   * Create a new game room with a Chime SDK meeting
   */
  export async function createGame(
    name: string,
    hostPlayer: { id: string; username: string },
    settings: Partial<GameSettings> = {}
  ) {
    // Create a Chime SDK meeting
    const meeting = await chime.createMeeting({
      ClientRequestToken: `game-${Date.now()}`,
      MediaRegion: "us-east-1",
      ExternalMeetingId: `game-${Date.now()}`,
    });

    // Create attendee for host
    const attendee = await chime.createAttendee({
      MeetingId: meeting.Meeting!.MeetingId!,
      ExternalUserId: hostPlayer.id,
    });

    const gameSettings = { ...DEFAULT_SETTINGS, ...settings };

    // Create game record in database
    const game = await db
      .insert(games)
      .values({
        id: meeting.Meeting!.ExternalMeetingId!,
        name,
        meetingId: meeting.Meeting!.MeetingId!,
        state: "LOBBY",
        hostId: hostPlayer.id,
        players: [
          {
            id: hostPlayer.id,
            username: hostPlayer.username,
            score: 0,
            attendeeId: attendee.Attendee!.AttendeeId!,
            isHost: true,
            isReady: false,
          },
        ],
        settings: gameSettings,
        currentRound: 0,
      })
      .returning();

    return {
      ...game[0],
      meeting: meeting.Meeting,
      hostAttendee: attendee.Attendee,
    };
  }

  /**
   * Add a player to a game
   */
  export async function addPlayer(
    gameId: string,
    player: { id: string; username: string }
  ) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.players.length >= game.settings.maxPlayers) {
      throw new Error("Game is full");
    }

    if (game.state !== "LOBBY") {
      throw new Error("Cannot join game - game is in progress");
    }

    // Create attendee for new player
    const attendee = await chime.createAttendee({
      MeetingId: game.meetingId,
      ExternalUserId: player.id,
    });

    const newPlayer: Player = {
      id: player.id,
      username: player.username,
      score: 0,
      attendeeId: attendee.Attendee!.AttendeeId!,
      isHost: false,
      isReady: false,
    };

    // Update game record
    const updatedGame = await db
      .update(games)
      .set({
        players: [...game.players, newPlayer],
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();

    return {
      ...updatedGame[0],
      newAttendee: attendee.Attendee,
    };
  }

  /**
   * Remove a player from a game
   */
  export async function removePlayer(gameId: string, playerId: string) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    const playerIndex = game.players.findIndex(
      (p: Player) => p.id === playerId
    );
    if (playerIndex === -1) {
      throw new Error("Player not found in game");
    }

    // Delete attendee from the meeting
    await chime.deleteAttendee({
      MeetingId: game.meetingId,
      AttendeeId: game.players[playerIndex].attendeeId,
    });

    const updatedPlayers = game.players.filter(
      (p: Player) => p.id !== playerId
    );

    // If the host left and there are other players, assign a new host
    if (game.players[playerIndex].isHost && updatedPlayers.length > 0) {
      updatedPlayers[0].isHost = true;
    }

    // Update game record
    return await db
      .update(games)
      .set({
        players: updatedPlayers,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
  }

  /**
   * Update player ready status
   */
  export async function updatePlayerReady(
    gameId: string,
    playerId: string,
    isReady: boolean
  ) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    const updatedPlayers = game.players.map((player: Player) =>
      player.id === playerId ? { ...player, isReady } : player
    );

    return await db
      .update(games)
      .set({
        players: updatedPlayers,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
  }

  /**
   * Start the game if all players are ready
   */
  export async function startGame(gameId: string) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.players.length < 2) {
      throw new Error("Not enough players to start game");
    }

    if (!game.players.every((player: Player) => player.isReady)) {
      throw new Error("Not all players are ready");
    }

    return await db
      .update(games)
      .set({
        state: "IN_PROGRESS",
        currentRound: 1,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
  }

  /**
   * End the game and cleanup resources
   */
  export async function endGame(gameId: string) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    // Delete the Chime meeting
    await chime.deleteMeeting({
      MeetingId: game.meetingId,
    });

    // Update game record
    return await db
      .update(games)
      .set({
        state: "COMPLETED",
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
  }
}
