export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  type?: 'text' | 'analysis' | 'alert';
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: any[];
  };
}

export interface AnalysisResult {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  QUANT_PREDICT = 'QUANT_PREDICT',
  DEAL_FLOW = 'DEAL_FLOW',
  RESOURCE_MAP = 'RESOURCE_MAP',
  DATA_LAB = 'DATA_LAB'
}

export interface StockData {
  time: string;
  price: number;
  volume: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT';
  message: string;
}