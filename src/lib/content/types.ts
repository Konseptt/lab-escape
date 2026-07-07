export type Difficulty = "INTRO" | "STANDARD" | "ADVANCED";

export type EngineId =
  | "stroop"
  | "span"
  | "drm"
  | "search"
  | "flicker"
  | "framing"
  | "bandit"
  | "conformity"
  | "authority";

export interface ResearchTerm {
  term: string;
  definition: string;
}

export interface ResearchProtocol {
  design: string;
  independentVariable: string;
  dependentVariables: string[];
  operationalDefinitions: Record<string, string>;
  measuredConstructs: string[];
  keyTerms: ResearchTerm[];
}

export interface OriginalStudy {
  year: number;
  researchers: string[];
  citation: string;
  sample: string;
  finding: string;
}

export interface RoomContent {
  slug: string;
  code: string;
  title: string;
  domain: string;
  paradigm: string;
  engine: EngineId;
  wing: string;
  ordinal: number;
  summary: string;
  concept: string;
  background: string;
  difficulty: Difficulty;
  durationMin: number;
  unlockAfter: string | null;
  learningGoals: string[];
  skills: string[];
  originalStudy: OriginalStudy;
  applications: string[];
  whatHappened: string;
  whyItHappened: string;
  research: ResearchProtocol;
  config: Record<string, unknown>;
}

export interface WingContent {
  slug: string;
  name: string;
  ordinal: number;
  mapX: number;
  mapY: number;
}

export interface AchievementContent {
  slug: string;
  title: string;
  description: string;
  xpReward: number;
  roomSlug?: string;
  secret?: boolean;
}
