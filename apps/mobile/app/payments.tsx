import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, SHADOWS, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const SAVED_CARDS = [
  { 
    id: '1', 
    type: 'Visa', 
    number: '**** **** **** 4242', 
    expiry: '12/25', 
    holder: 'Alexa Morgan', 
    colors: ['#000000', '#434343'],
    logo: 'logo-visa'
  },
  { 
    id: '2', 
    type: 'Mastercard', 
    number: '**** **** **** 8829', 
    expiry: '08/24', 
    holder: 'Alexa Morgan', 
    colors: ['#00D084', '#008060'],
    logo: 'logo-mastercard'
  },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useAppTheme();
  const [applePayEnabled, setApplePayEnabled] = useState(true);

  const renderCard = (card: typeof SAVED_CARDS[0]) => (
    <View key={card.id} style={styles.cardContainer}>
        <LinearGradient
            colors={card.colors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.creditCard}
        >
            <View style={styles.cardHeader}>
                <Ionicons name="wifi-outline" size={24} color="#FFF" style={{ transform: [{ rotate: '90deg' }] }} />
                <Text style={styles.cardTypeText}>{card.type}</Text>
            </View>
            
            <Text style={styles.cardNumberText}>{card.number}</Text>
            
            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.cardLabel}>CARD HOLDER</Text>
                    <Text style={styles.cardValue}>{card.holder}</Text>
                </View>
                <View>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardValue}>{card.expiry}</Text>
                </View>
            </View>
        </LinearGradient>
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
      
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.card }]} 
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Payment Methods</Text>
            <View style={{ width: 48 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Cards</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                snapToInterval={CARD_WIDTH + 24}
                decelerationRate="fast"
                contentContainerStyle={styles.cardScroll}
            >
                {SAVED_CARDS.map(renderCard)}
                
                {/* Add New Card Placeholder */}
                <TouchableOpacity style={[styles.addCardPlaceholder, { borderColor: theme.border, backgroundColor: theme.card }]}>
                    <View style={[styles.addIconCircle, { backgroundColor: theme.accent }]}>
                        <Ionicons name="add" size={32} color={theme.primary} />
                    </View>
                    <Text style={[styles.addCardText, { color: theme.text }]}>Add New Card</Text>
                </TouchableOpacity>
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 40 }]}>Fast Checkout</Text>
            
            {/* Apple Pay Toggle Bento Card */}
            <View style={[styles.bentoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.bentoLeft}>
                    <View style={[styles.iconBox, { backgroundColor: '#000' }]}>
                        <Ionicons name="logo-apple" size={24} color="#FFF" />
                    </View>
                    <View style={styles.bentoInfo}>
                        <Text style={[styles.bentoTitle, { color: theme.text }]}>Apple Pay</Text>
                        <Text style={[styles.bentoSub, { color: theme.subtext }]}>Express checkout enabled</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.toggleBackground, { backgroundColor: applePayEnabled ? theme.primary : theme.border }]}
                    onPress={() => setApplePayEnabled(!applePayEnabled)}
                >
                    <View style={[styles.toggleDot, applePayEnabled ? { right: 4 } : { left: 4 }, { backgroundColor: theme.background }]} />
                </TouchableOpacity>
            </View>

            {/* Google Pay / Other Bento Card */}
            <View style={[styles.bentoCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 16 }]}>
                <View style={styles.bentoLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.accent }]}>
                        <Ionicons name="wallet-outline" size={24} color={theme.text} />
                    </View>
                    <View style={styles.bentoInfo}>
                        <Text style={[styles.bentoTitle, { color: theme.text }]}>Digital Wallet</Text>
                        <Text style={[styles.bentoSub, { color: theme.subtext }]}>Google Pay not linked</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Text style={[styles.linkActionText, { color: theme.primary }]}>Link</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.securityBanner}>
                <Ionicons name="shield-checkmark" size={20} color={theme.primaryDark} />
                <Text style={[styles.securityText, { color: theme.primaryDark }]}>All payments are encrypted and 100% secure.</Text>
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
    marginBottom: 24,
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
  scrollContent: {
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  cardScroll: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.deep,
  },
  creditCard: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  cardNumberText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginVertical: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addCardPlaceholder: {
    width: 140,
    height: 200,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  addIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bentoCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.soft,
  },
  bentoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoInfo: {
    justifyContent: 'center',
  },
  bentoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bentoSub: {
    fontSize: 12,
  },
  toggleBackground: {
    width: 50,
    height: 28,
    borderRadius: 14,
    position: 'relative',
    justifyContent: 'center',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  linkActionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
    opacity: 0.7,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
  }
});
