import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, SHADOWS, SIZES } from '../constants/Theme';
import { useRouter } from 'expo-router';

import { ConfirmModal } from '../components/ui/ConfirmModal';

const { width } = Dimensions.get('window');

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Home',
    address: '123 Designer Avenue, Suite 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    address: '456 Creative Blvd, Floor 12',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useAppTheme();
  
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState<Partial<Address>>({});
  const [isEditing, setIsEditing] = useState(false);

  const handleAdd = () => {
    setCurrentAddress({ isDefault: false });
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const handleEdit = (item: Address) => {
    setCurrentAddress(item);
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const requestDelete = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      setAddresses(prev => prev.filter(a => a.id !== addressToDelete));
      setIsDeleteModalVisible(false);
      setAddressToDelete(null);
    }
  };

  const handleSave = () => {
    if (!currentAddress.label || !currentAddress.address || !currentAddress.city) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (isEditing) {
      setAddresses(prev => prev.map(a => a.id === currentAddress.id ? (currentAddress as Address) : a));
    } else {
      const newAddress: Address = {
        ...currentAddress as Address,
        id: Math.random().toString(36).substr(2, 9),
      };
      setAddresses(prev => [...prev, newAddress]);
    }

    // If marked as default, unset others
    if (currentAddress.isDefault) {
      setAddresses(prev => prev.map(a => a.id === (currentAddress.id || prev[prev.length-1]?.id) ? a : { ...a, isDefault: false }));
    }

    setIsModalVisible(false);
  };

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

      <Text 
        style={[styles.heroText, { color: theme.text }]}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
      >Your Places,</Text>
      <Text 
        style={[styles.heroSubText, { color: theme.text }]}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
      >Saved and ready.</Text>
    </View>
  );

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity 
      style={[styles.addressItem, { backgroundColor: theme.card }]}
      activeOpacity={0.8}
      onPress={() => handleEdit(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.accent, flexShrink: 0 }]}>
        <Ionicons name={item.label.toLowerCase() === 'home' ? 'home' : 'business'} size={24} color={theme.text} />
      </View>
      
      <View style={[styles.addressInfo, { flex: 1, flexShrink: 1 }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.addressTitle, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">{item.label}</Text>
          {item.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: theme.primary, flexShrink: 0 }]}>
              <Text style={[styles.defaultText, { color: theme.background }]} numberOfLines={1}>DEFAULT</Text>
            </View>
          )}
        </View>
        <Text style={[styles.addressSubtext, { color: theme.subtext }]} numberOfLines={2} ellipsizeMode="tail">
          {item.address}, {item.city}
        </Text>
      </View>

      <View style={[styles.actionColumn, { flexShrink: 0 }]}>
        <TouchableOpacity style={styles.miniAction} onPress={() => requestDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={theme.destructive} />
        </TouchableOpacity>
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
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddressItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={[styles.addBtn, { backgroundColor: theme.primary, maxWidth: width - 48 }]}
        activeOpacity={0.9}
        onPress={handleAdd}
      >
        <Ionicons name="add" size={24} color={theme.background} />
        <Text 
          style={[styles.addBtnText, { color: theme.background }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >New Address</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title="Remove Place?"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmLabel="Remove"
        isDestructive
        icon="trash"
      />

      {/* Address Form Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.modalContent, { backgroundColor: theme.card }]}
          >
            <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{isEditing ? 'Update Place' : 'Add New Place'}</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                   <Text style={[styles.inputLabel, { color: theme.subtext }]}>LABEL (E.G. HOME, WORK)</Text>
                   <TextInput 
                     style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                     value={currentAddress.label}
                     onChangeText={(t) => setCurrentAddress({...currentAddress, label: t})}
                     placeholder="Home"
                     placeholderTextColor={theme.subtext}
                   />
                </View>

                <View style={styles.inputGroup}>
                   <Text style={[styles.inputLabel, { color: theme.subtext }]}>STREET ADDRESS</Text>
                   <TextInput 
                     style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                     value={currentAddress.address}
                     onChangeText={(t) => setCurrentAddress({...currentAddress, address: t})}
                     placeholder="123 Designer Ave"
                     placeholderTextColor={theme.subtext}
                   />
                </View>

                <View style={[styles.inputRow, { gap: 12 }]}>
                   <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: theme.subtext }]}>CITY</Text>
                      <TextInput 
                        style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                        value={currentAddress.city}
                        onChangeText={(t) => setCurrentAddress({...currentAddress, city: t})}
                        placeholder="New York"
                        placeholderTextColor={theme.subtext}
                      />
                   </View>
                   <View style={[styles.inputGroup, { width: 100 }]}>
                      <Text style={[styles.inputLabel, { color: theme.subtext }]}>ZIP</Text>
                      <TextInput 
                        style={[styles.input, { backgroundColor: theme.accent, color: theme.text }]}
                        value={currentAddress.zip}
                        onChangeText={(t) => setCurrentAddress({...currentAddress, zip: t})}
                        placeholder="10001"
                        placeholderTextColor={theme.subtext}
                        keyboardType="numeric"
                      />
                   </View>
                </View>

                <TouchableOpacity 
                   style={styles.defaultRow}
                   onPress={() => setCurrentAddress({...currentAddress, isDefault: !currentAddress.isDefault})}
                >
                    <Ionicons 
                      name={currentAddress.isDefault ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={currentAddress.isDefault ? theme.primary : theme.subtext} 
                    />
                    <Text style={[styles.defaultLabel, { color: theme.text }]}>Set as Default Address</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
                    <Text style={[styles.saveBtnText, { color: theme.background }]}>{isEditing ? 'Update Address' : 'Register Address'}</Text>
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
  listContent: {
    paddingBottom: 120,
  },
  headerComponent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 30,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
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
    letterSpacing: -1,
  },
  heroSubText: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '300',
    marginBottom: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 28,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: '900',
  },
  addressSubtext: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionColumn: {
    marginLeft: 8,
  },
  miniAction: {
    padding: 8,
  },
  addBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    ...SHADOWS.deep,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
    marginTop: 10,
  },
  defaultLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
