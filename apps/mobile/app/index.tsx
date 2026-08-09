import { Redirect } from 'expo-router';

export default function Index() {
  // Initial entry point of the app.
  // Bypass onboarding and redirect directly to the main tabs.
  return <Redirect href="/(tabs)" />;
}
