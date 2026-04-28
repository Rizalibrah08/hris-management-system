import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Image, ScrollView, Platform, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function OfficeAssetsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Office Assets</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.cardContainer}>
            <Text style={styles.sectionTitle}>Assets Information</Text>
            <Text style={styles.sectionSubtitle}>Your office assets information</Text>
            
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' }} 
              style={styles.assetImage} 
              resizeMode="cover" 
            />

            {/* Asset Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Assets Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="laptop-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <Text style={styles.inputText}>Laptop Macbook Air M1 2020</Text>
              </View>
            </View>

            {/* Brand */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Brand</Text>
              <View style={styles.inputBox}>
                <Ionicons name="apps-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <Text style={styles.inputText}>Apple</Text>
              </View>
            </View>

            {/* Warranty Status */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Warranty Status</Text>
              <View style={styles.inputBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <Text style={styles.inputText}>Off</Text>
              </View>
            </View>

            {/* Buying Date */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Buying Date</Text>
              <View style={styles.inputBox}>
                <Ionicons name="pricetag-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <Text style={styles.inputText}>12 September 2020</Text>
              </View>
            </View>

            {/* Received On */}
            <View style={[styles.inputWrapper, { marginBottom: 10 }]}>
              <Text style={styles.inputLabel}>Received On</Text>
              <View style={[styles.inputBox, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                  <Text style={styles.inputText}>14 September 2020</Text>
                </View>
                <Ionicons name="chevron-down-outline" size={20} color="#8B5CF6" />
              </View>
            </View>

          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  assetImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    fontSize: 15,
    color: '#111827',
  },
});
