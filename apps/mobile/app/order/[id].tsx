import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, SHADOWS, SIZES } from '../../constants/Theme';

const { width } = Dimensions.get('window');

const TRACKING_STEPS = [
  { id: '1', title: 'Order Placed', time: 'Oct 12, 09:42 AM', status: 'completed', icon: 'checkmark-circle' },
  { id: '2', title: 'Processing', time: 'Oct 12, 11:20 AM', status: 'completed', icon: 'sync' },
  { id: '3', title: 'Shipped', time: 'Oct 13, 08:15 AM', status: 'active', icon: 'airplane' },
  { id: '4', title: 'Out for Delivery', time: 'Pending', status: 'pending', icon: 'bicycle' },
  { id: '5', title: 'Delivered', time: 'Pending', status: 'pending', icon: 'home' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors: theme, isDark } = useAppTheme();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme.primarySoft, theme.background, theme.background, theme.primarySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.card }]} 
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Order Details</Text>
            <TouchableOpacity style={[styles.bellButton, { backgroundColor: theme.accent }]}>
              <Ionicons name="help-buoy-outline" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Summary Bento Card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.summaryTopRow}>
                    <View style={[styles.idBadge, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.idText, { color: theme.background }]}>{id}</Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.subtext }]}>Oct 12, 2023</Text>
                </View>
                <Text style={[styles.amountText, { color: theme.text }]}>₹125.50</Text>
                <View style={[styles.statusBanner, { backgroundColor: theme.accent }]}>
                    <Ionicons name="airplane" size={16} color={theme.primaryDark} />
                    <Text style={[styles.statusBannerText, { color: theme.primaryDark }]}>IN TRANSIT - ARRIVING BY OCT 15</Text>
                </View>
            </View>

            {/* Tracking Timeline */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Track Progress</Text>
            <View style={[styles.timelineContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {TRACKING_STEPS.map((step, index) => (
                    <View key={step.id} style={styles.timelineItem}>
                        <View style={styles.timelineLeftColumn}>
                            <View style={[
                                styles.dot, 
                                { backgroundColor: step.status === 'completed' ? theme.primary : step.status === 'active' ? theme.primary : theme.border },
                                step.status === 'active' && { borderWidth: 4, borderColor: theme.primaryMedium }
                            ]}>
                                {step.status === 'completed' && <Ionicons name="checkmark" size={12} color={theme.background} />}
                            </View>
                            {index !== TRACKING_STEPS.length - 1 && (
                                <View style={[styles.line, { backgroundColor: step.status === 'completed' ? theme.primary : theme.border }]} />
                            )}
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={[
                                styles.stepTitle, 
                                { color: step.status === 'pending' ? theme.subtext : theme.text },
                                step.status === 'active' && { fontWeight: 'bold' }
                            ]}>{step.title}</Text>
                            <Text style={[styles.stepTime, { color: theme.subtext }]}>{step.time}</Text>
                        </View>
                        <Ionicons 
                          name={step.icon as any} 
                          size={20} 
                          color={step.status === 'pending' ? theme.border : theme.primary} 
                          style={styles.stepIcon}
                        />
                    </View>
                ))}
            </View>

            {/* Itemized Receipt */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Purchased Items</Text>
            <View style={[styles.itemsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.itemRow}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=200' }} 
                      style={[styles.itemImg, { backgroundColor: theme.accent }]} 
                    />
                    <View style={styles.itemDetails}>
                        <Text style={[styles.itemName, { color: theme.text }]}>Classic Aviator</Text>
                        <Text style={[styles.itemSub, { color: theme.subtext }]}>Gold Frame • Polarized</Text>
                        <View style={styles.priceQtyRow}>
                            <Text style={[styles.itemPrice, { color: theme.text }]}>₹125.50</Text>
                            <Text style={[styles.itemQty, { color: theme.subtext }]}>QTY: 1</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsBox}>
                <TouchableOpacity style={[styles.reorderBtn, { backgroundColor: theme.text }]}>
                    <Ionicons name="refresh" size={20} color={theme.background} />
                    <Text style={[styles.reorderText, { color: theme.background }]}>Buy Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.invoiceBtn, { borderColor: theme.border, borderWidth: 1 }]}>
                    <Text style={[styles.invoiceText, { color: theme.text }]}>Get Invoice</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  summaryCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    ...SHADOWS.soft,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  idBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  idText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 13,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
  },
  statusBannerText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  timelineContainer: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 4,
    minHeight: 60,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  stepTime: {
    fontSize: 12,
  },
  stepIcon: {
    opacity: 0.8,
  },
  itemsCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 16,
  },
  itemImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSub: {
    fontSize: 12,
    marginBottom: 8,
  },
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsBox: {
    flexDirection: 'row',
    gap: 12,
  },
  reorderBtn: {
    flex: 2,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.deep,
  },
  reorderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  invoiceBtn: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
