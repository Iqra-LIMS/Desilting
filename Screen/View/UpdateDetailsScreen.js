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
  Easing,
  Pressable,
  useColorScheme,
  TouchableOpacity,
  ToastAndroid,Alert,
  ActivityIndicator,
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

import * as ImagePicker from 'react-native-image-picker';
const {width} = Dimensions.get('screen');
import {CommonActions, useNavigation} from '@react-navigation/native';

// import moment from 'moment';
import LoadingIndicator from '../LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

//TODO: * ...............* validation ............*offline dropdown .............* change toasts ......* add current locTION IN MAP

const UpdateDetailsScreen = ({route}) => {
  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const progressId = route.params?.progressId;
  console.log('progresssssssssssssssId', progressId);

  const id = route.params.taskId;
  const from_rd = route.params.taskFromRD;
  const to_rd = route.params.taskToRD;

  console.log(
    'official task Id in updating progress from progress screen :',
    id,
  );
  console.log(
    'task from RD  in updating progress from progress screen:',
    from_rd,
  );
  console.log('task to RD updating progress  from progress screen:', to_rd);
  console.log('yayyyy 😊');

  const zero = 0;
  //UserID from login screen
  const [userId, setUserId] = useState(null);

  // Add a state to store the selected image URI
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSource, setImageSource] = useState(null);

  // Separate states for 'before' and 'after' images
  const [imageBeforeUri, setImageBeforeUri] = useState(null);
  const [hasImageChangedBeforeUri, setHasImageChangedBeforeUri] =
    useState(false);
  const [imageAfterUri, setImageAfterUri] = useState(null);
  const [hasImageChangedAfterUri, setHasImageChangedAfterUri] = useState(false);

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

  const [siltQuantity, setSiltQuantity] = useState('');
  const [TASKID, setTASKID] = useState(0);
  console.log('official task id ', TASKID);
  const [loading, setLoading] = useState(false);
  // State to control the open/close state of the dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);

  const [modalMessage, setModalMessage] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  // states for update
  const [progressData, setProgressData] = useState(null); // To store existing progress data
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

  useEffect(() => {
    // This effect will run whenever any of the RD values change
    console.log('From RD:', fromRDPart1, fromRDPart2);
    console.log('To RD:', toRDPart1, toRDPart2);
  }, [fromRDPart1, fromRDPart2, toRDPart1, toRDPart2]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const {bearerToken} = await getTokens();
        if (!bearerToken) {
          console.error('Missing bearer token, unable to fetch progress data');
          return;
        }
        // `${API.progress}/${progressId}`
        const response = await fetch(
          `https://pid.limspakistan.org/api/canals/desilting-progress/${progressId}`,
          // "https://pid.limspakistan.org/api/canals/desilting-progress/5",
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const data = await response.json();
        console.log('Fetched progress data:', data); // Debugging: log data
        if (response.ok) {
          setProgressData(data); // Set the fetched data in state
          console.log('Fetched progress data:', data); // Debugging: log data

          // Pre-fill form inputs using this data (setState for each form field)
          // setExistingTaskData(data.task); // Populate form with fetched data
          setSiltQuantity(String(data.silt_quantity || 0));
          console.log('Silt Quantity:', data.silt_quantity); // Log the silt_quantity before setting state
          // setSiltQuantity(data.silt_quantity); // Update siltQuantity state
          // Check if `from_rd` and `to_rd` are available and valid numbers
          if (
            data.from_rd !== undefined &&
            data.to_rd !== undefined &&
            !isNaN(data.from_rd) &&
            !isNaN(data.to_rd)
          ) {
            // Split `from_rd` and `to_rd` into parts
            console.log('toRD fetched from API in progress:', data.to_rd);
            console.log('fromRD fetched from API in progress:', data.from_rd);
            const fromRDPart1 = Math.floor(data.from_rd / 1000);
            const fromRDPart2 = Math.floor(data.from_rd % 1000);
            const toRDPart1 = Math.floor(data.to_rd / 1000);
            const toRDPart2 = Math.floor(data.to_rd % 1000);
            // Log each part for debugging
            console.log('fromRDPart1:', fromRDPart1);
            console.log('fromRDPart2:', fromRDPart2);
            console.log('toRDPart1:', toRDPart1);
            console.log('toRDPart2:', toRDPart2);

            // Set the parts to state
            setfromRDPart1(fromRDPart1);
            setfromRDPart2(fromRDPart2);
            settoRDPart1(toRDPart1);
            settoRDPart2(toRDPart2);
          } else {
            console.error(
              'Invalid `from_rd` or `to_rd` data received from API',
            );
          }

          setImageBeforeUri(data.image_before);
          setImageAfterUri(data.image_after);
          setLocation(data.before_latlng); // Example for location
          const taskId = data.task.id;
          setTASKID(taskId);
          console.log(taskId, 'tassssssk');
        } else {
          console.error('Failed to fetch progress data');
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
    };

    fetchProgressData();
  }, [progressId]);

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
            const latLng = latitude.toString() + ', ' + longitude.toString();
            console.log('User Location:', latLng);
            setLatLng(latLng);
            setLocation(latLng); // Update the location state here
            setGottenLat(latitude);
            setGottenLng(longitude);
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
              console.log('User Location:', latLng);
              setLatLng(latLng);
              setLocation(latLng); // Update the location state here
              setGottenLat(latitude);
              setGottenLng(longitude);
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
            '❌ Location permission denied. Some features may not work properly without it. Please grant permission',
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
        console.log('Permission is denied and not request able anymore.');
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
  useEffect(() => {
    if (gottenLat && gottenLng) {
      console.log('Location updated: ', gottenLat, gottenLng);
    }
  }, [gottenLat, gottenLng]); // Runs when these states change
  // Monitor location updates
  useEffect(() => {
    console.log('Location updated on initial screen : ', gottenLat, gottenLng);
    if (gottenLat && gottenLng) {
      
      setRegion({
        latitude: gottenLat,
        longitude: gottenLng,
        latitudeDelta: 0.0013, 
        longitudeDelta: 0.0034
        
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
        parseFloat(toRDPart1 * 1000) +
          parseFloat(toRDPart2) -
          (parseFloat(fromRDPart1 * 1000) + parseFloat(fromRDPart2)),
        //fromRDPart1 + fromRDPart2 - (toRDPart1 + toRDPart2),
      );
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
    await RequestLocationPermission();

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
              setHasImageChangedBeforeUri(true);
              setImageBeforeLocation(latLng);
            } else if (imageType === 'after') {
              setImageAfterUri(selectedImage.uri);
              setHasImageChangedAfterUri(true);
              setImageAfterLocation(latLng);
            }
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
            setHasImageChangedBeforeUri(true);
            setImageBeforeLocation(latLng);
          } else if (imageType === 'after') {
            setImageAfterUri(selectedImage.uri);
            setImageAfterLocation(latLng);
            setHasImageChangedAfterUri(true);
          }
        }
      },
    );
  };

  const handleChangeFromRDPart1 = text => {
    const value = text ? parseInt(text, 10) : '';
    setfromRDPart1(value.toString());
  };

  // const handleChangeFromRDPart2 = text => {
  //   setfromRDPart2(text);
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
    const value = text ? parseInt(text, 10) : '';
    settoRDPart1(value.toString());
  };

  // const handleChangeToRDPart2 = text => {
  //   settoRDPart2(text);
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

  // const handleChangeFromRDPart1 = (text) => {
  //   setfromRDPart1(parseInt(text, 10) * 1000);
  // };
  // const handleChangeFromRDPart2 = (text) => {
  //   setfromRDPart2(parseInt(text, 10));
  // };
  // const handleChangeToRDPart1 = (text) => {
  //   settoRDPart1(parseInt(text, 10) * 1000);
  // };

  // const handleChangeToRDPart2 = (text) => {
  //   settoRDPart2(parseInt(text, 10));
  // };
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
      if ((value) < 0) {
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

    // If all fields are valid, return true
    return true;
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
  const submitForm = async values => {
    // const fromRD = parseFloat(fromRDPart1 + fromRDPart2);
    // const toRD = parseFloat(toRDPart1 + toRDPart2);
    const fromRD = parseFloat(
      parseFloat(fromRDPart1 * 1000) + parseFloat(fromRDPart2),
    );
    const toRD = parseFloat(
      parseFloat(toRDPart1 * 1000) + parseFloat(toRDPart2),
    );
    console.log('from rd totallllllllllllllllllllllllllllllllllllll ', fromRD);
    console.log('to RD total', toRD);

    // const requiredFields = {
    //   to_rd: toRD,

    // };

    // Check for missing fields and show toast messages
    // for (const [key, value] of Object.entries(requiredFields)) {
    //   if (!value) {
    //     let fieldName;
    //     switch (key) {
    //       case "task":
    //         fieldName = "Task ID";
    //         break;
    //       case "recorded_by":
    //         fieldName = "User ID";
    //         break;
    //       case "to_rd":
    //         fieldName = "To RD";
    //         break;
    //       default:
    //         fieldName = key;
    //     }
    //     ToastAndroid.show(`${fieldName} is required`, ToastAndroid.SHORT);
    //     return; // Stop form submission if any field is missing
    //   }
    // }
    // Check if any required field is missing
    // const missingFields = Object.keys(requiredFields).filter(
    //   (key) => requiredFields[key] === undefined || requiredFields[key] === null
    // );

    // if (missingFields.length > 0) {
    //   // Set errors for the missing fields
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     ...missingFields.reduce((acc, field) => {
    //       acc[field] = 'This field is required';
    //       return acc;
    //     }, {}),
    //   }));
    //   return; // Prevent form submission
    // }

    // // Continue with form submission if validation passes
    // setErrors({}); // Clear errors
    // ... rest of submitForm code

    const isValidNegativity = removeNegativity(
      fromRDPart1,
      fromRDPart2,
      toRDPart1,
      toRDPart2,
      siltQuantity,
    );

    if (!isValidNegativity) {
      return; // Stop form submission if there's a negative value
    }
    if (!validateRequiredFields(values)) {
      return;
    }
    const isValidRD = validateRD(parseFloat(fromRD), parseFloat(toRD));

    if (!isValidRD) {
      return;
    }
    // Functions to validate RD values against task RD values
    const validateRDsAgainstTaskRDs = (fromRD, toRD) => {
      if (fromRD < fromRDTask) {
        // ToastAndroid.showWithGravity(
        //   `Invalid From RD:${fromRD} is less than task's From RD:${fromRDTask}!`,

        //   ToastAndroid.LONG,
        //   ToastAndroid.CENTER,
        // );
        Alert.alert(
          '❌   Try Again   ',              // Title of the alert
          `Invalid From RD: ${fromRD} is less than task's From RD: ${fromRDTask} !`,  // Message to display
          [{ text: 'OK' }]      // Button configuration
        );
        return false;
      }

      if (toRD > toRDTask) {
        Alert.alert(
          '❌   Try Again     ',              // Title of the alert
          `Invalid To RD: ${toRD} is greater than task's To RD: ${toRDTask} !`,  // Message to display
          [{ text: 'OK' }]      // Button configuration
        );
        return false;
      }

      return true; // Valid if both conditions pass
    };

    const isValidRDRangeWrtTasksRDs = validateRDsAgainstTaskRDs(fromRD, toRD);
    if (!isValidRDRangeWrtTasksRDs) {
      return; // Stop form submission if RD validation fails
    }
    if (!userId) {
      ToastAndroid.showWithGravity(
        'User ID not found. Please log in again.',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
      return;
    }
    console.log('Form values api at line 53333333333 :', values);
    try {
      console.log('inside try');

      const {refreshToken, bearerToken} = await getTokens();

      if (!bearerToken) {
        console.error('Missing bearer token, unable to submit form');
        return;
      }
      // Set loading and button text states
      setLoading(true);

      const formData = new FormData();
      // Append silt quantity with a check for a valid number
      // const validatedSiltQuantity =
      //   siltQuantity !== '' ? parseFloat(siltQuantity) : null;
      formData.append('silt_quantity', siltQuantity || 0);
      console.log('silt quantity updated', siltQuantity);

      formData.append('date', new Date().toISOString().split('T')[0]); // Current date
      formData.append('total_length', finalLength);
      formData.append('recorded_by', userId);
      formData.append('to_rd', parseFloat(toRD));
      formData.append('from_rd', parseFloat(fromRD));
      formData.append('task', TASKID); // Append taskId to form data

      // formData.append('before_latlng', imageBeforeLocation);
      // formData.append('after_latlng', imageAfterLocation);

      // send images :
      // Handle image fields

      console.log(
        'imgesssssssssssssssssssssssssssssssssssss',
        typeof imageBeforeUri,
      );

      // // Append "image_before" if it exists and has a valid format

      // if there is no image dont send it ... if there is an image then send it as a string  -

      if (hasImageChangedBeforeUri && imageBeforeUri) {
        const filenameBefore = imageBeforeUri.substring(
          imageBeforeUri.lastIndexOf('/') + 1,
        );
        const matchBefore = /\.(\w+)$/.exec(filenameBefore);
        const typeBefore = matchBefore
          ? `image/${matchBefore[1].toLowerCase()}`
          : 'image/jpeg'; // Default to jpeg

        formData.append('image_before', {
          uri: imageBeforeUri,
          name: filenameBefore,
          type: typeBefore,
        });
      }

      // Append "image_after" if it exists
      if (hasImageChangedAfterUri && imageAfterUri) {
        const filenameAfter = imageAfterUri.substring(
          imageAfterUri.lastIndexOf('/') + 1,
        );
        const matchAfter = /\.(\w+)$/.exec(filenameAfter);
        const typeAfter = matchAfter
          ? `image/${matchAfter[1].toLowerCase()}`
          : 'image/jpeg'; // Default to jpeg

        formData.append('image_after', {
          uri: imageAfterUri,
          name: filenameAfter,
          type: typeAfter,
        });
      }

      // console.log("Image Before Typeeeeeeeeeeeeeeeeeeeeeeeeee:", type);
      console.log('Form data updated desilting progress', formData);
      console.log('Silt Quantityyyyyyyyyyyyyy:', siltQuantity);
      const response = await fetch(
        `https://pid.limspakistan.org/api/canals/desilting-progress/${progressId}/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      const data = await response.json();
      console.log('API response updating Desilting progress:', data);
      if (!response.ok) {
        console.log("api response progress update " , data)
        ToastAndroid.showWithGravity(
          data.message || 'Failed to update form',
          ToastAndroid.LONG,
          ToastAndroid.TOP,
        );
        throw data;
      }

      ToastAndroid.showWithGravity(
        'Form Updated successfully ✅ ',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );

      // Navigate to HomeScreen after 3 seconds
      setTimeout(() => {
        navigation.navigate('MainTabNavigator');
      }, 3000);
  

      setLoading(false);
    } catch (error) {
      console.error('Form Updating error:', error);
      
      // Show the error message from API response if available
       // Extract the detailed error message
  let errorMessage = 'Failed to submit form. Please try again.';
  if (error?.non_field_errors) {
    errorMessage = error.non_field_errors.join(' '); // Join messages if it's an array
  } else if (error?.message) {
    errorMessage = error.message;
  }

 Alert.alert(
  '❌   Try Again ',              // Title of the alert
  errorMessage || 'Failed to submit form. Please try again.' ,         // Message to display
  [{ text: 'OK' }]      // Button configuration
);
    } finally {
      // Reset loading and button text states
      setLoading(false);
    }
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
              region={region}           
              >
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
              }}></View>
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
                    //backgroundColor: 'pink',
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
                            value={
                              fromRDPart1 !== null ? fromRDPart1.toString() : ''
                            } // Display original value if null
                            // value={fromRDPart1 ? fromRDPart1 : ""} // Convert to string for text input
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
                            onBlur={handleBlurFromRDPart2} // Apply padding when the user exits the input
                            keyboardType="numeric"
                            maxLength={3}
                            value={
                              fromRDPart2 !== null ? fromRDPart2.toString() : ''
                            } // Display original value if null
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
                            value={
                              toRDPart1 !== null ? toRDPart1.toString() : ''
                            } // Display original value if null
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
                            placeholderTextColor={'grey'}
                            value={
                              toRDPart2 !== null ? toRDPart2.toString() : ''
                            } // Display original value if null
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
                        {/* length field ends: */}
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
                          // onChangeText={handleChange("siltQuantity")}
                          value={siltQuantity}
                        
                          onChangeText={text =>
                            setSiltQuantity(parseFloat(text) || 0)
                          } // Update siltQuantity state directly
                          // value={siltQuantity ? siltQuantity.toString() : '' } // Convert to string for text input
                          // value={values.username}
                          keyboardType="numeric"
                          placeholderTextColor={'grey'}
                          onBlur={() => {
                            // Set to '0' if the field is left empty
                            if (siltQuantity === '') {
                              setSiltQuantity('0');
                            }
                          }}
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
                                Update Progress
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

export default UpdateDetailsScreen;

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
    borderRadius: 10,
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
