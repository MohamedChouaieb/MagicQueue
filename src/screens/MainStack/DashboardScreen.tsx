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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../../contexts/UserContext';

type RootStackParamList = {
  Profile: undefined;
};

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width, height } = Dimensions.get('window');
export default function Dashboard() {
  // State management
  const { userId, counterId, departmentId } = useUser();
  const { fullName, counterName, totalServed, waitingTime, loading } = useUser();
  const { setTotalServed, setWaitingTime } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState('');
  const [previousTicket, setPreviousTicket] = useState('----');
  const [ticketStatus, setTicketStatus] = useState('Treated');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const navigation = useNavigation<DashboardNavigationProp>();
  const [currentCallId, setCurrentCallId] = useState<number | null>(null);

  // Cooldown state and animation
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(10);
  const cooldownAnimation = useRef(new Animated.Value(0)).current;
  const loadingAnimation = useRef(new Animated.Value(0)).current;

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
  const ticketRecalledAnimation = useRef(new Animated.Value(0)).current;

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const refreshTotals = async () => {
    animateRefreshButton();
    resetStatusAnimations();
    animateStatusIndicator(ticketRecalledAnimation, 'Recalled');
    setTimeout(() => {
      Animated.timing(ticketRecalledAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 7000);
    try {
      //* Step 1: Recall the current call if there's one
      if (currentCallId !== null) {
        const recallResponse = await fetch('http://141.95.161.231/magic-queue/public/api/calls/recall', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ call_id: currentCallId }),
        });
  
        if (!recallResponse.ok) {
          throw new Error('Failed to recall ticket');
        }
  
        const recallData = await recallResponse.json();
        if (recallData.call && recallData.call.id) {
          setCurrentCallId(recallData.call.id); //! Store the call ID in state
        }
        console.log('Recall response:', recallData);
      }
  
      //* Step 2: Refresh totals from index
      const response = await fetch('http://141.95.161.231/magic-queue/public/api/index', {
        headers: { 'Accept': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch totals');
      }
  
      const indexData = await response.json();
      console.log('Index data:', indexData);
  
      await setTotalServed(indexData.totalServed);
      await setWaitingTime(indexData.tmpAttente);
    } catch (error) {
      console.error('Failed to refresh totals or recall ticket:', error);
    }
  };
  
  
  // Rotate loading animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingAnimation.setValue(0);
    }
  }, [isLoading]);

  // Loading rotation interpolation
  const loadingRotateInterpolation = loadingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

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

  // Start cooldown timer
  const startCooldown = () => {
    setButtonCooldown(true);
    setCooldownSeconds(10);
    
    // Reset and animate the cooldown circle
    cooldownAnimation.setValue(0);
    Animated.timing(cooldownAnimation, {
      toValue: 1,
      duration: 10000, // 10 seconds
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    
    // Countdown timer
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setButtonCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle generating new ticket (Next button)
  const handleNextTicket = async () => {
    // If button is in cooldown or loading, don't do anything
    if (buttonCooldown || isLoading) return;
    resetStatusAnimations();
    animateStatusIndicator(ticketTreatedAnimation, 'Treated');
    setTicketStatus('Treated');
    // Set loading state
    setIsLoading(true);
  
    try {
      const response = await fetch('http://141.95.161.231/magic-queue/public/api/calls/next', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          counter_id: counterId,
          department_id: departmentId,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.ticket) {
        animateTicketNumberChange(currentTicket, data.ticket);
        setCurrentTicket(data.ticket);
        if (data.call && data.call.id) {
          setCurrentCallId(data.call.id); // Store the call ID in state
        }
      } else {
        // Fallback if no ticket is available
        animateTicketNumberChange(currentTicket, '----');
        setCurrentTicket('----');
        setCurrentCallId(null); // Reset call ID if no ticket
      }
    } catch (error) {
      console.error('Failed to fetch next ticket:', error);
      animateTicketNumberChange(currentTicket, 'ERR');
      setCurrentTicket('ERR');
      setCurrentCallId(null); // Reset call ID on error
    } finally {
      // Stop loading state and start cooldown
      setIsLoading(false);
      startCooldown();
    }
  
    setTimeout(() => {
      Animated.timing(ticketTreatedAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 7000);
  };  

  // Enhanced animation for status indicators
const animateStatusIndicator = (animationRef: Animated.Value | Animated.ValueXY, status: any) => {
  resetStatusAnimations();
  
  // Bounce-in animation with subtle pulse effect
  Animated.sequence([
    // Quick scale up
    Animated.spring(animationRef, {
      toValue: 1.1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }),
    // Scale back to normal
    Animated.spring(animationRef, {
      toValue: 1,
      friction: 5,
      tension: 170,
      useNativeDriver: true,
    }),
  ]).start();
  
  // Set a timer to fade out the status after 7 seconds
  setTimeout(() => {
    Animated.timing(animationRef, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, 7000);
};
  // Handle status selection from modal
 // Handle status selection from modal
const handleStatusChange = (status: React.SetStateAction<string>) => {
  setTicketStatus(status);
  animateStatusModal(false);
  
  // Reset animations first
  resetStatusAnimations();
  
  // Animate the selected status immediately after reset
  if (status === 'Treated') {
    animateStatusIndicator(ticketTreatedAnimation, 'Treated');
  } else if (status === 'Absent') {
    animateStatusIndicator(ticketAbsentAnimation, 'Absent');
  }
  
  // Set timeout to hide the status indicator after 7 seconds
  setTimeout(() => {
    if (status === 'Treated') {
      Animated.timing(ticketTreatedAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (status === 'Absent') {
      Animated.timing(ticketAbsentAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, 7000);
}

  // Reset status animations
  const resetStatusAnimations = () => {
    ticketTreatedAnimation.setValue(0);
    ticketAbsentAnimation.setValue(0);
    ticketRecalledAnimation.setValue(0);
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

  // Calculate cooldown progress for circular animation
  const cooldownProgress = cooldownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  // Calculate rotation for cooldown animation
  const cooldownRotation = cooldownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffc" />
      
      {/* Top Bar showing Window number/Agent name */}
      <View style={styles.topBar}>
        <Feather name="monitor" size={16} color="#006C4C" style={{ marginRight: 8 }} />
        <Text style={styles.topBarText}>Window {counterName}</Text>
        <View style={styles.agentContainer}>
          <View style={styles.agentDot} />
          <TouchableOpacity
            onPress={() => {navigation.navigate('Profile')}}
          >
            <Text style={styles.agentName}>{fullName}</Text>
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
          onPress={() => refreshTotals()}
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

          <Animated.View 
              style={[
                styles.statusIndicator, 
                styles.recalledIndicator,
                { 
                  opacity: ticketRecalledAnimation,
                  transform: [{ scale: Animated.add(0.8, Animated.multiply(ticketRecalledAnimation, 0.2)) }]
                }
              ]}
              >
              <Text style={styles.statusIndicatorText}>Recalled</Text>
              <Feather name="repeat" size={14} color="#3E7BFA" style={{ marginLeft: 5 }} />
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
          colors={isLoading || buttonCooldown ? ['#86b3a5', '#7aa095'] : ['#00875f', '#006C4C']}
          style={styles.nextButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextTicket}
            activeOpacity={0.9}
            disabled={isLoading || buttonCooldown}
          >
            {isLoading ? (
              <>
                <Animated.View style={{ transform: [{ rotate: loadingRotateInterpolation }], marginRight: 8 }}>
                  <Feather name="loader" size={20} color="white" />
                </Animated.View>
                <Text style={styles.nextButtonText}>Loading...</Text>
              </>
            ) : buttonCooldown ? (
              <>
                <View style={styles.cooldownTimerContainer}>
                  <Text style={styles.cooldownTimerText}>{cooldownSeconds}</Text>
                  <View style={styles.cooldownCircle}>
                    <Animated.View 
                      style={[
                        styles.cooldownProgress,
                        {
                          width: '100%',
                          height: '100%',
                          borderRadius: 15,
                          borderWidth: 2,
                          borderColor: 'white',
                          borderLeftColor: cooldownProgress.interpolate({
                            inputRange: [0, 25, 50, 75, 100],
                            outputRange: ['transparent', 'white', 'white', 'white', 'white']
                          }),
                          borderBottomColor: cooldownProgress.interpolate({
                            inputRange: [0, 25, 50, 75, 100],
                            outputRange: ['transparent', 'transparent', 'white', 'white', 'white']
                          }),
                          borderRightColor: cooldownProgress.interpolate({
                            inputRange: [0, 25, 50, 75, 100],
                            outputRange: ['transparent', 'transparent', 'transparent', 'white', 'white']
                          }),
                          borderTopColor: cooldownProgress.interpolate({
                            inputRange: [0, 25, 50, 75, 100],
                            outputRange: ['white', 'white', 'white', 'white', 'white']
                          }),
                          transform: [{ rotate: cooldownRotation }]
                        }
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.nextButtonText}>Next Ticket</Text>
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>Next Ticket</Text>
                <Feather name="arrow-right-circle" size={20} color="white" style={{ marginLeft: 8 }} />
              </>
            )}
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
      
      {/* Footer Stats */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(248, 255, 252, 0)', '#f8fffc']}
          style={styles.footerGradient}
        />
        <View style={styles.footerContent}>
          <View style={styles.statContainer}>
            <Text style={styles.statLabel}>Today's Tickets</Text>
            <Text style={styles.statValue}>{totalServed}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statContainer}>
            <Text style={styles.statLabel}>Avg. Wait Time</Text>
            <Text style={styles.statValue}>{waitingTime}</Text>
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 5,
  },
  absentIndicator: {
    backgroundColor: 'rgba(232, 108, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232, 108, 0, 0.2)',
  },
  treatedIndicator: {
    backgroundColor: 'rgba(0, 108, 76, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 108, 76, 0.2)',
  },
  recalledIndicator: {
    backgroundColor: 'rgba(62, 123, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(62, 123, 250, 0.2)',
  },
  statusIndicatorText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    letterSpacing: 0.3,
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
  // Cooldown styles
  cooldownTimerContainer: {
    position: 'relative',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cooldownTimerText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    position: 'absolute',
  },
  cooldownCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute',
    overflow: 'hidden',
  },
  cooldownProgress: {
    position: 'absolute',
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