import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../Theme&API/Theme';
import LoadingIndicator from '../LoadingIndicator';
import API from '../Theme&API/Config';
import { useNavigation } from '@react-navigation/native'
import hide from '../assets/hide.png';
import view from '../assets/view.png';
import axios from 'axios';
//this is login screen
const OnBoardScreen = () => {

  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    // Check if token exists in AsyncStorage
    const checkToken = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        try {
          // Verify token validity by making a request to the server
          const response = await fetch(API.verifyToken, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            setIsLoggedIn(true);
            // Token is valid, navigate to the home screen
            const data = await response.json();
            // console.log('Response:', data);
            if (data === 'True') {
              navigation.replace('MainTabNavigator');
            }
          } else {
            // Token is expired or invalid, clear the token from AsyncStorage
            await AsyncStorage.removeItem('accessToken');

          }
        } catch (error) {
          console.error('Error verifying token:', error);

        }
      }
      setLoading(false);
    };

    checkToken();
  }, [navigation]);



  const handleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Making API call...');
  
      const response = await fetch(API.loginUser, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: username,
          password: password,
        }),
      });
  
      console.log('API call made. Awaiting response...');
  
      if (!response.ok) {
        const responseData = await response.json();
        console.error('Server error:', responseData);
        const errorMessage =
          responseData.detail || 'Failed to login. Please try again.';
        ToastAndroid.showWithGravity(
          errorMessage,
          ToastAndroid.LONG,
          ToastAndroid.TOP,
        );
  
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Login successful:', data);
      ToastAndroid.showWithGravity(
        'Login successful. Welcome!',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
  
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('user_id', JSON.stringify(data.user_id));
  
      // Fetch additional user data
      await fetchUsers();
  
      setLoading(false);
      
      navigation.replace('MainTabNavigator');
    } catch (error) {
      console.error('Login error:', error.message);
      let errorMessage;
  
      if (error.message === 'Network request failed') {
        errorMessage = 'Network issue. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'Failed to login. Please try again.';
      }
  
      ToastAndroid.showWithGravity(
        errorMessage,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
  
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const user_id = await AsyncStorage.getItem('user_id');
      console.log(user_id, 'userid');
      console.log(accessToken, 'accessToken');
  
      if (!accessToken) {
        throw new Error('Access token not found');
      }
  
      const response = await axios.get(`${API.userlist}${user_id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Fetched user data:', response.data);
  
      const fetchedUser = response.data.user_name;
      const fetchedUser_name= response.data.full_name;
      const fetchedUserRole = response.data.role;
  
      console.log('Fetched user name:', fetchedUser);
      console.log('Fetched user role:', fetchedUserRole);
      console.log('Fetched user full name:', fetchedUser_name);

  
      await AsyncStorage.setItem('user_name', JSON.stringify(fetchedUser));
      await AsyncStorage.setItem('userRole', JSON.stringify(fetchedUserRole));
      await AsyncStorage.setItem('full_name', JSON.stringify(fetchedUser_name));

      console.log('User role saved:', fetchedUserRole);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar translucent backgroundColor={COLORS.transparency} />

        {/* Onboarding Image */}
        <Image source={require('../assets/5.jpg')} style={style.image} />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}>
          {/* Title and text container */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }} />
          <View>
            <Image
              source={require('../assets/logo.png')}
              style={style.logo}
            />
          </View>

          {/* Title container */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }} />
          <View>
            <Text style={style.title}>Desilting Monitoring - Punjab</Text>
            <Text style={style.subTitle}>
              Please Log In using your credentials
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 20 }} />
          {/* Form Container: */}

          <View
            style={{
              display: 'flex',
              // flexDirection: 'column',
              borderRadius: 10,
              padding: 10,
            }}>
            {/* UserName Container: */}
            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 15,
                  marginBottom: 5,
                  color: 'black',
                  paddingHorizontal: 3,
                  paddingTop: 7,
                }}>
                User Name
              </Text>

              <TextInput
                style={style.input}
                placeholder=" Enter User Name"
                placeholderTextColor="grey"
                value={username}
                onChangeText={text => setUsername(text)}
              />
            </View>
            {/* Password container: */}
            <View>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 15,
                  marginBottom: 5,
                  color: 'black',
                  paddingHorizontal: 3,
                  paddingTop: 7,
                }}>
                Password
              </Text>
              <View style={style.passwordContainer}>
              <TextInput
                style={[style.input , style.passwordInput]}
                placeholder=" Enter Password"
                placeholderTextColor="grey"
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry={!showPassword}
              />
                <TouchableOpacity onPress={togglePasswordVisibility} style={style.eyeIcon}>
                <Image
                  source={showPassword ? hide : view}
                  style={style.iconImage}
                />
              </TouchableOpacity>
               </View>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingBottom: 40,
              }}>
              {/* login Button  */}

              <Pressable onPress={handleSignIn} >
                <View style={style.btn}>
                  {/* )} */}
                  {loading ? (
                    <LoadingIndicator color="white" /> // Use the LoadingIndicator component
                  ) : (
                    <Text style={{ color: 'white', fontWeight: 400 }}>
                      LOG IN
                    </Text>
                  )}
                </View>
              </Pressable>

              {/* form container ends:*/}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OnBoardScreen;

const style = StyleSheet.create({
  logo: {
    height: 100,
    width: 100,
    marginVertical: 5,

    zIndex: 9,
    alignSelf: 'center',
  },
  image: {
    height: 280,
    width: '100%',
    borderBottomLeftRadius: 100,
  },
  indicatorContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  indicator: {
    height: 3,
    width: 30,
    backgroundColor: COLORS.grey,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  indicatorActive: {
    backgroundColor: COLORS.dark,
  },
  btn: {
    height: 60,
    marginTop: 30,
    backgroundColor: 'black',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  subTitle: { fontSize: 18, color: 'black', marginTop: 10, padding: 10 },
  textStyle: { fontSize: 16, color: COLORS.grey },
  container: {
    flex: 1,
  },
  SubContainer: {
    height: 200,
  },
  map: {
    width: '90%',
    height: 200,
    borderRadius: 20,
    margin: 15,
  },
  header: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderColor: 'black',
    borderWidth: 2,
    fontSize: 16,
    color: 'black',
    fontWeight: '400',
    lineHeight: 18.5,
    letterSpacing: 0.15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 3,
    marginBottom: 12,
    marginTop: 10,
  },
  textArea: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18.5,
    letterSpacing: 0.15,
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    height: 80,
  },
  submitButton: {
    backgroundColor: '#FF2F2D',
    width: 362,
    height: 47,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5.75,
    alignSelf: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40, // Make space for the eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -12 }], // Adjust this value to center the icon vertically
  },
  iconImage: {
    width: 24,
    height: 24,
  },
});
