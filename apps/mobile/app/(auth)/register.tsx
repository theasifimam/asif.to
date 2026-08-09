import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SHADOWS, useAppTheme } from '../../constants/Theme';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const { colors: theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Immersive Header Image */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=1000' }}
          style={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Join Us</Text>
            <Text style={styles.heroSubtitle}>Start your vision journey.</Text>
          </View>
        </ImageBackground>

        {/* Floating Form Container */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSub}>Become a part of our exclusive community.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#8D8D8D" style={styles.inputIcon} />
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#CCCCCC"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#8D8D8D" style={styles.inputIcon} />
              <TextInput
                placeholder="example@vision.com"
                placeholderTextColor="#CCCCCC"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8D8D8D" style={styles.inputIcon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#CCCCCC"
                style={styles.input}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.9}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.mainBtnText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.socialSection}>
            <Text style={styles.socialLabel}>Or sign up with</Text>
            <View style={styles.socialGrid}>
              <TouchableOpacity style={styles.socialCircle}>
                <Ionicons name="logo-google" size={22} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCircle}>
                <Ionicons name="logo-apple" size={22} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    height: height * 0.4,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroTextContainer: {
    marginTop: 40,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -2,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 40,
    ...SHADOWS.deep,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  formSub: {
    fontSize: 15,
    color: '#8D8D8D',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    height: 56,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  mainBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  socialLabel: {
    fontSize: 13,
    color: '#8D8D8D',
    fontWeight: 'bold',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  socialCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#8D8D8D',
  },
  footerLink: {
    fontSize: 15,
    color: '#000000',
    fontWeight: 'bold',
  },
});
