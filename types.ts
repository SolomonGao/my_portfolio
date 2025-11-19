export enum ViewState {
  IDLE = 'IDLE',
  FOCUSED = 'FOCUSED',
  SHUTTING_DOWN = 'SHUTTING_DOWN'
}

export type AppID = 'RESUME' | 'PROJECTS' | 'SETTINGS' | 'GYM' | 'LIBRARY' | 'HEAT';

export interface Project {
  id: number;
  name: string;
  description: string;
  tech: string[];
  image: string;
}

export interface HeatData {
  summary: string;
  keyPlayers: string[];
}
