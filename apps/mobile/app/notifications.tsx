import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');

const NOTIFICATION_TABS = ['All', 'Orders', 'Offers'];

interface Notification {
  id: string;
  type: 'order' | 'offer' | 'info';
  title: string;
  message: string;
  time: string;
  date: string;
  isRead: boolean;
  icon: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped!',
    message: 'Your Classic Aviators are on the way. Expected delivery Oct 15.',
    time: '2h ago',
    date: 'Today',
    isRead: false,
    icon: 'airplane-sharp'
  },
  {
    id: '2',
    type: 'offer',
    title: 'Flash Sale Alert ⚡',
    message: 'Get 30% off on all Blue Light frames for the next 4 hours!',
    time: '5h ago',
    date: 'Today',
    isRead: false,
    icon: 'flash-sharp'
  },
  {
    id: '3',
    type: 'order',
    title: 'Payment Successful',
    message: 'Your payment for order ORD-7721 was received successfully.',
    time: 'Yesterday, 4:30 PM',
    date: 'Yesterday',
    isRead: true,
    icon: 'card-sharp'
  },
  {
    id: '4',
    type: 'info',
    title: 'Address Updated',
    message: 'Your primary shipping address has been successfully updated.',
    time: 'Oct 01, 10:20 AM',
    date: 'Earlier',
    isRead: true,
    icon: 'location-sharp'
  },
  {
    id: '5',
    type: 'offer',
    title: 'New Collection Live! 🕶️',
    message: 'Discover the Vintage 2024 Collection. Limited editions available now.',
    time: 'Sep 28, 09:00 AM',
    date: 'Earlier',
    isRead: true,
    icon: 'sparkles-sharp'
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filteredNotifications = activeTab === 'All'
    ? notifications
    : notifications.filter(n => n.type === activeTab.toLowerCase().slice(0, -1));

  const getSections = () => {
    const grouped = filteredNotifications.reduce((acc: any, notif) => {
      const section = acc.find((s: any) => s.title === notif.date);
      if (section) section.data.push(notif);
      else acc.push({ title: notif.date, data: [notif] });
      return acc;
    }, []);

    const order = { 'Today': 0, 'Yesterday': 1, 'Earlier': 2 };
    return grouped.sort((a: any, b: any) => (order[a.title as keyof typeof order] ?? 3) - (order[b.title as keyof typeof order] ?? 3));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handlePress = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notifItem,
        { borderBottomColor: theme.border },
        !item.isRead && { backgroundColor: theme.primarySoft + '40' }
      ]}
      activeOpacity={0.6}
      onPress={() => handlePress(item.id)}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.isRead ? theme.accent : theme.primaryMedium }]}>
        <Ionicons name={item.icon as any} size={20} color={item.isRead ? theme.subtext : theme.primary} />
      </View>

      <View style={styles.notifBody}>
        <View style={styles.notifTextRow}>
          <Text style={[styles.notifTitleText, { color: theme.text, fontWeight: item.isRead ? '500' : '700' }]}>{item.title}</Text>
          <Text style={[styles.notifTimeText, { color: theme.subtext }]}>{item.time}</Text>
        </View>
        <Text style={[styles.notifMsgText, { color: theme.subtext, opacity: item.isRead ? 0.8 : 1 }]} numberOfLines={2}>{item.message}</Text>
        {!item.isRead && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: isDark ? theme.background : '#F9F9F9' }]}>
      <Text style={[styles.sectionTitleText, { color: theme.subtext }]}>{title}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      {/* Navigation Row */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={[styles.actionText, { color: theme.primary }]}>Read All</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Typography */}
      <Text style={[styles.heroText, { color: theme.text }]}>Stay Updated,</Text>
      <Text style={[styles.heroSubText, { color: theme.text }]}>Never miss a deal.</Text>

      {/* Category Puls (Like Categories Scroll on Home) */}
      <View style={styles.tabContainer}>
        {NOTIFICATION_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabBtn,
              { backgroundColor: activeTab === tab ? theme.primary : theme.card }
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? theme.background : theme.subtext }
            ]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme.primarySoft, theme.background, theme.background, theme.primarySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <SectionList
          sections={getSections()}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Ionicons name="notifications-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notifications</Text>
              <Text style={[styles.emptySub, { color: theme.subtext }]}>We'll let you know when something important happens.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerComponent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  heroSubText: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '300',
    marginBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifBody: {
    flex: 1,
    position: 'relative',
  },
  notifTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitleText: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  notifTimeText: {
    fontSize: 11,
  },
  notifMsgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyView: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});
