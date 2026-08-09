import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../constants/Theme';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ORDER_CATEGORIES = ['All', 'Placed', 'Shipped', 'Delivered'];

const MOCK_ORDERS = [
  {
    id: 'ORD-7721',
    date: 'Oct 12, 2023',
    status: 'Delivered',
    total: 125.50,
    items: [
      { name: 'Classic Aviator', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    id: 'ORD-8829',
    date: 'Sep 28, 2023',
    status: 'Delivered',
    total: 89.00,
    items: [
      { name: 'Modern Round', image: 'https://images.unsplash.com/photo-1511499767350-a1590fdb2863?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    id: 'ORD-9912',
    date: 'Dec 15, 2023',
    status: 'Shipped',
    total: 150.00,
    items: [
      { name: 'Slim Frame', image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=200' }
    ]
  }
];

export default function OrdersScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useAppTheme();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredOrders = activeCategory === 'All'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === activeCategory);

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bellButton, { backgroundColor: theme.accent }]}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.heroText, { color: theme.text }]}>Your Orders,</Text>
      <Text style={[styles.heroSubText, { color: theme.text }]}>Tracked and ready.</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={ORDER_CATEGORIES}
        keyExtractor={(item) => item}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryPill,
              { backgroundColor: activeCategory === item ? theme.text : theme.card }
            ]}
            onPress={() => setActiveCategory(item)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryText,
                { color: activeCategory === item ? theme.background : theme.subtext },
                activeCategory === item && styles.categoryTextActive
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderOrderItem = ({ item }: { item: typeof MOCK_ORDERS[0] }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/order/${item.id}`)}
    >
      <View style={[styles.orderImageContainer, { backgroundColor: theme.accent }]}>
        <Image source={{ uri: item.items[0].image }} style={styles.orderImage} resizeMode="cover" />

        {/* Status Label (instead of heart) */}
        <View style={[styles.statusBadge, { backgroundColor: theme.card }]}>
          <Text style={[styles.statusText, { color: theme.text }]}>{item.status}</Text>
        </View>

        {/* Price Pill */}
        <View style={[styles.pricePill, { backgroundColor: theme.text }]}>
          <Text style={[styles.priceText, { color: theme.background }]}>₹{item.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.orderIdRow}>
          <Text style={[styles.orderId, { color: theme.text }]} numberOfLines={1}>{item.id}</Text>
          <View style={styles.itemCountBubble}>
            <Ionicons name="cube-outline" size={12} color={theme.rating} />
            <Text style={[styles.itemCount, { color: theme.subtext }]}>{item.items.length} Items</Text>
          </View>
        </View>
        <Text style={[styles.orderDate, { color: theme.subtext }]}>{item.date} • Standard Shipping</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme.primarySoft, theme.background, theme.background, theme.primarySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} style={{ marginBottom: 16, opacity: 0.2 }} color={theme.text} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No orders found here.</Text>
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
  listContent: {
    paddingBottom: 100,
  },
  headerComponent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 20,
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
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
  },
  categoriesList: {
    flexGrow: 0,
  },
  categoriesContent: {
    gap: 8,
    paddingRight: 24,
  },
  categoryPill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  orderCard: {
    width: (width - 48 - 16) / 2,
    marginBottom: 24,
  },
  orderImageContainer: {
    height: 180,
    width: '100%',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  orderImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pricePill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderInfo: {
    paddingTop: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  orderDate: {
    fontSize: 11,
  },
  itemCountBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  }
});

