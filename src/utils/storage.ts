import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepData, STORAGE_KEY } from '../types';

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Load step data from AsyncStorage
 */
export const loadStepData = async (): Promise<StepData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue) as StepData;
    }
    return null;
  } catch (error) {
    console.error('Error loading step data:', error);
    return null;
  }
};

/**
 * Save step data to AsyncStorage
 */
export const saveStepData = async (data: StepData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving step data:', error);
  }
};

/**
 * Get or initialize step data for today
 * Handles midnight reset automatically
 */
export const getOrInitStepData = async (): Promise<StepData> => {
  const today = getTodayDateString();
  const existingData = await loadStepData();

  // If no data exists or data is from a different day, start fresh
  if (!existingData || existingData.date !== today) {
    const newData: StepData = {
      date: today,
      steps: 0,
      lastUpdated: new Date().toISOString(),
    };
    await saveStepData(newData);
    return newData;
  }

  return existingData;
};

/**
 * Update step count for today
 */
export const updateStepCount = async (steps: number): Promise<void> => {
  const today = getTodayDateString();
  const data: StepData = {
    date: today,
    steps,
    lastUpdated: new Date().toISOString(),
  };
  await saveStepData(data);
};
