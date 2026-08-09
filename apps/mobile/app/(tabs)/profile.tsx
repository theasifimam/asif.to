import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SHADOWS, useAppTheme } from '../../constants/Theme';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setThemePreference, ThemePreference } from '../../store/slices/themeSlice';

import { ConfirmModal } from '../../components/ui/ConfirmModal';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 16) / 2; // (width - horizontal padding - gap) / 2

export default function ProfileScreen() {
  const route = useRouter();
  const dispatch = useDispatch();
  const { isDark: isDarkMode, themePreference, colors: theme } = useAppTheme();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = React.useState(false);

  const [userInfo, setUserInfo] = React.useState({
    name: 'Alexa Morgan',
    email: 'alexa.m@design.io',
    mobile: '+1 (555) 012-3456',
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  });

  const [tempInfo, setTempInfo] = React.useState({ ...userInfo });

  const handleThemeChange = (pref: ThemePreference) => {
    dispatch(setThemePreference(pref));
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(false);
    route.push("/login");
  };

  const handleSaveSettings = () => {
    setUserInfo({ ...tempInfo });
    setIsSettingsModalVisible(false);
  };

  const primaryStats = [
    { label: 'Orders', value: '24' },
    { label: 'Wishlist', value: '12' },
    { label: 'Points', value: '450' },
  ];

  const gridOptions = [
    { id: '1', title: 'Orders', icon: 'cube-outline' },
    { id: '2', title: 'Addresses', icon: 'location-outline' },
    { id: '3', title: 'Payments', icon: 'card-outline' },
    { id: '4', title: 'Wishlist', icon: 'heart-outline' },
    { id: '5', title: 'Coupons', icon: 'pricetag-outline' },
    { id: '6', title: 'Security', icon: 'shield-checkmark-outline' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme.primarySoft, theme.background, theme.background, theme.primarySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Navigation */}
          <View style={styles.headerNav}>
            <TouchableOpacity
              style={[styles.roundBtn, { backgroundColor: theme.accent }]}
              onPress={() => {
                setTempInfo({ ...userInfo });
                setIsSettingsModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Profile Identity Card */}
          <View style={styles.identityContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: userInfo.avatar }}
                style={[styles.avatar, { borderColor: theme.accent }]}
              />
              <View style={[styles.onlineBadge, { borderColor: theme.background }]} />
            </View>
            <Text style={[styles.name, { color: theme.text }]}>{userInfo.name}</Text>
            <Text style={[styles.membershipPill, { backgroundColor: theme.primary, color: theme.background }]}>Gold Member</Text>
          </View>

          {/* High-Contrast Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: theme.accent }]}>
            {primaryStats.map((stat, i) => (
              <View key={stat.label} style={[styles.statItem, i !== 0 && { borderLeftColor: isDarkMode ? '#444' : '#E0E0E0', borderLeftWidth: 1 }]}>
                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Preferences Section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
          <View style={[styles.supportCard, { backgroundColor: theme.card, borderColor: theme.border, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={[styles.iconCircle, { backgroundColor: theme.accent, marginBottom: 0 }]}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={22} color={theme.text} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={[styles.supportTitle, { color: theme.text }]}>App Theme</Text>
                <Text style={[styles.supportSub, { color: theme.subtext }]}>Choose your preference</Text>
              </View>
            </View>

            <View style={[styles.themeSelectorBox, { backgroundColor: theme.accent }]}>
              {(['system', 'light', 'dark'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  style={[
                    styles.themeOptionBtn,
                    themePreference === mode && { backgroundColor: theme.primary }
                  ]}
                >
                  <Text style={[
                    styles.themeOptionText,
                    { color: themePreference === mode ? theme.background : theme.subtext }
                  ]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section Headline */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dashboard</Text>

          {/* Creative Bento Grid */}
          <View style={styles.bentoGrid}>
            {gridOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.bentoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                activeOpacity={0.9}
                onPress={() => {
                  if (opt.title === 'Orders') {
                    route.push('/orders');
                  } else if (opt.title === 'Addresses') {
                    route.push('/addresses');
                  } else if (opt.title === 'Payments') {
                    route.push('/payments');
                  }
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: theme.accent }]}>
                  <Ionicons name={opt.icon as any} size={24} color={theme.text} />
                </View>
                <Text style={[styles.bentoTitle, { color: theme.text }]}>{opt.title}</Text>
                <Ionicons name="arrow-forward-circle" size={20} color={isDarkMode ? '#444' : '#E0E0E0'} style={styles.cardArrow} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Prominent Wide Action */}
          <TouchableOpacity
            style={[styles.supportCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.8}
            onPress={() => route.push('/support')}
          >
            <Ionicons name="headset-outline" size={24} color={theme.text} />
            <View style={styles.supportInfo}>
              <Text style={[styles.supportTitle, { color: theme.text }]}>Customer Support</Text>
              <Text style={[styles.supportSub, { color: theme.subtext }]}>Help center & live chat</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
          </TouchableOpacity>

          {/* Logout Capsule */}
          <TouchableOpacity onPress={() => setIsLogoutModalVisible(true)} style={[styles.logoutBtn, { backgroundColor: theme.accent }]}>
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: theme.text }]}>V 1.2.0 • PRO</Text>
          </View>

          <ConfirmModal
            visible={isLogoutModalVisible}
            onClose={() => setIsLogoutModalVisible(false)}
            onConfirm={handleLogout}
            title="Log Out?"
            message="Are you sure you want to log out? You will need to sign back in to access your dashboard."
            confirmLabel="Log Out"
            isDestructive
            icon="log-out-outline"
          />
        </ScrollView>

        {/* Settings / Edit Profile Modal */}
        <Modal visible={isSettingsModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.modalContent, { backgroundColor: theme.card }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Profile Pic Edit */}
                <View style={styles.editAvatarSection}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: tempInfo.avatar }} style={styles.editAvatar} />
                    <TouchableOpacity style={[styles.editIconBtn, { backgroundColor: theme.primary }]}>
                      <Ionicons name="camera" size={18} color={theme.background} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.editPicLabel, { color: theme.subtext }]}>Tap to change profile picture</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.subtext }]}>FULL NAME</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                    value={tempInfo.name}
                    onChangeText={(t) => setTempInfo({ ...tempInfo, name: t })}
                    placeholder="Enter your name"
                    placeholderTextColor={theme.subtext}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.subtext }]}>MOBILE NUMBER</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                    value={tempInfo.mobile}
                    onChangeText={(t) => setTempInfo({ ...tempInfo, mobile: t })}
                    placeholder="+1 (000) 000-0000"
                    placeholderTextColor={theme.subtext}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.subtext }]}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                    value={tempInfo.email}
                    onChangeText={(t) => setTempInfo({ ...tempInfo, email: t })}
                    placeholder="yourname@example.com"
                    placeholderTextColor={theme.subtext}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Gender Select */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.subtext }]}>GENDER</Text>
                  <View style={[styles.genderContainer, { backgroundColor: theme.accent }]}>
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setTempInfo({ ...tempInfo, gender: g })}
                        style={[
                          styles.genderOption,
                          tempInfo.gender === g && { backgroundColor: theme.primary }
                        ]}
                      >
                        <Text style={[
                          styles.genderText,
                          { color: tempInfo.gender === g ? theme.background : theme.subtext }
                        ]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveSettings}>
                  <Text style={[styles.saveBtnText, { color: theme.background }]}>Update My Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 12,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#F7F8FA',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  membershipPill: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    borderRadius: 24,
    paddingVertical: 20,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8D8D8D',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  bentoCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F7F8FA',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
  },
  cardArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F7F8FA',
    padding: 16,
    borderRadius: 24,
    marginBottom: 40,
  },
  supportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  supportSub: {
    fontSize: 12,
    color: '#8D8D8D',
  },
  logoutBtn: {
    height: 64,
    backgroundColor: '#F7F8FA',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  themeSelectorBox: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    opacity: 0.3,
  },
  versionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editPicLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  input: {
    height: 60,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 6,
    gap: 6,
  },
  genderOption: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.deep,
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
