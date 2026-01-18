import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ProgressRing } from './ProgressRing';
import { usePedometer } from '../hooks/usePedometer';
import { STEP_GOAL } from '../types';

export const StepCounter: React.FC = () => {
  const { steps, isAvailable, isPending, error } = usePedometer();
  const progress = steps / STEP_GOAL;
  const percentage = Math.min(Math.round(progress * 100), 100);

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  if (error || !isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Pedometer Unavailable</Text>
          <Text style={styles.errorText}>
            {error || 'This device does not support step counting.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressRing progress={progress} size={280} strokeWidth={12}>
        <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>
        <Text style={styles.stepsLabel}>steps</Text>
      </ProgressRing>

      <View style={styles.goalContainer}>
        <Text style={styles.goalText}>
          {percentage}% of {STEP_GOAL.toLocaleString()} steps
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepCount: {
    fontSize: 56,
    fontWeight: '300',
    color: '#000000',
    letterSpacing: -2,
  },
  stepsLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    marginTop: 4,
  },
  goalContainer: {
    marginTop: 48,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
