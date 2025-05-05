import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  Modal,
  Easing,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Profile: undefined;
};

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width, height } = Dimensions.get('window');
export default function Dashboard() {
  // State management
  const [currentTicket, setCurrentTicket] = useState('A015');
  const [previousTicket, setPreviousTicket] = useState('A015');
  const [ticketStatus, setTicketStatus] = useState('Treated'); // Default is 'Treated'
  const [showStatusModal, setShowStatusModal] = useState(false);
  const navigation = useNavigation<DashboardNavigationProp>();
  const [todaysStats, setTodaysStats] = useState({
    totalTickets: 42,
    avgWaitTime: '8 min'
  });
  
  // Agent information
  const [agentInfo, setAgentInfo] = useState({
    windowNumber: 3,
    name: 'Sarah'
  });

  // Animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const qualifierButtonScale = useRef(new Animated.Value(1)).current;
  const transferButtonScale = useRef(new Animated.Value(1)).current;
  const statusModalScale = useRef(new Animated.Value(0)).current;
  const statusModalOpacity = useRef(new Animated.Value(0)).current;
  const ticketNumberOpacity = useRef(new Animated.Value(1)).current;
  const ticketNumberScale = useRef(new Animated.Value(1)).current;
  const ticketTreatedAnimation = useRef(new Animated.Value(0)).current;
  const ticketAbsentAnimation = useRef(new Animated.Value(0)).current;
  const refreshButtonRotation = useRef(new Animated.Value(0)).current;

  // Counter animation for ticket number
  const animateTicketNumberChange = (prevNum: string, newNum: React.SetStateAction<string>) => {
    // Fade out & scale down
    Animated.parallel([
      Animated.timing(ticketNumberOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(ticketNumberScale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Change number, then fade in & scale up
      setPreviousTicket(newNum);
      Animated.parallel([
        Animated.timing(ticketNumberOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(ticketNumberScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  // Animate refresh button rotation
  const animateRefreshButton = () => {
    refreshButtonRotation.setValue(0);
    Animated.timing(refreshButtonRotation, {
      toValue: 1,
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolation = refreshButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Handle qualifier button press - show status modal
  const handleQualifierPress = () => {
    Animated.sequence([
      Animated.timing(qualifierButtonScale, {
        toValue: 0.93,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(qualifierButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    setShowStatusModal(true);
    animateStatusModal(true);
  };

  // Handle transfer button press
  const handleTransferPress = () => {
    Animated.sequence([
      Animated.timing(transferButtonScale, {
        toValue: 0.93,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(transferButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Handle generating new ticket (Next button)
  const handleNextTicket = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    // Default ticket status as Treated
    setTicketStatus('Treated');
    
    // Reset animations and animate new status
    resetStatusAnimations();
    
    // After a short delay, animate treated status
    setTimeout(() => {
      Animated.timing(ticketTreatedAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);
    
    // Generate new ticket number
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomNumber = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const newTicket = `${randomLetter}${randomNumber}`;
    
    // Animate the ticket number change
    animateTicketNumberChange(currentTicket, newTicket);
    setCurrentTicket(newTicket);
    
    // Update stats
    setTodaysStats(prev => ({
      ...prev,
      totalTickets: prev.totalTickets + 1
    }));
  };

  // Handle status selection from modal
  const handleStatusChange = (status: React.SetStateAction<string>) => {
    setTicketStatus(status);
    animateStatusModal(false);
    
    // Reset animations
    resetStatusAnimations();
    
    // Animate selected status
    setTimeout(() => {
      if (status === 'Treated') {
        Animated.timing(ticketTreatedAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (status === 'Absent') {
        Animated.timing(ticketAbsentAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, 200);
  };

  // Reset status animations
  const resetStatusAnimations = () => {
    ticketTreatedAnimation.setValue(0);
    ticketAbsentAnimation.setValue(0);
  };

  // Animate status modal
  const animateStatusModal = (show: boolean) => {
    Animated.parallel([
      Animated.timing(statusModalScale, {
        toValue: show ? 1 : 0,
        duration: 250,
        easing: show ? Easing.out(Easing.back(1.5)) : Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(statusModalOpacity, {
        toValue: show ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (!show) setShowStatusModal(false);
    });
  };

  // Handle test connection error
  const handleTestConnectionError = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Error',
        params: {
          screen: 'ConnectionError'
        }
      })
    );
  };

  // Handle test server error
  const handleTestServerError = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Error',
        params: {
          screen: 'ServerError'
        }
      })
    );
  };

  // Shadow generator helper
  const generateShadowStyle = (elevation: number) => {
    return {
      elevation,
      shadowColor: '#006C4C',
      shadowOffset: { width: 0, height: elevation * 0.5 },
      shadowOpacity: 0.15,
      shadowRadius: elevation * 0.8,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffc" />
      
      {/* Top Bar showing Window number/Agent name */}
      <View style={styles.topBar}>
        <Feather name="monitor" size={16} color="#006C4C" style={{ marginRight: 8 }} />
        <Text style={styles.topBarText}>Window {agentInfo.windowNumber}</Text>
        <View style={styles.agentContainer}>
          <View style={styles.agentDot} />
          <TouchableOpacity
          onPress={() => {navigation.navigate('Profile')}}
          >
          <Text style={styles.agentName}>{agentInfo.name}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Header with refresh icon */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.smallTitle}>CURRENT TICKET</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          activeOpacity={0.6}
          onPress={animateRefreshButton}
        >
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Feather name="refresh-cw" size={18} color="#006C4C" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Ticket Number - Animated */}
      <Animated.View 
        style={[
          styles.ticketNumberContainer,
          { 
            opacity: ticketNumberOpacity,
            transform: [{ scale: ticketNumberScale }]
          }
        ]}
      >
        <Text style={styles.ticketNumber}>{previousTicket}</Text>
        
        {/* Status indicators */}
        <View style={styles.statusIndicators}>
          <Animated.View 
            style={[
              styles.statusIndicator, 
              styles.absentIndicator,
              { 
                opacity: ticketAbsentAnimation,
                transform: [{ scale: Animated.add(0.8, Animated.multiply(ticketAbsentAnimation, 0.2)) }]
              }
            ]}
          >
            <Text style={styles.statusIndicatorText}>Absent</Text>
            <Feather name="user-x" size={14} color="#E86C00" style={{ marginLeft: 5 }} />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statusIndicator, 
              styles.treatedIndicator,
              { 
                opacity: ticketTreatedAnimation,
                transform: [{ scale: Animated.add(0.8, Animated.multiply(ticketTreatedAnimation, 0.2)) }]
              }
            ]}
          >
            <Text style={styles.statusIndicatorText}>Treated</Text>
            <Feather name="check-circle" size={14} color="#006C4C" style={{ marginLeft: 5 }} />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Next Ticket Button - Animated */}
      <Animated.View 
        style={[
          styles.nextButtonContainer,
          { transform: [{ scale: buttonScale }] },
          generateShadowStyle(4)
        ]}
      >
        <LinearGradient
          colors={['#00875f', '#006C4C']}
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextTicket}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next Ticket</Text>
            <Feather name="arrow-right-circle" size={20} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Additional Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Animated.View 
          style={[
            styles.actionButtonWrapper,
            { transform: [{ scale: qualifierButtonScale }] }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, generateShadowStyle(2)]}
            activeOpacity={0.7}
            onPress={handleQualifierPress}
          >
            <Feather name="sliders" size={15} color="#006C4C" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Qualifier</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionButtonWrapper,
            { transform: [{ scale: transferButtonScale }] }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, generateShadowStyle(2)]}
            activeOpacity={0.7}
            onPress={handleTransferPress}
          >
            <Feather name="repeat" size={15} color="#006C4C" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Transfer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Test Error Buttons */}
      <View style={styles.testButtonsContainer}>
        <Text style={styles.testButtonsHeader}>Testing Tools:</Text>
        <View style={styles.testButtonsRow}>
          <TouchableOpacity 
            style={[styles.testButton, styles.testConnectionButton]}
            onPress={handleTestConnectionError}
          >
            <Feather name="wifi-off" size={14} color="#E86C00" style={{ marginRight: 6 }} />
            <Text style={styles.testButtonText}>Test Connection Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.testServerButton]}
            onPress={handleTestServerError}
          >
            <Feather name="server" size={14} color="#D03050" style={{ marginRight: 6 }} />
            <Text style={styles.testButtonText}>Test Server Error</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Footer Stats */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(248, 255, 252, 0)', '#f8fffc']}
          style={styles.footerGradient}
        />
        <View style={styles.footerContent}>
          <View style={styles.statContainer}>
            <Text style={styles.statLabel}>Today's Tickets</Text>
            <Text style={styles.statValue}>{todaysStats.totalTickets}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statContainer}>
            <Text style={styles.statLabel}>Avg. Wait Time</Text>
            <Text style={styles.statValue}>{todaysStats.avgWaitTime}</Text>
          </View>
        </View>
      </View>
      
      {/* Status Modal Popup */}
      <Modal
        transparent={true}
        visible={showStatusModal}
        animationType="none"
        onRequestClose={() => animateStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => animateStatusModal(false)}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: statusModalOpacity,
                transform: [{ scale: statusModalScale }]
              },
              generateShadowStyle(10)
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => animateStatusModal(false)}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleStatusChange('Absent')}
            >
              <View style={[styles.modalIconCircle, { backgroundColor: 'rgba(232, 108, 0, 0.1)' }]}>
                <Feather name="user-x" size={18} color="#E86C00" />
              </View>
              <Text style={styles.modalOptionText}>Mark as Absent</Text>
            </TouchableOpacity>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleStatusChange('Treated')}
            >
              <View style={[styles.modalIconCircle, { backgroundColor: 'rgba(0, 108, 76, 0.1)' }]}>
                <Feather name="check-circle" size={18} color="#006C4C" />
              </View>
              <Text style={styles.modalOptionText}>Mark as Treated</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffc',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // Top bar styles
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 108, 76, 0.06)',
  },
  topBarText: {
    fontSize: 14,
    color: '#006C4C',
    fontFamily: 'Poppins-Medium',
  },
  agentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  agentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C281',
    marginRight: 6,
  },
  agentName: {
    fontSize: 14,
    color: '#00C281',
    fontFamily: 'Poppins-Medium',
  },
  // Header styles
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 25,
  },
  smallTitle: {
    fontSize: 14,
    color: '#006C4C',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 1,
    opacity: 0.8,
  },
  refreshButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0, 108, 76, 0.04)',
  },
  // Ticket number styles
  ticketNumberContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  ticketNumber: {
    fontSize: 100,
    fontFamily: 'Poppins-Bold',
    color: '#006C4C',
    letterSpacing: -2,
  },
  statusIndicators: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  absentIndicator: {
    backgroundColor: 'rgba(232, 108, 0, 0.1)',
  },
  treatedIndicator: {
    backgroundColor: 'rgba(0, 108, 76, 0.1)',
  },
  statusIndicatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#006C4C',
  },
  // Next button styles
  nextButtonContainer: {
    width: width * 0.85,
    height: 58,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  nextButtonGradient: {
    flex: 1,
    borderRadius: 16,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  // Action buttons styles
  actionButtonsContainer: {
    width: width * 0.85,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonWrapper: {
    width: width * 0.4,
  },
  actionButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 245, 240, 0.5)',
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#006C4C',
  },
  // Test buttons styles
  testButtonsContainer: {
    width: width * 0.85,
    marginTop: 20,
    marginBottom: 10,
  },
  testButtonsHeader: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  testButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: width * 0.41,
  },
  testConnectionButton: {
    backgroundColor: 'rgba(232, 108, 0, 0.07)',
    borderColor: 'rgba(232, 108, 0, 0.2)',
  },
  testServerButton: {
    backgroundColor: 'rgba(208, 48, 80, 0.07)',
    borderColor: 'rgba(208, 48, 80, 0.2)',
  },
  testButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statContainer: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: '#006C4C',
    fontFamily: 'Poppins-Bold',
  },
  statDivider: {
    height: 30,
    width: 1,
    backgroundColor: 'rgba(0, 108, 76, 0.1)',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#006C4C',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  modalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginLeft: 76,
  },
});