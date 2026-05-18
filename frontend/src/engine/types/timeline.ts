export interface TimelineEvent {
  time: number;
  character: string;
  actionType: string;
  target: string;
  targetAttachments: string[];
  applyAttachments: string[];
  consumeAttachments: string[];
  gainSnapshot: Record<string, string | number | boolean>;
}

export interface BattleResource {
  tech: number;
  techMax: number;
  techStart: number;
  techPerSecond: number;
  energy: Map<string, number>; // characterId → current energy
  energyMax: Map<string, number>;
}

export interface SimulationResult {
  events: TimelineEvent[];
  characterDamage: Map<string, number>;
  teamDamage: number;
  teamDps: number;
  techCurve: { time: number; value: number }[];
  staggerCurve: { time: number; value: number }[];
  gainTimeline: { gainId: string; start: number; end: number }[];
}
