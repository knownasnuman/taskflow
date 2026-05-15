// mobile/components/SkeletonCard.tsx
import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export function ProjectSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Soluklaşma animasyonu — sürekli tekrar eder
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      {/* Başlık placeholder */}
      <View style={styles.titleBar} />
      {/* Açıklama placeholder */}
      <View style={styles.descBar} />
      <View style={[styles.descBar, { width: '60%' }]} />
      {/* Footer placeholder */}
      <View style={styles.footer}>
        <View style={styles.footerItem} />
        <View style={styles.footerItem} />
        <View style={styles.footerItem} />
      </View>
    </Animated.View>
  );
}

export function TaskSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.taskCard, { opacity }]}>
      <View style={styles.priorityBar} />
      <View style={styles.taskTitle} />
      <View style={[styles.taskTitle, { width: '60%', marginTop: 6 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Project skeleton
  card: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  titleBar: {
    height: 18,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    width: '70%',
    marginBottom: 12,
  },
  descBar: {
    height: 12,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    width: '90%',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  footerItem: {
    height: 12,
    width: 60,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },

  // Task skeleton
  taskCard: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  priorityBar: {
    height: 3,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 8,
  },
  taskTitle: {
    height: 14,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    width: '80%',
  },
});