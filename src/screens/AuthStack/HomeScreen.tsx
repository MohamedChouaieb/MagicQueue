import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Error: {
    screen: string;
  };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Enhanced MagicQueue Logo with gradient
const MagicQueueLogo = () => {
  return (
    <Svg height={100} width={100} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4CD787" />
          <Stop offset="100%" stopColor="#2AA869" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill="white" opacity={0.2} />
      <Circle cx="50" cy="50" r="40" fill="white" opacity={0.4} />
      <Path
        d="M50,10 C72,10 90,28 90,50 C90,72 72,90 50,90 C28,90 10,72 10,50 C10,28 28,10 50,10 Z M50,25 C36.2,25 25,36.2 25,50 C25,63.8 36.2,75 50,75 C63.8,75 75,63.8 75,50 C75,36.2 63.8,25 50,25 Z M40,40 L60,40 L60,60 L40,60 L40,40 Z"
        fill="url(#logoGradient)"
        fillRule="evenodd"
      />
      <Path
        d="M60,60 L40,60 L40,40 L60,40 L60,60 Z M50,75 C63.8,75 75,63.8 75,50 L60,50 L60,60 L50,60 L50,75 Z"
        fill="url(#logoGradient)"
        fillRule="evenodd"
      />
    </Svg>
  );
};

// Decorative background shapes
const BackgroundShapes = () => {
  return (
    <>
      <Svg height={200} width={200} style={[styles.backgroundShape, { top: 50, right: -50 }]}>
        <Circle cx="100" cy="100" r="100" fill="#4CD787" opacity={0.1} />
      </Svg>
      <Svg height={150} width={150} style={[styles.backgroundShape, { bottom: 120, left: -60 }]}>
        <Circle cx="75" cy="75" r="75" fill="#4CD787" opacity={0.1} />
      </Svg>
      <Svg height={120} width={120} style={[styles.backgroundShape, { top: 250, right: 20 }]}>
        <Circle cx="60" cy="60" r="60" fill="#4CD787" opacity={0.08} />
      </Svg>
    </>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Animation values
  const logoOpacity = new Animated.Value(0);
  const titleTranslateY = new Animated.Value(20);
  const buttonScale = new Animated.Value(0.95);
  const errorButtonsOpacity = new Animated.Value(0);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.parallel([
        Animated.timing(titleTranslateY, {
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
        Animated.timing(errorButtonsOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Button press animation
  const onPressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <BackgroundShapes />
        
        <View style={styles.content}>
          {/* Logo with Animation */}
          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
            <MagicQueueLogo />
          </Animated.View>
          
          {/* App Name with Animation */}
          <Animated.Text
            style={[
              styles.appName,
              { transform: [{ translateY: titleTranslateY }] }
            ]}
          >
            MagicQueue
          </Animated.Text>
          
          {/* Agent Portal Text with Animation */}
          <Animated.Text
            style={[
              styles.portalText,
              { transform: [{ translateY: titleTranslateY }] }
            ]}
          >
            Agent portal
          </Animated.Text>
          
          {/* Sign In Button with Animation */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              { transform: [{ scale: buttonScale }] }
            ]}
          >
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => {navigation.navigate('Login')}}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.9}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Version Number */}
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f4',
  },
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.95,
  },
  backgroundShape: {
    position: 'absolute',
    zIndex: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#4CD787',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  portalText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#5A6B8A',
    marginBottom: 80,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: width * 0.75,
    marginBottom: 30,
    shadowColor: '#4CD787',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButton: {
    backgroundColor: '#4CD787',
    borderRadius: 30,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.85,
    marginBottom: 40,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: width * 0.41,
  },
  connectionErrorButton: {
    backgroundColor: 'rgba(232, 108, 0, 0.07)',
    borderColor: 'rgba(232, 108, 0, 0.2)',
  },
  serverErrorButton: {
    backgroundColor: 'rgba(208, 48, 80, 0.07)',
    borderColor: 'rgba(208, 48, 80, 0.2)',
  },
  errorButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  versionText: {
    position: 'absolute',
    bottom: 40,
    color: '#8F9BB3',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;