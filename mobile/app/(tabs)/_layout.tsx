import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="projects/index" />
      <Stack.Screen name="projects/create" />
      <Stack.Screen name="projects/[id]" />
      <Stack.Screen name="projects/members" />
    </Stack>
  );
}