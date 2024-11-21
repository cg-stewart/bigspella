import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";
import { db } from "../db/drizzle";
import { games } from "../db/schema/game.sql";
import { eq } from "drizzle-orm";
import {
  calculateRoundScore,
  calculateEloRating,
  checkAchievements,
} from "./scoring";
import { GameSettings, Player, Achievement, RoundStat } from "./types";

export module GameService {
  const chime = new ChimeSDKMeetings({ region: "us-east-1" });

  export const DEFAULT_SETTINGS: GameSettings = {
    maxPlayers: 4,
    roundDuration: 60,
    difficultyLevel: "MEDIUM",
    totalRounds: 10,
    scoringConfig: {
      basePoints: 100,
      timeBonus: 50,
      streakBonus: 20,
      difficultyMultiplier: 1,
    },
  };

  const createDefaultPlayer = (
    id: string,
    username: string,
    attendeeId: string,
    isHost: boolean
  ): Player => ({
    id,
    username,
    attendeeId,
    isHost,
    score: 0,
    eloRating: 1200, // Default ELO rating
    isReady: false,
    achievements: [],
    roundStats: [],
  });

  /**
   * Create a new game room with a Chime SDK meeting
   */
  export async function createGame(
    name: string,
    hostPlayer: { id: string; username: string },
    settings: Partial<GameSettings> = {}
  ) {
    const meeting = await chime.createMeeting({
      ClientRequestToken: `game-${Date.now()}`,
      MediaRegion: "us-east-1",
      ExternalMeetingId: `game-${Date.now()}`,
    });

    const attendee = await chime.createAttendee({
      MeetingId: meeting.Meeting!.MeetingId!,
      ExternalUserId: hostPlayer.id,
    });

    const gameSettings = { ...DEFAULT_SETTINGS, ...settings };

    const initialPlayer = createDefaultPlayer(
      hostPlayer.id,
      hostPlayer.username,
      attendee.Attendee!.AttendeeId!,
      true
    );

    const game = await db
      .insert(games)
      .values({
        id: meeting.Meeting!.ExternalMeetingId!,
        name,
        meetingId: meeting.Meeting!.MeetingId!,
        state: "LOBBY",
        hostId: hostPlayer.id,
        players: [initialPlayer],
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

    const newPlayer = createDefaultPlayer(
      player.id,
      player.username,
      attendee.Attendee!.AttendeeId!,
      false
    );

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
        state: "ROUND_STARTING",
        currentRound: 1,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
  }

  /**
   * Start a new round
   */
  export async function startRound(gameId: string) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.state !== "ROUND_STARTING") {
      throw new Error("Game is not ready to start round");
    }

    // TODO: Get a new word from the word service
    const newWord = "EXAMPLE";

    return await db
      .update(games)
      .set({
        state: "ROUND_IN_PROGRESS",
        currentWord: newWord,
        roundStartTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
  }

  /**
   * Submit an answer for the current round
   */
  export async function submitAnswer(
    gameId: string,
    playerId: string,
    answer: string
  ) {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.state !== "ROUND_IN_PROGRESS") {
      throw new Error("Round is not in progress");
    }

    const playerIndex = game.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error("Player not found in game");
    }

    const isCorrect = answer.toLowerCase() === game.currentWord?.toLowerCase();
    const timeToAnswer = game.roundStartTime
      ? Math.floor((Date.now() - game.roundStartTime.getTime()) / 1000)
      : game.settings.roundDuration;

    const player = game.players[playerIndex];

    // Calculate streak
    const streak = (player.roundStats || []).reduce((count, stat) => {
      if (!stat.isCorrect) return 0;
      return count + 1;
    }, 0);

    // Calculate score for this round
    const roundScore = isCorrect
      ? calculateRoundScore(
          timeToAnswer,
          streak,
          game.settings.scoringConfig,
          game.settings.difficultyLevel,
          game.settings.roundDuration
        )
      : { score: 0, bonuses: { timeBonus: 0, streakBonus: 0, difficultyBonus: 0 } };

    // Update player stats
    const updatedPlayers = [...game.players];
    const updatedPlayer = updatedPlayers[playerIndex];

    updatedPlayer.roundStats = [
      ...(updatedPlayer.roundStats || []),
      {
        roundNumber: game.currentRound,
        score: roundScore.score,
        word: game.currentWord || undefined,
        timeToAnswer,
        isCorrect,
      },
    ];

    updatedPlayer.score += roundScore.score;

    // Check for achievements
    const newAchievements = checkAchievements(
      updatedPlayer,
      updatedPlayer.roundStats || []
    );
    updatedPlayer.achievements = [
      ...(updatedPlayer.achievements || []),
      ...newAchievements,
    ];

    // Update ELO rating if this is the last round
    if (game.currentRound === game.settings.totalRounds) {
      const otherPlayers = game.players.filter((p) => p.id !== playerId);
      updatedPlayer.eloRating = otherPlayers.reduce((rating, opponent) => {
        return calculateEloRating(
          rating,
          opponent.eloRating || 1200,
          updatedPlayer.score,
          opponent.score
        );
      }, updatedPlayer.eloRating || 1200);
    }

    return await db
      .update(games)
      .set({
        players: updatedPlayers,
        state: "ROUND_ENDED",
        roundEndTime: new Date(),
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
