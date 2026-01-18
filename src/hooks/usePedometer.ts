import { useState, useEffect, useRef, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import { AppState, AppStateStatus } from 'react-native';
import { getOrInitStepData, updateStepCount, getTodayDateString } from '../utils/storage';

interface UsePedometerResult {
  steps: number;
  isAvailable: boolean;
  isPending: boolean;
  error: string | null;
}

export const usePedometer = (): UsePedometerResult => {
  const [steps, setSteps] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseSteps = useRef<number>(0);
  const sessionStartSteps = useRef<number | null>(null);
  const subscription = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);

  const initializePedometer = useCallback(async () => {
    try {
      setIsPending(true);
      setError(null);

      // Check if pedometer is available
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (!available) {
        setError('Pedometer not available on this device');
        setIsPending(false);
        return;
      }

      // Load stored steps for today
      const storedData = await getOrInitStepData();
      baseSteps.current = storedData.steps;
      setSteps(storedData.steps);

      // Request permissions
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access pedometer was denied');
        setIsPending(false);
        return;
      }

      // Get steps since midnight for more accurate count
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      try {
        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        if (result) {
          baseSteps.current = result.steps;
          setSteps(result.steps);
          await updateStepCount(result.steps);
        }
      } catch {
        // Fallback to stored data if historical data not available
        console.log('Historical step data not available, using stored data');
      }

      // Subscribe to real-time step updates
      sessionStartSteps.current = null;
      subscription.current = Pedometer.watchStepCount((result) => {
        if (sessionStartSteps.current === null) {
          sessionStartSteps.current = 0;
        }

        const newTotal = baseSteps.current + (result.steps - sessionStartSteps.current);
        setSteps(newTotal);

        // Periodically save to storage (every 10 steps)
        if (result.steps % 10 === 0) {
          updateStepCount(newTotal);
        }
      });

      setIsPending(false);
    } catch (err) {
      setError('Failed to initialize pedometer');
      setIsPending(false);
      console.error('Pedometer initialization error:', err);
    }
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check if date changed (midnight reset)
        const today = getTodayDateString();
        const storedData = await getOrInitStepData();

        if (storedData.date !== today) {
          // Date changed, reset everything
          baseSteps.current = 0;
          sessionStartSteps.current = null;
          setSteps(0);
        }

        // Reinitialize to get accurate count
        initializePedometer();
      } else if (nextAppState === 'background') {
        // Save current steps when going to background
        await updateStepCount(steps);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription.remove();
    };
  }, [steps, initializePedometer]);

  // Initialize on mount
  useEffect(() => {
    initializePedometer();

    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, [initializePedometer]);

  return { steps, isAvailable, isPending, error };
};
