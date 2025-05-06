import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;


const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { setUsername, setUserId, setCounterId, setDepartmentId, setFullName, setCounterName, setDepartmentName, setTotalServed, setWaitingTime } = useUser();


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
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#c5f5e8', '#e0faf3']}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#c5f5e8" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>Q</Text>
              </View>
            </View>
            
            <Text style={styles.title}>MagicQueue</Text>
            <Text style={styles.subtitle}>Agent Portal</Text>
            
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back, Agent!</Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons 
                    name={passwordVisible ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#a0a0a0" 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.loginButton, (name === '' || password === '') && styles.disabledButton]}
                onPress={handleLogin}
                disabled={name === '' || password === '' || loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>
            {error !== '' && (
              <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
            )}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: width * 0.9,
    maxWidth: 400,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3DC89B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1e2d3d',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    color: '#4d6478',
    marginBottom: 30,
  },
  welcomeContainer: {
    width: '100%',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    color: '#1e2d3d',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  loginButton: {
    backgroundColor: '#3DC89B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionContainer: {
    marginTop: 30,
  },
  versionText: {
    color: '#6d7c8c',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },  
});

export default LoginScreen;