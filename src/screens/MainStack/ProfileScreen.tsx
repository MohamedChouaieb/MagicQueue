import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5 
} from '@expo/vector-icons';
import { useUser } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ProfileScreen = () => {
  const {setUsername,fullName,counterName,departmentName,totalServed,waitingTime,} = useUser();  
  const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  
  // Animation values
  const toggleAnimation = useState(new Animated.Value(28))[0];
  const statusOpacity = useState(new Animated.Value(0))[0];
  
  // Handle toggle animation
  useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: isOnline ? 28 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    if (statusVisible) {
      Animated.sequence([
        Animated.timing(statusOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(statusOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setStatusVisible(false));
    }
  }, [isOnline, statusVisible]);
  
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    setStatusVisible(true);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fffe" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      
      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.subInfo}>Window {counterName}</Text>
        
        {/* Online Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Online</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.toggleBackground,
              { backgroundColor: isOnline ? '#4ade80' : '#d1d5db' }
            ]}
            onPress={toggleOnlineStatus}
          >
            <Animated.View
              style={[
                styles.toggleCircle,
                {
                  transform: [
                    {
                      translateX: toggleAnimation,
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
        
        {/* Status Message */}
        {statusVisible && (
          <Animated.View 
            style={[
              styles.statusMessage,
              { opacity: statusOpacity }
            ]}
          >
            <Text style={styles.statusText}>
              {isOnline ? 'You are now online' : 'You are now offline'}
            </Text>
          </Animated.View>
        )}
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Role Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="user-tag" size={16} color="#4ade80" />
            <Text style={styles.cardLabel}>Service</Text>
          </View>
          <Text style={styles.cardValue}>{departmentName}</Text>
        </View>
        
        {/* Tickets Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="ticket-confirmation" size={18} color="#4ade80" />
            <Text style={styles.cardLabel}>Total Tickets Today</Text>
          </View>
          <Text style={styles.cardValue}>{totalServed}</Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressLabel}>75% of daily goal</Text>
        </View>
        
        {/* Handling Time Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={18} color="#4ade80" />
            <Text style={styles.cardLabel}>Average Handling Time</Text>
          </View>
          <Text style={styles.cardValue}>{waitingTime} min / ticket</Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressLabel}>40% faster than average</Text>
        </View>
      </View>
      
      {/* Log Out Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="log-out" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      
      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out of your account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={async () => {
                  try {
                    // Clear all stored user data
                    await AsyncStorage.multiRemove([
                      '@username',
                      '@userId',
                      '@counterId',
                      '@departmentId',
                    ]);
                    await setUsername(null);
                    setModalVisible(false);

                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                >
              <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fffe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#111',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '500',
    color: 'white',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
  },
  subInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginRight: 12,
  },
  toggleBackground: {
    width: 56,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusMessage: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
  statsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginTop: 10,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#4ade80',
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ProfileScreen;