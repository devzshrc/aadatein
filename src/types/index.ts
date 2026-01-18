export interface StepData {
  date: string; // ISO date string (YYYY-MM-DD)
  steps: number; // Total steps for the day
  lastUpdated: string; // Timestamp of last update
}

export const STEP_GOAL = 10000;
export const STORAGE_KEY = '@pedometer_step_data';
