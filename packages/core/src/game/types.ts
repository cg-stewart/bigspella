export interface GameSettings {
  maxPlayers: number;
  roundDuration: number;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  totalRounds: number;
  scoringConfig: {
    basePoints: number;
    timeBonus: number;
    streakBonus: number;
    difficultyMultiplier: number;
  };
}

export interface RoundStat {
  roundNumber: number;
  score: number;
  word?: string;
  timeToAnswer?: number;
  isCorrect: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface Player {
  id: string;
  username: string;
  score: number;
  eloRating: number;
  attendeeId: string;
  isHost: boolean;
  isReady: boolean;
  achievements: Achievement[];
  roundStats: RoundStat[];
}
