import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Image, ScrollView, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.bodyContainer}>
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBox}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/300?img=11' }} 
                style={styles.avatarImage} 
                resizeMode="cover" 
              />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>Rizal Ibrahim</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={styles.verifiedIcon} />
            </View>
            <Text style={styles.userRole}>C I O</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTACT</Text>
            <View style={styles.cardInfo}>
              <View style={styles.itemRow}>
                <Ionicons name="mail" size={20} color="#8B5CF6" style={styles.itemIcon} />
                <Text style={styles.itemText}>rizal@gmail.com</Text>
              </View>
              <View style={[styles.itemRow, { marginBottom: 0 }]}>
                <Ionicons name="location" size={20} color="#8B5CF6" style={styles.itemIcon} />
                <Text style={styles.itemText}>Taman Anggrek</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <View style={styles.cardInfo}>
              <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Ionicons name="person" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Personal Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Ionicons name="folder" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Office Assets</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionRow, { marginBottom: 0 }]} onPress={() => navigation.navigate('PayrollTax')}>
                <View style={styles.actionLeft}>
                  <Ionicons name="cash" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Payroll & Tax</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
            <View style={styles.cardInfo}>
              <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Ionicons name="settings" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Ionicons name="code-working" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Versioning</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Ionicons name="chatbox-ellipses" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>FAQ and Help</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionRow, { marginBottom: 0 }]} onPress={() => {}}>
                <View style={styles.actionLeft}>
                  <Ionicons name="log-out" size={20} color="#EF4444" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  headerBackground: {
    backgroundColor: '#8B5CF6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15, // to create space identical to design
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 20,
    zIndex: 10,
    elevation: 10,
  },
  avatarBox: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#D8B4E2', // default color if image fails
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 6,
  },
  verifiedIcon: {
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#8B5CF6',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 10,
    marginLeft: 4,
  },
  cardInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 14,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});
