import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

// Enhanced MagicQueue Logo with gradient
const MagicQueueLogo = () => {
  return (
    <Svg height={80} width={80} viewBox="0 0 100 100">
      <Defs>
        <SvgGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4CD787" />
          <Stop offset="100%" stopColor="#2AA869" />
        </SvgGradient>
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

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { setUsername, setUserId, setCounterId, setDepartmentId, setFullName, setCounterName, setDepartmentName, setTotalServed, setWaitingTime } = useUser();

  // Animation value for error text opacity
  const errorOpacity = useState(new Animated.Value(0))[0];

  // Handle error animation when error state changes
  useEffect(() => {
    if (error) {
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [error]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
  
    try {
      const response = await fetch('http://141.95.161.231/magic-queue/public/api/test-login', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Login success:', data);
        await setUsername(name);
        await setUserId(data.user_id);
        await setCounterId(data.counter_id);
        await setDepartmentId(data.department_id);
  
        // 🕑 Wait then fetch extra data
        const indexResponse = await fetch('http://141.95.161.231/magic-queue/public/api/index', {
          headers: { 'Accept': 'application/json' },
        });
        const indexData = await indexResponse.json();
  
        console.log('Index data:', indexData);
  
        await setFullName(indexData.user.name);
        await setCounterName(indexData.user.counter.name);
        await setDepartmentName(indexData.user.department.name);
        await setTotalServed(indexData.totalServed);
        await setWaitingTime(indexData.tmpAttente);
  
        // Navigate or update UI here if needed
  
      } else {
        setError(data.error || 'Login failed');
      }
  
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate shadow helper
  const generateShadowStyle = (elevation: number) => {
    return {
      elevation,
      shadowColor: '#4CD787',
      shadowOffset: { width: 0, height: elevation * 0.5 },
      shadowOpacity: 0.2,
      shadowRadius: elevation * 0.8,
    };
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Elements */}
      <BackgroundShapes />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={22} color="#2E3A59" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentWrapper}>
              <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <MagicQueueLogo />
                </View>
                
                <Text style={styles.title}>MagicQueue</Text>
                <Text style={styles.subtitle}>Agent Portal</Text>
                
                {/* Form Container with fixed size */}
                <View style={[styles.formContainer, generateShadowStyle(8)]}>
                  <View style={styles.formHeader}>
                    <Text style={styles.formHeaderText}>Sign In</Text>
                    <Text style={styles.formSubHeaderText}>Welcome back, please login to continue</Text>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Feather name="user" size={20} color="#6D7C8C" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="none"
                      placeholderTextColor="#8F9BB3"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={20} color="#6D7C8C" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      placeholderTextColor="#8F9BB3"
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon} 
                      onPress={togglePasswordVisibility}
                    >
                      <Feather 
                        name={passwordVisible ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#6D7C8C" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Fixed height error container */}
                  <Animated.View style={[
                    styles.errorContainer,
                    { opacity: errorOpacity }
                  ]}>
                    {error !== '' && (
                      <>
                        <Feather name="alert-circle" size={16} color="#D03050" style={styles.errorIcon} />
                        <Text style={styles.errorText}>{error}</Text>
                      </>
                    )}
                  </Animated.View>
                  
                  <View style={styles.loginButtonContainer}>
                    <LinearGradient
                      colors={[(name === '' || password === '') ? '#a0d8c0' : '#4CD787', (name === '' || password === '') ? '#76b18f' : '#2AA869']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.gradientButton, generateShadowStyle(4)]}
                    >
                      <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={name === '' || password === '' || loading}
                      >
                        {loading ? (
                          <Text style={styles.loginButtonText}>Signing In...</Text>
                        ) : (
                          <>
                            <Text style={styles.loginButtonText}>Sign In</Text>
                            <Feather name="arrow-right" size={20} color="white" style={styles.loginButtonIcon} />
                          </>
                        )}
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </View>
              </View>
              
              <Text style={styles.versionText}>MagicQueue • v1.0.0</Text>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f4',
  },
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  backgroundShape: {
    position: 'absolute',
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  logoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E3A59',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5A6B8A',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  formHeader: {
    marginBottom: 20,
  },
  formHeaderText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 6,
  },
  formSubHeaderText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8F9BB3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 12,
    height: 54,
    marginBottom: 16,
    backgroundColor: '#F7F9FC',
  },
  inputIcon: {
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#2E3A59',
  },
  eyeIcon: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#D03050',
    fontSize: 14,
  },
  loginButtonContainer: {
    width: '100%',
    marginTop: 4,
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4CD787',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.2,
  },
  loginButton: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButtonIcon: {
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#8F9BB3',
    fontSize: 14,
    marginTop: 30,
    marginBottom: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;