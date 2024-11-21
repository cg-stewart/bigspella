import { GameSettings, Player, RoundStat } from "./types";

const K_FACTOR = 32; // Standard K-factor for ELO calculations

export interface ScoringResult {
  score: number;
  bonuses: {
    timeBonus: number;
    streakBonus: number;
    difficultyBonus: number;
  };
}

/**
 * Calculate points for a correct answer
 */
export function calculateRoundScore(
  timeToAnswer: number,
  streak: number,
  scoringConfig: GameSettings["scoringConfig"],
  difficultyLevel: GameSettings["difficultyLevel"],
  roundDuration: number = 60
): ScoringResult {
  // Base score
  let score = scoringConfig.basePoints;

  // Time bonus - more points for faster answers
  const timeBonus = Math.max(
    0,
    Math.floor(
      (scoringConfig.timeBonus * (roundDuration - timeToAnswer)) /
        roundDuration
    )
  );

  // Streak bonus
  const streakBonus = Math.floor(scoringConfig.streakBonus * Math.min(streak, 5));

  // Difficulty multiplier
  const difficultyMultipliers: Record<GameSettings["difficultyLevel"], number> = {
    EASY: 1,
    MEDIUM: 1.5,
    HARD: 2,
    EXPERT: 3,
  };
  
  const difficultyBonus = Math.floor(
    (score + timeBonus + streakBonus) *
      (difficultyMultipliers[difficultyLevel] - 1)
  );

  return {
    score: score + timeBonus + streakBonus + difficultyBonus,
    bonuses: {
      timeBonus,
      streakBonus,
      difficultyBonus,
    },
  };
}

/**
 * Calculate new ELO ratings for players based on their performance
 */
export function calculateEloRating(
  playerRating: number,
  opponentRating: number,
  playerScore: number,
  opponentScore: number
): number {
  // Convert ratings to probability scale
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));

  // Calculate actual score (0 for loss, 0.5 for draw, 1 for win)
  const actualScore =
    playerScore > opponentScore ? 1 : playerScore === opponentScore ? 0.5 : 0;

  // Calculate new rating
  return Math.round(playerRating + K_FACTOR * (actualScore - expectedScore));
}

/**
 * Calculate achievement progress
 */
export function checkAchievements(
  player: Player,
  roundStats: RoundStat[]
): Player["achievements"] {
  const achievements: Player["achievements"] = [];
  const now = new Date().toISOString();

  // First win achievement
  if (
    roundStats.some((stat: RoundStat) => stat.isCorrect) &&
    !player.achievements.some((a) => a.id === "FIRST_WIN")
  ) {
    achievements.push({
      id: "FIRST_WIN",
      name: "First Victory",
      description: "Win your first round",
      earnedAt: now,
    });
  }

  // Speed demon achievement
  if (
    roundStats.some((stat: RoundStat) => stat.timeToAnswer && stat.timeToAnswer < 5) &&
    !player.achievements.some((a) => a.id === "SPEED_DEMON")
  ) {
    achievements.push({
      id: "SPEED_DEMON",
      name: "Speed Demon",
      description: "Answer correctly in under 5 seconds",
      earnedAt: now,
    });
  }

  // Winning streak achievement
  const streakCount = roundStats.reduce((streak: number, stat: RoundStat) => {
    if (!stat.isCorrect) return 0;
    return streak + 1;
  }, 0);

  if (
    streakCount >= 5 &&
    !player.achievements.some((a) => a.id === "WINNING_STREAK")
  ) {
    achievements.push({
      id: "WINNING_STREAK",
      name: "On Fire",
      description: "Get a streak of 5 correct answers",
      earnedAt: now,
    });
  }

  return achievements;
}
