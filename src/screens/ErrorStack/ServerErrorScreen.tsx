import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Server Error SVG Illustration
const ServerErrorSvg = () => {
  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      <Defs>
        <SvgGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D03050" />
          <Stop offset="100%" stopColor="#B02040" />
        </SvgGradient>
        <SvgGradient id="serverStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4CD787" />
          <Stop offset="100%" stopColor="#006C4C" />
        </SvgGradient>
      </Defs>
      
      {/* Outer Circle */}
      <Circle cx="100" cy="100" r="90" fill="rgba(208, 48, 80, 0.05)" />
      <Circle cx="100" cy="100" r="70" fill="rgba(208, 48, 80, 0.08)" />

      {/* Server Rack */}
      <Rect x="60" y="50" width="80" height="100" rx="4" fill="white" stroke="url(#serverStroke)" strokeWidth="2" />
      
      {/* Server Units */}
      <Rect x="65" y="60" width="70" height="20" rx="2" fill="#f8f8f8" stroke="url(#serverStroke)" strokeWidth="1" />
      <Rect x="70" y="67" width="5" height="5" rx="2.5" fill="#4CD787" />
      <Rect x="80" y="67" width="40" height="5" rx="2.5" fill="#f0f0f0" />
      
      <Rect x="65" y="85" width="70" height="20" rx="2" fill="#f8f8f8" stroke="url(#serverStroke)" strokeWidth="1" />
      <Rect x="70" y="92" width="5" height="5" rx="2.5" fill="url(#serverGradient)" />
      <Rect x="80" y="92" width="40" height="5" rx="2.5" fill="#f0f0f0" />
      
      <Rect x="65" y="110" width="70" height="20" rx="2" fill="#f8f8f8" stroke="url(#serverStroke)" strokeWidth="1" />
      <Rect x="70" y="117" width="5" height="5" rx="2.5" fill="#D03050" />
      <Rect x="80" y="117" width="40" height="5" rx="2.5" fill="#f0f0f0" />
      
      {/* Error Symbol */}
      <Circle cx="140" cy="70" r="20" fill="rgba(208, 48, 80, 0.15)" />
      <Path
        d="M140,62 L140,72 M140,77 L140,78"
        stroke="#D03050"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Warning Lines */}
      <Path
        d="M30,120 L50,120 M30,130 L50,130 M30,140 L50,140"
        stroke="#D03050"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2,4"
      />
      
      {/* Connection Lines */}
      <Path
        d="M150,120 L170,120 M150,130 L170,130 M150,140 L170,140"
        stroke="#D03050"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2,4"
      />
    </Svg>
  );
};

export default function ServerErrorScreen() {
  const navigation = useNavigation();
  
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;
  const errorPulse = useRef(new Animated.Value(1)).current;

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

    // Start pulsing animation for the error indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(errorPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(errorPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        })
      ])
    ).start();
  }, []);

  // Shadow generator helper
  const generateShadowStyle = (elevation: number) => {
    return {
      elevation,
      shadowColor: '#D03050',
      shadowOffset: { width: 0, height: elevation * 0.5 },
      shadowOpacity: 0.15,
      shadowRadius: elevation * 0.8,
    };
  };

  // Retry connection handler
  const handleRetry = () => {
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
    
    // You would put actual reconnection logic here
    // For now, just simulate a retry
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fffc" translucent={true} />
      
      {/* SafeAreaView with proper alignment */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header with title */}
        <View style={styles.header}>
          <Text style={styles.title}>Server Error</Text>
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
            <ServerErrorSvg />
            <Animated.View style={{ 
              position: 'absolute',
              transform: [{ scale: errorPulse }] 
            }}>
              <View style={styles.errorIndicator}>
                <Feather name="alert-triangle" size={24} color="#D03050" />
              </View>
            </Animated.View>
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
            <Text style={styles.messageTitle}>Internal Server Error</Text>
            <Text style={styles.messageText}>
              We're experiencing issues with our server. Our technical team has been notified and is working on it.
            </Text>
            <Text style={styles.errorCode}>Error Code: 500</Text>
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
              colors={['#D03050', '#B02040']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={handleRetry}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>Try Again</Text>
                <Feather name="refresh-cw" size={20} color="white" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
          
          {/* Help Button */}
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
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
    borderBottomColor: 'rgba(208, 48, 80, 0.06)',
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#D03050',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  errorIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(208, 48, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    top: -25,
    right: -25,
  },
  messageContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 40,
  },
  messageTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#D03050',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorCode: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#999',
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
    color: '#D03050',
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
});