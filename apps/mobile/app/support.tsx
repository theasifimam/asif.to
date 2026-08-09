import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, SHADOWS, SIZES } from '../constants/Theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_LIST = [
  { 
    id: '1', 
    question: 'How do I track my order?', 
    answer: 'You can track your order in the "My Orders" section of your profile. Once shipped, you will see a detailed tracking timeline.' 
  },
  { 
    id: '2', 
    question: 'What is your return policy?', 
    answer: 'We offer a 30-day no-questions-asked return policy. Items must be in their original packaging and unworn.' 
  },
  { 
    id: '3', 
    question: 'Are the lenses polarized?', 
    answer: 'Most of our premium frames come with high-quality polarized lenses as standard. Look for the "Polarized" tag on the product page.' 
  },
  { 
    id: '4', 
    question: 'Do you offer prescription lenses?', 
    answer: 'Yes! We offer a wide range of prescription lenses including single vision, progressive, and blue light blocking options.' 
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useAppTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const CONTACT_METHODS = [
    { id: '1', title: 'Live Chat', sub: 'Instant help', icon: 'chatbubbles', color: '#00D084', action: 'Chat Now' },
    { id: '2', title: 'WhatsApp', sub: 'Chat on the go', icon: 'logo-whatsapp', color: '#25D366', action: 'Message' },
    { id: '3', title: 'Email', sub: 'Formal requests', icon: 'mail', color: '#FF9500', action: 'Write Us' },
  ];

  const filteredFaqs = FAQ_LIST.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Text style={[styles.headerTitle, { color: theme.text }]}>Help Center</Text>
            <View style={{ width: 48 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Search Help */}
            <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="search" size={20} color={theme.subtext} />
                <TextInput 
                  placeholder="How can we help?" 
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholderTextColor={theme.subtext}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
            </View>

            {/* Quick Contact Row */}
            <View style={styles.contactRow}>
                {CONTACT_METHODS.map(method => (
                    <TouchableOpacity key={method.id} style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={[styles.iconBox, { backgroundColor: method.color + '20' }]}>
                            <Ionicons name={method.icon as any} size={24} color={method.color} />
                        </View>
                        <Text style={[styles.methodTitle, { color: theme.text }]}>{method.title}</Text>
                        <Text style={[styles.methodSub, { color: theme.subtext }]}>{method.sub}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* FAQs */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
                {filteredFaqs.map(faq => (
                    <TouchableOpacity 
                      key={faq.id} 
                      onPress={() => toggleExpand(faq.id)}
                      style={[styles.faqItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                      activeOpacity={0.7}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                            <Ionicons 
                              name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color={theme.subtext} 
                            />
                        </View>
                        {expandedId === faq.id && (
                            <Text style={[styles.faqAnswer, { color: theme.subtext }]}>{faq.answer}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Knowledge Base Bento */}
            <TouchableOpacity style={[styles.kbBento, { backgroundColor: theme.text }]}>
                <View style={styles.kbInfo}>
                    <Text style={[styles.kbTitle, { color: theme.background }]}>Documentation</Text>
                    <Text style={[styles.kbSub, { color: theme.background, opacity: 0.7 }]}>Lens care, adjustment tips & style guides.</Text>
                </View>
                <View style={[styles.kbIconCircle, { backgroundColor: theme.background }]}>
                    <Ionicons name="book" size={24} color={theme.text} />
                </View>
            </TouchableOpacity>

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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    ...SHADOWS.soft,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 40,
  },
  contactCard: {
    flex: 1,
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodSub: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 4,
  },
  faqContainer: {
    marginBottom: 32,
  },
  faqItem: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  kbBento: {
    flexDirection: 'row',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    ...SHADOWS.deep,
  },
  kbInfo: {
    flex: 1,
  },
  kbTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kbSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  kbIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
