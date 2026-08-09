import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, SHADOWS, SIZES } from '../constants/Theme';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearCart } from '../store/slices/cartSlice';

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors: theme } = useAppTheme();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [selectedPayment, setSelectedPayment] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subTotal > 0 ? 15 : 0;
  const total = subTotal + shipping;

  const handlePlaceOrder = () => {
    setOrderPlaced(true);

    // Clear cart via dispatch
    dispatch(clearCart());

    setTimeout(() => {
      router.replace('/');
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={[theme.primarySoft, theme.background, theme.background, theme.primarySoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.successContainer, { backgroundColor: 'transparent' }]}>
        <View style={[styles.successCircle, { backgroundColor: theme.accent }]}>
          <Ionicons name="checkmark-circle-outline" size={80} color={theme.text} />
        </View>
        <Text style={[styles.successTitle, { color: theme.text }]}>Order Confirmed!</Text>
        <Text style={[styles.successSub, { color: theme.subtext }]}>Your items are being expertly prepared.</Text>
      </View>
      </View>
    );
  }

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Shipping Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping Address</Text>
          <View style={[styles.bentoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.bentoHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.accent }]}>
                <Ionicons name="location" size={20} color={theme.text} />
              </View>
              <TouchableOpacity>
                <Text style={[styles.editText, { color: theme.primary }]}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.addressInfo}>
              <Text style={[styles.addressName, { color: theme.text }]}>Home</Text>
              <Text style={[styles.addressLine, { color: theme.subtext }]}>123 Designer Avenue, Suite 4B</Text>
              <Text style={[styles.addressLine, { color: theme.subtext }]}>New York, NY 10001</Text>
            </View>
          </View>
        </View>

        {/* Step 2: Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { backgroundColor: theme.card, borderColor: selectedPayment === 'card' ? theme.text : theme.border }
            ]}
            onPress={() => setSelectedPayment('card')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.accent }]}>
                <Ionicons name="card" size={20} color={theme.text} />
              </View>
              <View>
                <Text style={[styles.paymentTitle, { color: theme.text }]}>Credit Card</Text>
                <Text style={[styles.paymentSub, { color: theme.subtext }]}>**** **** **** 4242</Text>
              </View>
            </View>
            <View style={[
              styles.radioCircle,
              { borderColor: selectedPayment === 'card' ? theme.text : theme.border }
            ]}>
              {selectedPayment === 'card' ? <View style={[styles.radioDot, { backgroundColor: theme.text }]} /> : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { backgroundColor: theme.card, borderColor: selectedPayment === 'apple' ? theme.text : theme.border }
            ]}
            onPress={() => setSelectedPayment('apple')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.accent }]}>
                <Ionicons name="logo-apple" size={20} color={theme.text} />
              </View>
              <View>
                <Text style={[styles.paymentTitle, { color: theme.text }]}>Apple Pay</Text>
              </View>
            </View>
            <View style={[
              styles.radioCircle,
              { borderColor: selectedPayment === 'apple' ? theme.text : theme.border }
            ]}>
              {selectedPayment === 'apple' ? <View style={[styles.radioDot, { backgroundColor: theme.text }]} /> : null}
            </View>
          </TouchableOpacity>
        </View>

        {/* Step 3: Order Items Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items ({cartItems.length})</Text>
          <View style={[styles.orderItemsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {cartItems.map((item, index) => (
              <View key={item.id} style={[
                styles.miniItemRow,
                index < cartItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}>
                <Image source={{ uri: item.image }} style={[styles.miniItemImg, { backgroundColor: theme.accent }]} />
                <View style={styles.miniItemInfo}>
                  <Text style={[styles.miniItemName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.miniItemQty, { color: theme.subtext }]}>Qty: {item.quantity}</Text>
                </View>
                <Text style={[styles.miniItemPrice, { color: theme.text }]}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Floating Order Summary */}
      <View style={[styles.floatingSummary, { backgroundColor: theme.background }]}>
        <View style={[styles.summaryBento, { backgroundColor: theme.accent }]}>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Sub-total</Text>
            <Text style={[styles.summaryPrice, { color: theme.text }]}>₹{subTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Shipping</Text>
            <Text style={[styles.summaryPrice, { color: theme.text }]}>₹{shipping.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkoutPill, { backgroundColor: theme.text }]}
          activeOpacity={0.9}
          onPress={handlePlaceOrder}
        >
          <View style={styles.checkoutMain}>
            <Text style={[styles.checkoutLabel, { color: theme.background, opacity: 0.6 }]}>Total to Pay</Text>
            <Text style={[styles.checkoutTotal, { color: theme.background }]}>₹{total.toFixed(2)}</Text>
          </View>
          <View style={[styles.checkoutBtnBox, { backgroundColor: theme.background }]}>
            <Ionicons name="checkmark-done" size={24} color={theme.text} />
          </View>
        </TouchableOpacity>
      </View>
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bentoCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressInfo: {
    paddingLeft: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  paymentSub: {
    fontSize: 13,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orderItemsContainer: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  miniItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  miniItemImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  miniItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniItemQty: {
    fontSize: 12,
  },
  miniItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
    borderTopWidth: 0,
  },
  summaryBento: {
    flexDirection: 'row',
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    gap: 32,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutPill: {
    height: 84,
    borderRadius: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    ...SHADOWS.deep,
  },
  checkoutMain: {
    flex: 1,
  },
  checkoutLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkoutTotal: {
    fontSize: 24,
    fontWeight: '900',
  },
  checkoutBtnBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    ...SHADOWS.deep,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
