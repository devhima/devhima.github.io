
export interface UsageRecord {
  timestamp: number; // Unix timestamp
  usage: number; // in bytes
}

export interface User {
  id: string;
  name: string;
  totalUsage: number; // Stored in bytes
  usageHistory: UsageRecord[];
}
