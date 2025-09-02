import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  Easing,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import COLORS from '../Theme&API/Theme';
import {Formik} from 'formik';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  requestMultiple,
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import API from '../Theme&API/Config';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';

import * as ImagePicker from 'react-native-image-picker';
const {width} = Dimensions.get('screen');
import {useNavigation} from '@react-navigation/native';
// import GetLocation from 'react-native-get-location';
// import moment from 'moment';
import LoadingIndicator from '../LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

//TODO: * ...............* validation ............*offline dropdown .............* change toasts ......* add current locTION IN MAP

const DetailsScreen = ({route}) => {
  const navigation = useNavigation();
  const id = route.params.id;
  const from_rd = route.params.from_rd;
  const to_rd = route.params.to_rd;

  console.log(' official taskId in progress adding  :', id);
  console.log('task from RD  in progress adding from home screen:', from_rd);
  console.log('task to RD progress adding from home screen:', to_rd);

  const zero = 0;
  //UserID from login screen
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageArray, setImageArray] = useState([]);
  const [response, setResponse] = useState([]);
  // Add a state to store the selected image URI
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSource, setImageSource] = useState(null);

  // Separate states for 'before' and 'after' images
  const [imageBeforeUri, setImageBeforeUri] = useState(null);
  const [imageAfterUri, setImageAfterUri] = useState(null);

  const [image, setImage] = useState('');

  //image Location states
  const [imageAfterLocation, setImageAfterLocation] = useState(null);
  const [imageBeforeLocation, setImageBeforeLocation] = useState(null);

  //Geolocation states :
  const [latLng, setLatLng] = useState(null);
  const [location, setLocation] = useState('');
  const [gottenLat, setGottenLat] = useState('');
  const [gottenLng, setGottenLng] = useState('');
  const [region, setRegion] = useState({
    latitude: 33.5871234,
    longitude: 73.075007,
    latitudeDelta: 0.0013,
    longitudeDelta: 0.0034,
  });

  //RDs states:
  const [fromRDPart1, setfromRDPart1] = useState(0);
  const [fromRDPart2, setfromRDPart2] = useState(0);
  const [toRDPart1, settoRDPart1] = useState(0);
  const [toRDPart2, settoRDPart2] = useState(0);
  //length states:
  const [finalLength, setFinalLength] = useState(0);
  const [displayLength, setDisplayLength] = useState('0 C.Miles   /    0 Feet');

  const [siltQuantity, setSiltQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  // State to control the open/close state of the dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // dropdown and dropdown id states:
  const [task, setTask] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  // const [taskId, setTaskId] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [modalMessage, setModalMessage] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // State variables to store routed task details
  const [taskId, setTaskId] = useState(null);
  const [fromRDTask, setFromRDTask] = useState(0);
  const [toRDTask, setToRDTask] = useState(0);

  useEffect(() => {
    // Set states with received parameters from route
    setTaskId(id);
    setFromRDTask(from_rd);
    setToRDTask(to_rd);
  }, [id, from_rd, to_rd]);

  const handleOpen = useCallback(
    dropdown => {
      setOpenDropdown(prev => (prev === dropdown ? null : dropdown));
    },
    [setOpenDropdown],
  );

  const RequestLocationPermission = async () => {
    const permissionStatus = await check(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    );

    const showModal = message => {
      setModalMessage(message);
      setModalVisible(true);
    };

    switch (permissionStatus) {
      case RESULTS.GRANTED:
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            console.log('Lattttt:', latitude);
            console.log('Longgg:', longitude);
            setGottenLat(latitude);
            setGottenLng(longitude);
            const latLng = latitude.toString() + ', ' + longitude.toString();
            console.log('User Location:', latLng);
            setLatLng(latLng);
            setLocation(latLng); // Update the location state here
          },
          error => {
            ToastAndroid.showWithGravity(
              ' ❌ Failed to get your location. Please make sure your location services are enabled in phone settings.',
              ToastAndroid.LONG,
              ToastAndroid.CENTER,
            );
            showModal(
              'Failed to get your location. Please make sure your location services are enabled in phone settings.',
              //  [{ text: 'OK', onPress: () => RequestLocationPermission() }]
              [{text: 'Open Settings', onPress: () => openSettings()}],
            );
          },
        );
        break;
      case RESULTS.DENIED:
        const requestResult = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          // PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        );
        if (requestResult === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              const latLng = `${latitude}, ${longitude}`;
              console.log('Lat:', latitude);
              console.log('Long:', longitude);
              setGottenLat(latitude);
              setGottenLng(longitude);
              console.log('location setttttt: ', gottenLat, gottenLng);
              console.log('User Location:', latLng);
              setLatLng(latLng);
              setLocation(latLng); // Update the location state here
            },
            error => {
              ToastAndroid.showWithGravity(
                ' ❌ Failed to get your location. Please make sure your location services are enabled in phone settings.',
                ToastAndroid.LONG,
                ToastAndroid.CENTER,
              );
              showModal(
                'Failed to get your location. Please make sure your location services are enabled in phone settings.',
                // [{ text: 'OK', onPress: () => RequestLocationPermission() }]
                [{text: 'Open Settings', onPress: () => openSettings()}],
              );
            },
          );
        } else {
          console.log('Permission denied.');
          ToastAndroid.showWithGravity(
            ' ❌ Location permission denied. Some features may not work properly without it. Please grant permission',
            ToastAndroid.LONG,
            ToastAndroid.CENTER,
          );
          showModal(
            'Location permission denied. Some features may not work properly without it. Please grant permission',
            //    [{ text: 'OK', onPress: () => RequestLocationPermission() }]
            [{text: 'Open Settings', onPress: () => openSettings()}],
          );
        }
        break;
      default:
        console.log('Permission is denied and not requestable anymore.');
        ToastAndroid.showWithGravity(
          ' ❌ Permission is denied. Please make sure your location services are enabled in phone settings.',
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
        showModal(
          'Permission is denied. Please make sure your location services are enabled in phone settings.',
          //   [{ text: 'OK', onPress: () => RequestLocationPermission() }]
          [{text: 'Open Settings', onPress: () => openSettings()}],
        );
        await new Promise(resolve => setTimeout(resolve, 100));
        break;
    }
  }; //request location ends
  useEffect(() => {
    RequestLocationPermission();
  }, []);

  // Monitor location updates
  useEffect(() => {
    console.log('Location updated on initial screen : ', gottenLat, gottenLng);
    if (gottenLat && gottenLng) {
      setRegion({
        latitude: gottenLat,
        longitude: gottenLng,

        latitudeDelta: 0.0013,
        longitudeDelta: 0.0034,
      });
    }
  }, [gottenLat, gottenLng]);
  // this will calculate the length:
  useEffect(() => {
    // Check if all variables are not empty
    if (
      !isNaN(fromRDPart1) &&
      !isNaN(fromRDPart2) &&
      !isNaN(toRDPart1) &&
      !isNaN(toRDPart2)
    ) {
      const length = Math.abs(
        //    fromRDPart1 + fromRDPart2 - (toRDPart1 + toRDPart2),
        parseFloat(toRDPart1) +
          parseFloat(toRDPart2) -
          (parseFloat(fromRDPart1) + parseFloat(fromRDPart2)),
      );
      //  console.log("inttttttttttt", typeof(toRDPart1))
      console.log('Length:', length);
      // console.log(`(${toRDPart1}* 1000) + ${toRDPart2} - ((${fromRDPart1} * 1000) + ${fromRDPart2}})`)
      const lengthInMiles = length / 5280;
      const updatedDisplayLength = `${lengthInMiles.toFixed(
        2,
      )} C.Miles    /    ${length} Feet`;
      setFinalLength(lengthInMiles);
      setDisplayLength(updatedDisplayLength);
    } else {
      setDisplayLength('0 C.Miles   /   0 Feet');
    }
  }, [fromRDPart1, fromRDPart2, toRDPart1, toRDPart2]);

  const onImageButtonPress = async (type, imageType) => {
    // Request location permission and get the user's location
    await RequestLocationPermission();
    //const permissionStatus = await check(PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    const permissionStatus = await requestMultiple([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    ]);

    if (type === 'gallery') {
      chooseFromLibrary(imageType);
    } else if (type === 'capture') {
      captureImage(permissionStatus, imageType);
    }
  };

  const captureImage = async (permissionStatus, imageType) => {
    if (permissionStatus[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED) {
      ImagePicker.launchCamera(
        {mediaType: 'photo', quality: 0.7, cropping: true},
        response => {
          console.log('Camera response:', response);
          if (!response.didCancel && !response.error && response.assets) {
            const selectedImage = response.assets[0];
            if (imageType === 'before') {
              setImageBeforeUri(selectedImage.uri);
              setImageBeforeLocation(latLng);
            } else if (imageType === 'after') {
              setImageAfterUri(selectedImage.uri);
              setImageAfterLocation(latLng);
            }
            // Extract LatLong from image metadata
            //  extractLatLong(selectedImage.uri);
          }
        },
      );
    }
  };

  const chooseFromLibrary = imageType => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', quality: 0.7},
      response => {
        console.log('Camera response:', response); // Log response to check what is returned

        if (!response.didCancel && !response.error && response.assets) {
          const selectedImage = response.assets[0];
          if (imageType === 'before') {
            setImageBeforeUri(selectedImage.uri);
            setImageBeforeLocation(latLng);
          } else if (imageType === 'after') {
            setImageAfterUri(selectedImage.uri);
            setImageAfterLocation(latLng);
          }
          // Extract LatLong from image metadata
          // extractLatLong(selectedImage.uri);
        }
      },
    );
  };

  // console.log('Image URI:', imageUri);

  const handleChangeFromRDPart1 = text => {
    setfromRDPart1(parseInt(text, 10) * 1000);
  };
  // const handleChangeFromRDPart2 = text => {
  //   setfromRDPart2(parseInt(text, 10));
  // };
  const handleChangeFromRDPart2 = text => {
    // Allow only numeric characters and update the state
    setfromRDPart2(text.replace(/[^0-9]/g, ''));
  };

  const handleBlurFromRDPart2 = () => {
    // Apply padding when the user finishes editing
    if (fromRDPart2) {
      setfromRDPart2(parseInt(fromRDPart2, 10).toString().padStart(3, '0'));
    }
  };
  const handleChangeToRDPart1 = text => {
    settoRDPart1(parseInt(text, 10) * 1000);
  };

  // const handleChangeToRDPart2 = text => {
  //   settoRDPart2(parseInt(text, 10));
  // };
  const handleChangeToRDPart2 = text => {
    // Allow only numeric characters and update the state
    settoRDPart2(text.replace(/[^0-9]/g, ''));
  };

  const handleBlurToRDPart2 = () => {
    // Apply padding when the user finishes editing
    if (toRDPart2) {
      settoRDPart2(parseInt(toRDPart2, 10).toString().padStart(3, '0'));
    }
  };
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (id !== null) {
          setUserId(JSON.parse(id));
          console.log('userID in detailssssssssss', userId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    getUserId();
  }, []);
  //Get access tokens to pass to the form
  const getTokens = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const bearerToken = await AsyncStorage.getItem('accessToken');
      console.log('Refresh Token:', refreshToken);
      console.log('Bearer Token:', bearerToken);
      return {refreshToken, bearerToken};
    } catch (error) {
      console.error('Error retrieving tokens from storage:', error);
      return {refreshToken: null, bearerToken: null};
    }
  };
  useEffect(() => {
    getTokens();
  }, []);

  const validateRequiredFields = values => {
    if (isNaN(fromRDPart1) || isNaN(fromRDPart2)) {
      ToastAndroid.showWithGravity(
        'From RD is a required field.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }

    if (isNaN(toRDPart1) || isNaN(toRDPart2)) {
      ToastAndroid.showWithGravity(
        'To RD is a required field.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }

    // if (!imageBeforeUri) {
    //   ToastAndroid.showWithGravity(
    //     'Image Before is a required field.',
    //     ToastAndroid.LONG,
    //     ToastAndroid.CENTER,
    //   );
    //   return false;
    // }

    // if (!imageAfterUri) {
    //   ToastAndroid.showWithGravity(
    //     'Image After is a required field.',
    //     ToastAndroid.LONG,
    //     ToastAndroid.CENTER,
    //   );
    //   return false;
    // }

    // If all fields are valid, return true
    return true;
  };

  const removeNegativity = (
    fromRDPart1,
    fromRDPart2,
    toRDPart1,
    toRDPart2,
    siltQuantity,
  ) => {
    const fields = {
      'From RD ': fromRDPart1,
      'From RD ': fromRDPart2,
      'To RD ': toRDPart1,
      'To RD ': toRDPart2,
      'Silt Quantity': siltQuantity,
    };

    for (const [fieldName, value] of Object.entries(fields)) {
      if (parseFloat(value) < 0) {
        ToastAndroid.showWithGravity(
          ` Oops! ${fieldName} cannot be negative.`,
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
        return false; // Stop further processing
      }
    }

    return true; // All values are valid
  };

  const validateRD = (fromRD, toRD) => {
    if (toRD < fromRD) {
      ToastAndroid.showWithGravity(
        'To RD should be greater than From RD.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    if (toRD === fromRD) {
      ToastAndroid.showWithGravity(
        'To RD and From RD Should not be the same.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    return true;
  };

  const saveOfflineData = async data => {
    try {
      const generateUniqueId = () =>
        `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

      const uniqueId = generateUniqueId();
      data.id = uniqueId; // Add unique ID to data

      // Get existing offline data
      const offlineData = await AsyncStorage.getItem('offlineForms');
      const parsedData = offlineData ? JSON.parse(offlineData) : [];

      // Add new data to existing array
      parsedData.push(data);

      // Save updated array back to AsyncStorage
      await AsyncStorage.setItem('offlineForms', JSON.stringify(parsedData));

      // Display modal to notify the user
      Alert.alert('No Internet Connection', 'Your data is stored offline.');
      navigation.navigate('MainTabNavigator');
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const submitForm = async values => {
    console.log('values', values);
    const fromRD = parseFloat(fromRDPart1) + parseFloat(fromRDPart2);
    const toRD = parseFloat(toRDPart1) + parseFloat(toRDPart2);
    console.log('from rd totallllllll ', fromRD);
    console.log('to RD total', toRD);
    // const requiredFields = {
    //   to_rd: toRD,
    //   task:id,
    //   recorded_by:userId,
    // };

    // Functions to validate RD values against task RD values
    const validateRDsAgainstTaskRDs = (fromRD, toRD) => {
      if (fromRD < fromRDTask) {
        // ToastAndroid.showWithGravity(
        //   `Invalid From RD:${fromRD} is less than task's From RD:${fromRDTask}!`,

        //   ToastAndroid.LONG,
        //   ToastAndroid.CENTER,
        // );
        Alert.alert(
          '❌   Try Again   ', // Title of the alert
          `Invalid From RD: ${fromRD} is less than task's From RD: ${fromRDTask} !`, // Message to display
          [{text: 'OK'}], // Button configuration
        );
        return false;
      }

      if (toRD > toRDTask) {
        // ToastAndroid.showWithGravity(

        //   `Invalid To RD:${toRD}is greater than task's To RD:${toRDTask}!`,
        //   ToastAndroid.LONG,
        //   ToastAndroid.CENTER,
        // );
        Alert.alert(
          '❌   Try Again     ', // Title of the alert
          `Invalid To RD: ${toRD} is greater than task's To RD: ${toRDTask} !`, // Message to display
          [{text: 'OK'}], // Button configuration
        );
        return false;
      }

      return true; // Valid if both conditions pass
    };

    const isValidRDRangeWrtTasksRDs = validateRDsAgainstTaskRDs(fromRD, toRD);
    if (!isValidRDRangeWrtTasksRDs) {
      return; // Stop form submission if RD validation fails
    }

    if (
      fromRD === null ||
      fromRD === undefined ||
      fromRD === '' ||
      isNaN(Number(fromRD))
    ) {
      ToastAndroid.showWithGravity(
        'Please enter a valid From RD.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    if (
      toRD === null ||
      toRD === undefined ||
      toRD === '' ||
      isNaN(Number(toRD))
    ) {
      ToastAndroid.showWithGravity(
        'Please enter a valid To RD.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    const isValidNegativity = removeNegativity(
      fromRDPart1,
      fromRDPart2,
      toRDPart1,
      toRDPart2,
      values.siltQuantity,
    );

    if (!isValidNegativity) {
      return; // Stop form submission if there's a negative value
    }

    if (!validateRequiredFields(values)) {
      return; // Stop the form submission if validation fails
    }
    const isValidRD = validateRD(parseFloat(fromRD), parseFloat(toRD));

    if (!isValidRD) {
      return; // Prevent form submission if validations fail
    }

    // if (!taskId) {
    //   ToastAndroid.showWithGravity(
    //     'Task ID not found',
    //     ToastAndroid.LONG,
    //     ToastAndroid.TOP,
    //   );
    //   return;
    // }
    // console.log('task Id from the card pressed', taskId);
    if (!userId) {
      ToastAndroid.showWithGravity(
        'User ID not found. Please log in again.',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
      return;
    }

    NetInfo.fetch().then(async state => {
      if (!state.isConnected) {
        // Offline: Save data to AsyncStorage
        const offlineData = {
          date: new Date().toISOString().split('T')[0],
          total_length: finalLength,
          recorded_by: userId,
          to_rd: toRD,
          from_rd: fromRD,
          task: id,
          silt_quantity: values.siltQuantity,
          before_latlng: imageBeforeLocation,
          after_latlng: imageAfterLocation,
          image_before: imageBeforeUri,
          image_after: imageAfterUri,
        };
        saveOfflineData(offlineData);
        return;
      }

      const formData = new FormData();

      formData.append('date', new Date().toISOString().split('T')[0]); // Current date
      // formData.append('location', latLng);
      formData.append('total_length', finalLength);
      console.log('total length', finalLength);
      formData.append('recorded_by', userId);
      console.log('recorded by ', finalLength);
      formData.append('to_rd', toRD);
      formData.append('from_rd', fromRD);
      formData.append('task', id); // Append taskId to form data
      formData.append('silt_quantity', values.siltQuantity || 0);
      formData.append('before_latlng', imageBeforeLocation);
      formData.append('after_latlng', imageAfterLocation);
      // Attach before image
      if (imageBeforeUri && typeof imageBeforeUri === 'string') {
        const filenameBefore = imageBeforeUri.substring(
          imageBeforeUri.lastIndexOf('/') + 1,
        );
        const matchBefore = /\.(\w+)$/.exec(filenameBefore);
        const typeBefore = matchBefore ? `image/${matchBefore[1]}` : 'image';

        formData.append('image_before', {
          uri: imageBeforeUri,
          name: filenameBefore,
          type: typeBefore,
        });
      }

      // Attach after image
      if (imageAfterUri && typeof imageAfterUri === 'string') {
        const filenameAfter = imageAfterUri.substring(
          imageAfterUri.lastIndexOf('/') + 1,
        );
        const matchAfter = /\.(\w+)$/.exec(filenameAfter);
        const typeAfter = matchAfter ? `image/${matchAfter[1]}` : 'image';

        formData.append('image_after', {
          uri: imageAfterUri,
          name: filenameAfter,
          type: typeAfter,
        });
      }

      try {
        const {refreshToken, bearerToken} = await getTokens();

        if (!bearerToken) {
          console.error('Missing bearer token, unable to submit form');
          return;
        }
        // Set loading and button text states
        setLoading(true);
        console.log('Form data desilting progress', formData);
        const response = await fetch(API.progress, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          console.log('api response progress add ', data);

          throw data;
          //  throw new Error(data.message || 'Failed to submit form');
        }

        ToastAndroid.showWithGravity(
          ' Progress Form submitted successfully ✅ ',
          ToastAndroid.LONG,
          ToastAndroid.TOP,
        );

        setTimeout(() => {
          navigation.navigate('MainTabNavigator');
        }, 1000);
      } catch (error) {
        console.error('Form submission error:', error);

        // Show the error message from API response if available
        // Extract the detailed error message
        let errorMessage = 'Failed to submit form. Please try again.';
        if (error?.non_field_errors) {
          errorMessage = error.non_field_errors.join(' '); // Join messages if it's an array
        } else if (error?.message) {
          errorMessage = error.message;
        }

        Alert.alert(
          '❌   Try Again ', // Title of the alert
          errorMessage || 'Failed to submit form. Please try again.', // Message to display
          [{text: 'OK'}], // Button configuration
        );

        // ToastAndroid.showWithGravity(
        //    'Failed to submit form. Please try again.',
        //   ToastAndroid.LONG,
        //   ToastAndroid.TOP,
        // );
      } finally {
        setLoading(false);
      }
    });
  };
  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* House image */}

          <View style={styles.backgroundImageContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.backgroundImage}
              zoomTapEnabled={true}
              zoomEnabled={true}
              zoomControlEnabled={true}
              mapPadding={{
                top: 500,
                right: 20,
                bottom: 500,
                left: 20,
              }}
              mapType="hybrid"            
              region={region}>
              {gottenLat && gottenLng && (
                <Marker
                  coordinate={{
                    latitude: gottenLat,
                    longitude: gottenLng,
                  }}
                  title="You are here"
                />
              )}

              {/* {markers.map((marker, index) =>
                  
                  {
                    const latitude = parseFloat(marker.latitude) || 0;
                    const longitude = parseFloat(marker.longitude) || 0;
                    if (isNaN(latitude) || isNaN(longitude)) return null; // skip this marker
                    return (
                      <Marker
                        key={index}
                        coordinate={{
                          latitude,
                          longitude,
                        }}
                        title={marker.title}>
                        <View>{icon()}</View>
                      </Marker>
                    );
                  },
                )} */}

              {/* <Polyline
                  coordinates={PointsArray}
                  strokeColor="yellow" // fallback for when `strokeColors` is not supported by the map-provider
                  strokeColors={[
                    '#7F0000',
                    '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                    '#B24112',
                    '#E5845C',
                    '#238C23',
                    '#7F0000',
                  ]}
                  strokeWidth={6}
                /> */}

              {/* <Polyline
                  coordinates={secPointArray}
                  strokeColor="green"
                  strokeWidth={6}
                /> */}
            </MapView>

            <View
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
              }}>
              {/* <View style={styles.headerBtn}>
                <TouchableOpacity
                  onPress={navigation.goBack}
                  style={{ marginHorizontal: 4 }}>
                  <Image
                    source={require('../screens/backkk.png')}
                    style={{ width: 20, height: 20, tintColor: 'black' }}
                  />
                  <Icon name="arrow-back" size={20} color={COLORS.black} />
                </TouchableOpacity>
              </View> */}
              {/* <View style={style.headerBtn}>
                <Icon name="favorite" size={20} color={COLORS.red} />
              </View> */}
            </View>
            {/* Virtual Tag View */}
            <View style={styles.virtualTag}>
              <Text style={{color: COLORS.white}}>Site Location</Text>
            </View>
          </View>
          {/* view1 start: */}
          <View style={styles.detailsContainer}>
            <Formik initialValues={{}} onSubmit={submitForm}>
              {({handleChange, handleBlur, handleSubmit, values}) => (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 10,
                    alignItems: 'center',
                    
                  }}>
                  {/* view3 start: */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      alignItems: 'center',
                    }}>
                    {/* From RD and To RD fields: */}
                    {/* view4 start: */}
                    <View style={{flexDirection: 'column', flex: 1}}>
                      {/* view5 start: */}
                      <View
                        style={{
                          flexDirection: 'column',
                          marginRight: 10,
                          flex: 1,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 15,
                            marginBottom: 5,
                            color: 'black',
                            paddingHorizontal: 3,
                            paddingTop: 7,
                          }}>
                          From RD
                        </Text>
                        {/* view6 start: */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <TextInput
                            style={{...styles.input, width: '50%'}}
                            placeholder="XXXXXX"
                            onChangeText={handleChangeFromRDPart1}
                            keyboardType="numeric"
                            maxLength={6}
                            value={fromRDPart1}
                            placeholderTextColor={'grey'}
                          />
                          <Text
                            style={{
                              paddingHorizontal: 5,
                              fontWeight: 'bold',
                              color: 'black',
                            }}>
                            +
                          </Text>
                          <TextInput
                            style={{...styles.input, width: '42%'}}
                            placeholder="XXX"
                            onChangeText={handleChangeFromRDPart2}
                            onBlur={handleBlurFromRDPart2}
                            keyboardType="numeric"
                            maxLength={3}
                            value={fromRDPart2}
                            placeholderTextColor={'grey'}
                          />
                          {/* view6 end */}
                        </View>
                        {/* view5 end: */}
                      </View>

                      <View style={{flexDirection: 'column', flex: 1}}>
                        {/* view7 start */}
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 15,
                            marginBottom: 5,
                            color: 'black',
                            paddingHorizontal: 3,
                            paddingTop: 7,
                          }}>
                          To RD
                        </Text>
                        <View style={{flexDirection: 'column', flex: 1}}>
                          <Text style={{color: 'red'}}>{errors.to_rd}</Text>
                        </View>
                        {/* view8 start: */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <TextInput
                            style={{...styles.input, width: '48%'}}
                            placeholder="XXXXXX"
                            onChangeText={handleChangeToRDPart1}
                            keyboardType="numeric"
                            maxLength={6}
                            placeholderTextColor={'grey'}
                          />
                          <Text
                            style={{
                              paddingHorizontal: 5,
                              fontWeight: 'bold',
                              color: 'black',
                            }}>
                            +
                          </Text>
                          <TextInput
                            style={{...styles.input, width: '42%'}}
                            placeholder="XXX"
                            onChangeText={handleChangeToRDPart2}
                            onBlur={handleBlurToRDPart2}
                            keyboardType="numeric"
                            maxLength={3}
                            value={toRDPart2}
                            placeholderTextColor={'grey'}
                          />
                          {/* view8 end: */}
                        </View>
                        {/* view7 end:*/}
                      </View>
                      {/* view4 end :*/}

                      {/* Length Covered field */}
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
                          Length Covered - from previous observation
                        </Text>

                        <TextInput
                          aria-label="Length Covered"
                          style={{...styles.input}}
                          placeholder="Length Covered"
                          onChangeText={handleChange('length')}
                          value={displayLength}
                          keyboardType="numeric"
                          editable={false}
                          placeholderTextColor={'grey'}
                        />
                        {/* length  ends: */}
                      </View>
                      {/* siltQuantity starts : */}
                      <>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 15,
                            marginBottom: 5,
                            color: 'black',
                            paddingHorizontal: 3,
                            paddingTop: 7,
                          }}>
                          Silt Quantity (Cft)
                        </Text>

                        <TextInput
                          style={{...styles.input}}
                          placeholder="Silt Quantity"
                          onChangeText={handleChange('siltQuantity')}
                          value={values.username}
                          keyboardType="numeric"
                          placeholderTextColor={'grey'}
                        />
                      </>
                      {/* silt quantity ends: */}

                      {/* Image Before view start: */}

                      <View style={{...styles.input}}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 15,
                            marginBottom: 5,
                            color: 'black',
                            paddingHorizontal: 3,
                            paddingTop: 7,
                          }}>
                          Image Before:
                        </Text>

                        {/* Display the selected or captured image */}
                        {imageBeforeUri && (
                          <Image
                            source={{uri: imageBeforeUri}}
                            style={{width: 100, height: 100}}
                          />
                        )}

                        <Pressable>
                          <View style={styles.footer}>
                            <Text
                              style={{
                                color: COLORS.blue,
                                fontWeight: 'bold',
                                fontSize: 18,
                                padding: 5,
                                marginLeft: 5,
                              }}>
                              Upload{'\n'}Image:
                            </Text>
                            <View></View>
                            <Pressable
                              onPress={() =>
                                onImageButtonPress('gallery', 'before')
                              }>
                              <View
                                style={{
                                  height: 50,
                                  justifyContent: 'center',
                                  display: 'flex',
                                  direction: 'row',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: COLORS.dark,
                                  borderRadius: 10,
                                  paddingHorizontal: 20,
                                  padding: 5,
                                  marginLeft: 5,
                                }}>
                                <Text style={{color: COLORS.white}}>
                                  Gallery
                                </Text>
                              </View>
                            </Pressable>
                            <Pressable
                              onPress={() =>
                                onImageButtonPress('capture', 'before')
                              }>
                              <View
                                style={{
                                  height: 50,
                                  justifyContent: 'center',
                                  display: 'flex',
                                  direction: 'row',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: COLORS.dark,
                                  borderRadius: 10,
                                  paddingHorizontal: 20,
                                  padding: 5,
                                  marginLeft: 10,
                                }}>
                                <Text style={{color: COLORS.white}}>
                                  Capture
                                </Text>
                              </View>
                            </Pressable>
                          </View>
                        </Pressable>
                        {/* Image Before view ends: */}
                      </View>

                      {/* Image After view start: */}

                      <View style={{...styles.input}}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 15,
                            marginBottom: 5,
                            color: 'black',
                            paddingHorizontal: 3,
                            paddingTop: 7,
                          }}>
                          Image After:
                        </Text>
                        {/* Display the selected or captured image */}
                        {imageAfterUri && (
                          <Image
                            source={{uri: imageAfterUri}}
                            style={{width: 100, height: 100}}
                          />
                        )}

                        {/* */}
                        <Pressable>
                          <View style={styles.footer}>
                            <Text
                              style={{
                                color: COLORS.blue,
                                fontWeight: 'bold',
                                fontSize: 18,
                                padding: 5,
                                marginLeft: 5,
                              }}>
                              Upload{'\n'}Image:
                            </Text>
                            <View></View>
                            <Pressable
                              onPress={() =>
                                onImageButtonPress('gallery', 'after')
                              }>
                              <View
                                style={{
                                  height: 50,
                                  justifyContent: 'center',
                                  display: 'flex',
                                  direction: 'row',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: COLORS.dark,
                                  borderRadius: 10,
                                  paddingHorizontal: 20,
                                  padding: 5,
                                  marginLeft: 5,
                                }}>
                                <Text style={{color: COLORS.white}}>
                                  Gallery
                                </Text>
                              </View>
                            </Pressable>
                            <Pressable
                              onPress={() =>
                                onImageButtonPress('capture', 'after')
                              }>
                              <View
                                style={{
                                  height: 50,
                                  justifyContent: 'center',
                                  display: 'flex',
                                  direction: 'row',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: COLORS.dark,
                                  borderRadius: 10,
                                  paddingHorizontal: 20,
                                  padding: 5,
                                  marginLeft: 10,
                                }}>
                                <Text style={{color: COLORS.white}}>
                                  Capture
                                </Text>
                              </View>
                            </Pressable>
                          </View>
                        </Pressable>
                        {/* Image After view ends: */}
                      </View>
                      {/* submit button: */}
                      <Pressable onPress={handleSubmit}>
                        <View
                          style={{
                            height: 70,
                            borderRadius: 10,
                            paddingHorizontal: 20,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            marginVertical: 10,
                            alignSelf: 'flex-end',
                            width: '100%',
                          }}>
                          <View
                            style={{
                              ...styles.bookNowBtn,
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            {loading ? (
                              <ActivityIndicator
                                size="small"
                                color={COLORS.white}
                              />
                            ) : (
                              <Text style={{color: COLORS.white}}>
                                Add Progress
                              </Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    </View>
                    {/* view3 end - this is main form container:*/}
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
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
    color: 'black',
  },
  mapcontainer: {
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: '5',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImageContainer: {
    elevation: 20,
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 15,
    alignItems: 'center',
    height: 350,
    zIndex: -1,
  },
  backgroundImage: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    overflow: 'hidden',
    borderRadius: '5',
  },
  header: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerBtn: {
    height: 45,
    width: 45,
    backgroundColor: 'white',
    padding: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'end',
    marginLeft: 5,
  },
  ratingTag: {
    height: 30,
    width: 30,
    backgroundColor: COLORS.blue,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  virtualTag: {
    top: -20,
    width: 140,
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 25,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interiorImage: {
    width: width / 3 - 20,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
  },
  footer: {
    height: 70,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginVertical: 30,
    // backgroundColor:'pink',
    //  padding: 16,
  },
  bookNowBtn: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    // Style for wrapping dropdowns
    marginBottom: 10,
    width: '98%',
  },
  detailsContainer: {flex: 1, paddingHorizontal: 20, marginTop: 40},
  facility: {flexDirection: 'row', marginRight: 15},
  facilityText: {marginLeft: 5, color: COLORS.grey},
});
