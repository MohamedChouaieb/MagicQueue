import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useNetwork } from '../../contexts/NetworkContext';

const { width, height } = Dimensions.get('window');

// Network Disconnection SVG Illustration
const NetworkDisconnectedSvg = () => {
  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      <Defs>
        <SvgGradient id="disconnectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4CD787" />
          <Stop offset="100%" stopColor="#006C4C" />
        </SvgGradient>
      </Defs>
      
      {/* Outer Circle */}
      <Circle cx="100" cy="100" r="90" fill="rgba(0, 108, 76, 0.05)" />
      <Circle cx="100" cy="100" r="70" fill="rgba(0, 108, 76, 0.08)" />

      {/* Server Tower */}
      <Path
        d="M80,60 L120,60 L120,140 L80,140 Z"
        fill="white"
        stroke="url(#disconnectGradient)"
        strokeWidth="2"
      />
      
      {/* Server Rack Lines */}
      <Path d="M80,80 L120,80" stroke="url(#disconnectGradient)" strokeWidth="2" />
      <Path d="M80,100 L120,100" stroke="url(#disconnectGradient)" strokeWidth="2" />
      <Path d="M80,120 L120,120" stroke="url(#disconnectGradient)" strokeWidth="2" />
      
      {/* Connection Lines */}
      <Path
        d="M50,75 C40,85 40,95 50,105"
        stroke="rgba(0, 108, 76, 0.3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray="5,5"
      />
      <Path
        d="M40,65 C25,80 25,100 40,115"
        stroke="rgba(0, 108, 76, 0.2)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray="5,5"
      />
      
      {/* Connection Break Symbol - Repositioned over the circle */}
      <Circle cx="100" cy="100" r="15" fill="rgba(232, 108, 0, 0.1)" />
      <Path
        d="M92,92 L108,108 M108,92 L92,108"
        stroke="#E86C00"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Connection Lines (right side) */}
      <Path
        d="M130,90 L145,90"
        stroke="rgba(0, 108, 76, 0.3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray="5,5"
      />
      <Path
        d="M130,110 L145,110"
        stroke="rgba(0, 108, 76, 0.3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray="5,5"
      />
    </Svg>
  );
};

export default function ConnectionErrorScreen() {
  const navigation = useNavigation();
  const { checkConnection, isConnected } = useNetwork();
  const [isCheckingAutomatically, setIsCheckingAutomatically] = useState(false);
  const [autoCheckEnabled] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const checkingIndicatorOpacity = useRef(new Animated.Value(0)).current;
  
  // Function to handle successful reconnection
  const handleReconnection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Add a small delay before navigation to ensure context is updated
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  }, [navigation]);

  // Watch for connection changes from context
  useEffect(() => {
    if (isConnected === true) {
      console.log('Connection restored through context update');
      handleReconnection();
    }
  }, [isConnected, handleReconnection]);
  
  // Animation for the screen elements when it loads
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
    ]).start();

    // Start auto-checking for connectivity
    startAutoCheckInterval();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      // Prevent back navigation if there is no internet connection
      if (!isConnected) {
        return true; // Block the back button
      }
      return false; // Allow the back button
    };

    // Add the back button listener
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup the listener on unmount
    return () => backHandler.remove();
  }, [isConnected]);

  // Function to start the auto-check interval
  const startAutoCheckInterval = () => {
    console.log("Starting auto-check interval");
    
    if (intervalRef.current) {
      console.log("Clearing existing interval");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Create a new interval that checks connectivity every 3 seconds
    intervalRef.current = setInterval(async () => {
      // Only check if auto-retry is enabled
      if (!autoCheckEnabled) {
        // No need to check when disabled - do nothing
        return;
      }
      
      const currentTime = Date.now();
      
      // Prevent too frequent checks (at least 2.5 seconds apart)
      if (currentTime - lastCheckTime < 2500) {
        return;
      }
      
      console.log('Auto-checking connection... Time since last check:', (currentTime - lastCheckTime) / 1000, 'seconds');
      setIsCheckingAutomatically(true);
      fadeInCheckingIndicator();
      setLastCheckTime(currentTime);
      
      try {
        const isConnected = await checkConnection();
        console.log('Connection check result:', isConnected);
        
        if (isConnected) {
          console.log('Connection restored!');
          handleReconnection();
        } else {
          fadeOutCheckingIndicator();
          setIsCheckingAutomatically(false);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        fadeOutCheckingIndicator();
        setIsCheckingAutomatically(false);
      }
    }, 3000);
  };

  // Fade animations for checking indicator
  const fadeInCheckingIndicator = () => {
    Animated.timing(checkingIndicatorOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const fadeOutCheckingIndicator = () => {
    Animated.timing(checkingIndicatorOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
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

  // Retry connection handler
  const handleRetry = async () => {
    // Animation for button press
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
      }),
    ]).start();
    
    // Set checking flag and update last check time
    setIsCheckingAutomatically(true);
    fadeInCheckingIndicator();
    setLastCheckTime(Date.now());
    
    console.log('Manual connection check...');
    // Check connection status
    const isConnected = await checkConnection();
    console.log('Manual check result:', isConnected);
    
    // If connection restored, go back
    if (isConnected) {
      console.log('Connection restored on manual check!');
      handleReconnection();
    } else {
      fadeOutCheckingIndicator();
      setIsCheckingAutomatically(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffc" translucent={true} />
      
      {/* SafeAreaView with proper alignment */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header with title */}
        <View style={styles.header}>
          <Text style={styles.title}>Connection Lost</Text>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Animated SVG Container */}
          <Animated.View 
            style={[
              styles.illustrationContainer, 
              { 
                opacity, 
                transform: [{ translateY }] 
              }
            ]}
          >
            <NetworkDisconnectedSvg />
            <View style={styles.connectionIndicator}>
              <Feather name="wifi-off" size={24} color="#E86C00" />
            </View>
          </Animated.View>
          
          {/* Error Message */}
          <Animated.View 
            style={[
              styles.messageContainer,
              { 
                opacity, 
                transform: [{ translateY }] 
              }
            ]}
          >
            <Text style={styles.messageTitle}>Connection Error</Text>
            <Text style={styles.messageText}>
              Unable to connect to the MagicQueue server. Please check your internet connection and try again.
            </Text>
          </Animated.View>
          
          {/* Auto-checking indicator */}
          <Animated.View style={[styles.autoCheckingContainer, { opacity: checkingIndicatorOpacity }]}>
            <ActivityIndicator size="small" color="#006C4C" style={{ marginRight: 8 }} />
            <Text style={styles.autoCheckingText}>Checking connection...</Text>
          </Animated.View>
          
          {/* Retry Button */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              { transform: [{ scale: buttonScale }] },
              generateShadowStyle(4)
            ]}
          >
            <LinearGradient
              colors={['#00875f', '#006C4C']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={handleRetry}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>Retry Connection</Text>
                <Feather name="refresh-cw" size={20} color="white" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
          
          {/* Help Button */}
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={['rgba(248, 255, 252, 0)', '#f8fffc']}
            style={styles.footerGradient}
          />
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>MagicQueue • v1.0.0</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffc',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 108, 76, 0.06)',
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#006C4C',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    top: -10,
    position: 'relative',
  },
  connectionIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(232, 108, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: -65,
    marginBottom: 20,
  },
  messageContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 40,
  },
  messageTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#006C4C',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: width * 0.85,
    height: 58,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  helpButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  helpButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#00875f',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  footerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  footerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  autoCheckingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  autoCheckingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#006C4C',
  },
});