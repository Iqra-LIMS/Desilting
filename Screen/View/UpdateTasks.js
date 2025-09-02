import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  TouchableOpacity, ActivityIndicator,
  ToastAndroid,Alert,
} from 'react-native';
import COLORS from '../Theme&API/Theme';
import API from '../Theme&API/Config';
import { Formik } from 'formik';

import DropDownPicker from 'react-native-dropdown-picker';
import DatePicker from 'react-native-date-picker';

const { width } = Dimensions.get('screen');
import { useNavigation } from '@react-navigation/native';
// import GetLocation from 'react-native-get-location';
// import moment from 'moment';
import LoadingIndicator from '../LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

//TODO: 1. add date picker cute sa .... ...........3. submit form .......4. validation ...............5. offline dropdown ............. 7. change toasts .... * DROPDOWN

const WORK_CHOICES = [
  { label: 'Desilting', value: 'Desilting' },
  { label: 'Strengthening', value: 'Strengthening' },
];
const COMPLETED_CHOICES = [
  { label: 'Completed', value: 'Completed' },
  { label: 'Partially Completed', value: 'Partially Completed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Skipped', value: 'Skipped' },
];
const UpdateTasks = ({ route }) => {
  const [TASKID, setTASKID] = useState(0);
  const id = route.params.id;

  console.log(id, 'taskId');

  const navigation = useNavigation();
  const zero = 0;
  //UserID from login screen
  const [userId, setUserId] = useState(null);

  const [response, setResponse] = useState([]);
  const [errors, setErrors] = useState({});
  // const [fromRDPart1, setfromRDPart1] = useState('');
  // const [fromRDPart2, setfromRDPart2] = useState('');
  // const [toRDPart1, settoRDPart1] = useState('');
  // const [toRDPart2, settoRDPart2] = useState('');
  const [fromRDPart1, setfromRDPart1] = useState(0);
  const [fromRDPart2, setfromRDPart2] = useState(0);
  const [toRDPart1, settoRDPart1] = useState(0);
  const [toRDPart2, settoRDPart2] = useState(0);

  const [loading, setLoading] = useState(false);
  //dates states:
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
//tailRD:
const [tailRD, setTailRD] = useState(0);
  // State to control the open/close state of the dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // dropdown and dropdown id states:
  //canals:
  const [canal, setCanal] = useState([]);
  const [selectedCanalId, setSelectedCanalId] = useState(null);
  const [canalId, setCanalId] = useState(null);
  const [loadingCanal, setLoadingCanal] = useState(true);
  //assignment:


  const [work, setWork] = useState(null);
  const [complete, setComplete] = useState(null);

  //Phase:
  const [phase, setPhase] = useState([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [phaseId, setPhaseId] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(true);

  const [expectedSilt, setExpectedSilt] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  //length states:
  const [finalLength, setFinalLength] = useState(0);
  const [displayLength, setDisplayLength] = useState('0 C.Miles   /    0 Feet');
  // states for update
  const [tasksData, setTaskData] = useState(null); // To store existing progress data

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const { bearerToken } = await getTokens();
        if (!bearerToken) {
          console.error('Missing bearer token, unable to fetch task data');
          return;
        }
        // `${API.progress}/${progressId}`
        const response = await fetch(
          `https://pid.limspakistan.org/api/canals/tasks/${id}`,
          //  "https://pid.limspakistan.org/api/canals/tasks/3240/",
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const data = await response.json();
        console.log('Fetched tasks data:', data);
        // Debugging: log data
        if (response.ok) {

          setTaskData(data);
          console.log('Fetched Tasks data:', data); // Debugging: log data
          console.log("phase before setting ittttttttttttttt ", data.phase)
          setSelectedPhaseId(data.phase);
          console.log("phase afterrrrrrrrrrrrrrrrrrrrrrr setting ttt ", data.phase)
          // Pre-fill form inputs using this data (setState for each form field)
          // Set start and end dates if available
          if (data.planned_start_date && data.planned_end_date) {
            const startDate = new Date(data.planned_start_date);
            const endDate = new Date(data.planned_end_date);
            setStartDate(startDate);
            setEndDate(endDate);

            // Log start and end dates for debugging
            console.log('Planned Start Date:', startDate);
            console.log('Planned End Date:', endDate);
          }
          // Check if `from_rd` and `to_rd` are available and valid numbers (including 0)
          if (
            data.from_rd !== undefined && data.to_rd !== undefined && !isNaN(data.from_rd) && !isNaN(data.to_rd)
     
          ) {
            // Split `from_rd` and `to_rd` into parts
            console.log('toRD fetched from API in progress:', data.to_rd);
            console.log('fromRD fetched from API in progress:', data.from_rd);
            const fromRDPart1 = Math.floor(data.from_rd /1000);
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
            console.error('Invalid `from_rd` or `to_rd` data received from API');
          }

          // setExistingTaskData(data.task); // Populate form with fetched data
          setExpectedSilt(data.expected_silt);
          console.log('Expected Silt :', data.expected_silt); // Log the silt_quantity before setting state
          // setSiltQuantity(data.silt_quantity); // Update siltQuantity state

          setEstimatedCost(data.estimated_cost);
          console.log('Estimated Costsssssss:', data.estimated_cost); 
          setWork(data.work);
          console.log('work:', data.work);
          setSelectedCanalId(data.canal);
          console.log('cANAL:', data.canal);
          // Set phase ID if available in the fetched data

          console.log('PHASE:', data.phase);
          
          setComplete(data.completed);
         
         
        } else {
          console.error('Failed to fetch Tasks data');
        }
      } catch (error) {
        console.error('Error fetching Tasks data:', error);
      }
    };

    fetchTasksData();
  }, []);

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
        //fromRDPart1 + fromRDPart2 - (toRDPart1 + toRDPart2),
        (parseFloat(toRDPart1* 1000) + parseFloat(toRDPart2)) -(parseFloat(fromRDPart1*1000) + parseFloat(fromRDPart2)),
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

  const handleOpen = useCallback(
    dropdown => {
      setOpenDropdown(prev => (prev === dropdown ? null : dropdown));
    },
    [setOpenDropdown],
  );

  const handleChangeFromRDPart1 = (text) => {
    const value = text ? parseInt(text, 10) : '';
    setfromRDPart1(value.toString());
  };

  // const handleChangeFromRDPart2 = (text) => {
  //   setfromRDPart2(text);
  // };
  const handleChangeFromRDPart2 = (text) => {
    // Allow only numeric characters and update the state
    setfromRDPart2(text.replace(/[^0-9]/g, ''));
  };
  
  const handleBlurFromRDPart2 = () => {
    // Apply padding when the user finishes editing
    if (fromRDPart2) {
      setfromRDPart2(parseInt(fromRDPart2, 10).toString().padStart(3, '0'));
    }
  };
  const handleChangeToRDPart1 = (text) => {
    const value = text ? parseInt(text, 10) : '';
    settoRDPart1(value.toString());
  };

  // const handleChangeToRDPart2 = (text) => {
  //   settoRDPart2(text);
  // };
  const handleChangeToRDPart2 = (text) => {
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
          console.log('userID in add tasks', userId);
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
      return { refreshToken, bearerToken };
    } catch (error) {
      console.error('Error retrieving tokens from storage:', error);
      return { refreshToken: null, bearerToken: null };
    }
  };
  useEffect(() => {
    getTokens();
  }, []);
  const removeNegativity = (fromRDPart1 ,fromRDPart2, toRDPart1, toRDPart2 , expectedSilt , estimatedCost ) => {

    const fields = {
      'From RD ': fromRDPart1,
      'From RD ': fromRDPart2,
      'To RD ': toRDPart1,
      'To RD ': toRDPart2,
      'Expected Silt': expectedSilt,
      'Estimated Cost': estimatedCost,
    };
  
    for (const [fieldName, value] of Object.entries(fields)) {
      if (parseFloat(value) < 0) {
        ToastAndroid.showWithGravity(
          ` Oops! ${fieldName} cannot be negative.`,
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
        return false; // Stop further processing
      }
    }
  
    return true; // All values are valid
  }

  // Fetch the Canals data from the API
  const fetchCanalData = async () => {
    try {
      const { refreshToken, bearerToken } = await getTokens();

      if (!refreshToken || !bearerToken) {
        console.error(
          'Missing tokens, unable to fetch canal data ..authentication failed',
        );
        return;
      }

      const response = await fetch(API.canals, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('token ', bearerToken);
      const data = await response.json();

      // console.log('response canals API', data);

      // Map the fetched data to the format required by DropDownPicker

      const formattedCanals = data.map(canal => ({
        label: canal.name,
        value: canal.id,
      }));
      // Update the state with the fetched Canals  data
      setCanal(formattedCanals);
      // saveZoneDataToStorage(data); // Save data to AsyncStorage
    } catch (error) {
      console.error('Error fetching Canals:', error);
    } finally {
      setLoadingCanal(false);
    }
  };
  // for when user try's to update task without changing the canal
  // useEffect(() => {
  //   console.log("this is getting called" , selectedCanalId)
  //   if (selectedCanalId && selectedCanalId === canalId) {
  //     fetchTailRD(selectedCanalId);
  //   }
  // }, [selectedCanalId, canalId]);
  useEffect(() => {
    const fetchAndUpdateTailRD = async () => {
      if (selectedCanalId) {
        try {
          const fetchedTailRD = await fetchTailRD(selectedCanalId);
          if (fetchedTailRD !== null && fetchedTailRD !== undefined) {
            setTailRD(fetchedTailRD);
          }
        } catch (error) {
          console.error('Error fetching tail RD:', error);
        }
      }
    };

    fetchAndUpdateTailRD();
  }, [selectedCanalId]);
  
  // this is for getting the tail rd once canal is selected 
const handleCanalSelection = async (selectedCanalId) => {
  try {
    if (!selectedCanalId) {
      console.error('No canal ID selected.');
      return;
    }

    console.log('Selected Canal ID in handleCanalSelection:', selectedCanalId); // Debug log

    // Fetch tail RD for the selected canal
    await fetchTailRD(selectedCanalId);

  } catch (error) {
    console.error('Error handling canal selection:', error);
  }
};
// this is tail rd fetched from canals api based on selected canal id .. this will be used to validate the RDs
const fetchTailRD = async (selectedCanalId) => {
  console.log("canal selected " , selectedCanalId )
  if (!selectedCanalId || typeof selectedCanalId !== 'number') {
    console.error('Invalid Canal ID:', selectedCanalId); // Debug log
    return;
  }

  try {
    const { bearerToken } = await getTokens();

    if (!bearerToken) {
      console.error('Missing bearer token, unable to fetch tail RD data');
      return;
    }

    const endpoint = `${API.canals}${selectedCanalId}`;
    console.log('Fetching from URL:', endpoint); 

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch data: ${response.status} - ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('Tail RD for selected canal:', data.tail_rd); 
    setTailRD(data.tail_rd);
  } catch (error) {
    console.error('Error fetching tail RD:', error);
  }
};

  useEffect(() => {
    fetchCanalData();
  }, [zero]);
  const ValidatingToRDWithTailRD = (toRD) => {
    if (toRD > tailRD) {
      // ToastAndroid.showWithGravity(
      //   `Invalid To RD: ${toRD} exceeds Tail RD: ${tailRD}`,
      //   ToastAndroid.LONG,
      //   ToastAndroid.CENTER,
      // );
      Alert.alert(
        '❌   Try Again   ', // Title of the alert
        ` Invalid To RD: ${toRD} exceeds  Canal's Tail RD: ${tailRD} !`, // Message to display
        [{text: 'OK'}], // Button configuration
      );
      return false; 
    }
   
    return true; 
  };
  
  // Fetch the Phase data from the API
  const fetchPhaseData = async () => {
    try {
      const { refreshToken, bearerToken } = await getTokens();

      if (!refreshToken || !bearerToken) {
        console.error(
          'Missing tokens, unable to fetch phase data ..authentication failed',
        );
        return;
      }

      const response = await fetch(API.phases, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('token ', bearerToken);
      const data = await response.json();

      console.log('response phase API', data);
      // Check if the fetched data is empty
      // let formattedPhases = [];
      // if (data.length === 0) {
      //   // If no phases are available, set a default entry
      //   formattedPhases = [{ label: 'No phase available', value: null }];
      //   setSelectedPhaseId(null); // Automatically select 'No phase available'

      // } else {
      //   // Map the fetched data to the format required by DropDownPicker
      //   formattedPhases = data.map(phase => ({
      //     label: phase.name,
      //     value: phase.id,
      //   }));
      // }
      // Map the fetched data to the format required by DropDownPicker

      const formattedPhases = data.map(phase => ({
        label: phase.name,
        value: phase.id,
      }));
      // Update the state with the fetched phase  data
      setPhase(formattedPhases);

    } catch (error) {
      console.error('Error fetching Phasess:', error);
    } finally {
      setLoadingPhase(false);
    }
  };
  useEffect(() => {
    fetchPhaseData();
  }, [zero]);

  //Call the fetchPhaseData when canalId changes
  // Dependency array includes canalId, triggers when canalId changes
  const validateDates = (startDate, endDate) => {
    // Check if start date exists
    if (!startDate) {
      ToastAndroid.showWithGravity(
        'Please select Start Date.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }

    // If end date is not provided, we don't need to validate further
    if (!endDate) {
      return true;
    }

    // Ensure start date comes before end date
    if (startDate.getTime() === endDate.getTime()) {
      ToastAndroid.showWithGravity(
        'Start Date and End Date cannot be the same.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    } else if (startDate > endDate) {
      ToastAndroid.showWithGravity(
        'Start Date should be before the End Date.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }

    // If all is good
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
    const fromRD = (parseFloat(fromRDPart1*1000) + parseFloat(fromRDPart2));
    const toRD = (parseFloat(toRDPart1*1000) + parseFloat(toRDPart2));
    // const fromRD = parseFloat(fromRDPart1 + fromRDPart2);
    // const toRD = parseFloat(toRDPart1 + toRDPart2);
    console.log('from rd totallllllllllllllllllllllllllllllllllllll ', fromRD)
    console.log('to RD total', toRD)
    console.log('phase before apppending it', selectedPhaseId)
    // const requiredFields = {
    //   to_rd: toRD,
    //   canal: selectedCanalId,
    //   from_rd: fromRD,
    //   work: work,
    //   to_rd: toRD,
    //   phase: selectedPhaseId,
    //   canal: selectedCanalId,

    //   expected_silt: values.expectedSilt,
    //   completed: complete,
    //   expected_silt: values.expectedSilt, 
    //   completed: complete,
    //   expected_silt: values.expectedSilt, // Silt Quantity
    //   estimated_cost: values.estimatedCost, // Estimated Cost

    // };
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

    // Continue with form submission if validation passes
    //setErrors({}); // Clear errors
    // ... rest of submitForm code

    const isValidDates = validateDates(startDate, endDate);
    if (!startDate || !endDate) {
      console.error("Start or end date is missing");

      return;
    }

    if (!selectedCanalId) {
      ToastAndroid.showWithGravity(
        'Please select a canal.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    if (!work) {
      console.error("work is missing");
      ToastAndroid.showWithGravity(
        'Nature of Work is a required field . please fill in it.',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );

      return;
    }
    if (fromRD === null || fromRD === undefined || fromRD === '' || isNaN(Number(fromRD))) {
      ToastAndroid.showWithGravity(
        'Please enter a valid From RD.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    if (toRD === null || toRD === undefined || toRD === '' || isNaN(Number(toRD))) {
      ToastAndroid.showWithGravity(
        'Please enter a valid To RD.',
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
      );
      return false;
    }
    if (!ValidatingToRDWithTailRD(toRD)) {
      return false; 
    }
    const isValidRD = validateRD(
      parseFloat(fromRD),
      parseFloat(toRD),
    );
    const isValidNegativity = removeNegativity(
      fromRDPart1,
      fromRDPart2,
      toRDPart1,
      toRDPart2,
      values.expectedSilt,
      values.estimatedCost
    );
  
    if (!isValidNegativity) {
      return; // Stop form submission if there's a negative value
    }
  
    if (!isValidDates || !isValidRD) {
      return; // Prevent form submission if validations fail
    }
    // Check for null dates and provide a fallback
    if (!startDate || !endDate) {
      console.error("Start or end date is missing");
      return;
    }
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    // if (!userId) {
    //   ToastAndroid.showWithGravity(
    //     'User ID not found. Please log in again.',
    //     ToastAndroid.LONG,
    //     ToastAndroid.TOP,
    //   );
    //   return;
    // }


    console.log('Form values api :', values);
    try {
      const { refreshToken, bearerToken } = await getTokens();

      if (!bearerToken) {
        console.error('Missing bearer token, unable to submit form');
        return;
      }
      // Set loading and button text states
      setLoading(true);
      const formData = new FormData();
      // Conditionally append fields only if they have values
      if (expectedSilt !== undefined) {
        formData.append("expected_silt", expectedSilt);
      }
      if (estimatedCost !== undefined) {
        formData.append("estimated_cost", estimatedCost);
      }
      if (selectedPhaseId !== null) {

        formData.append("phase", selectedPhaseId);
      }
      //  formData.append("assigned_to", selectedAssignmentId);

      formData.append("total_length", finalLength),
        // formData.append('location', latLng);
        // formData.append("expected_silt", values.expectedSilt),// Silt Quantity
        // formData.append("estimated_cost", values.estimatedCost), // Estimated Cost

        formData.append("to_rd", parseFloat(toRD)),
        formData.append("from_rd", parseFloat(fromRD)),
        formData.append("work", work),
        formData.append("canal", selectedCanalId),
        formData.append("phase", selectedPhaseId),

        formData.append("completed", complete),
        formData.append("planned_start_date", formattedStartDate),
        formData.append("planned_end_date", formattedEndDate),

        setLoading(true)


      console.log("Form data Add tasks form", formData);
      const response = await fetch(
        // `API.tasks/${id}/`,
        `https://pid.limspakistan.org/api/canals/tasks/${id}/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "multipart/form-data",
            //  'Content-Type': 'application/json', // Specify that we're sending JSON data
          },
          body: formData,
          //   body: JSON.stringify(formData), // Convert the entire object to JSON
          // body: JSON.stringify(formData),
        });
      // Validate only required fields before submission
      // const isValidFields = validateRequiredFields(formData);
      // if (!isValidFields) {
      //   return; // Prevent form submission if required fields are missing
      // }
      const data = await response.json();
      console.log('API response  add tasks formsssss:', data);
      if (!response.ok) {
// Show the error message from API response if available
        // Extract the detailed error message
        let errorMessage = 'Failed to submit form. Please try again.';
        if (data?.tasks.non_field_errors) {
          errorMessage = data.tasks.non_field_errors.join(' '); // Join messages if it's an array
        } else if (data?.message) {
          errorMessage = data.message;
        }

        Alert.alert(
          '❌   Try Again ', // Title of the alert
          errorMessage || 'Failed to Update Task. Please try again.', // Message to display
          [{text: 'OK'}], // Button configuration
        );
        // ToastAndroid.showWithGravity(
        //   data.message || 'Failed to submit form',
        //   ToastAndroid.LONG,
        //   ToastAndroid.TOP,
        // );
        throw data
      }
      setLoading(false)
      ToastAndroid.showWithGravity(
        'Form submitted successfully✅',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
   
      // Navigate to HomeScreen after 3 seconds
      setTimeout(() => {
        navigation.navigate('MainTabNavigator');
      }, 3000);
      

      setLoading(false);
    } catch (error) {
      console.error('Form updating error error:', error);
     // Show the error message from API response if available
        // Extract the detailed error message
        let errorMessage = 'Failed to submit form. Please try again.';
        if (error?.tasks.non_field_errors) {
          errorMessage = error.tasks.non_field_errors.join(' '); // Join messages if it's an array
        } else if (error?.message) {
          errorMessage = error.message;
        }

        Alert.alert(
          '❌   Try Again ', // Title of the alert
          errorMessage || 'Failed to Update Task. Please try again.', // Message to display
          [{text: 'OK'}], // Button configuration
        );
    } finally {
      // Reset loading and button text states
      setLoading(false);
    }
  };
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* House image */}

          <View
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
            }}>
            {/* <View style={styles.headerBtn}>
                <TouchableOpacity
                  onPress={navigation.goBack}
                  style={{marginHorizontal: 4}}>
                  <Image
                    source={require('../screens/backkk.png')}
                    style={{width: 20, height: 20, tintColor: 'black'}}
                  />
                </TouchableOpacity>
              </View> */}
            {/* <View style={style.headerBtn}>
                <Icon name="favorite" size={20} color={COLORS.red} />
              </View> */}
          </View>

          {/* view1 start: */}
          <View style={styles.detailsContainer}>
            <Formik initialValues={{}} onSubmit={submitForm}>
              {({ handleChange, handleBlur, handleSubmit, values }) => (
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
                    <View
                      style={{
                        flexDirection: 'column',
                        flex: 1,
                        paddingTop: 50,
                      }}>
                      {/* view5 start: */}

                      {/* DropDown canal view start: */}
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
                          Canal
                        </Text>
                        <View style={{ flexDirection: "column", flex: 1 }}>

                          <Text style={{ color: 'red' }}>{errors.canal}</Text>
                        </View>

                        <DropDownPicker
                          listMode="SCROLLVIEW"
                          items={loadingCanal ? [] : canal}
                          value={selectedCanalId}
                          open={openDropdown === 'canal'}
                          setOpen={() => handleOpen('canal')}
                          setValue={(callback) => {
                            const value = callback(selectedCanalId); // Extract the new value
                            console.log('Selected value in canal dropdown:', value); // Debug log
                            setSelectedCanalId(value); // Update state
                            handleCanalSelection(value); // Call function to handle selection
                          }}
                        //  setValue={setSelectedCanalId}
                          searchable={true}
                          searchPlaceholder="Search for Canal"
                          placeholder="Select Canal "
                          containerStyle={styles.dropdownContainer}
                          style={{
                            ...styles.input,

                            zIndex: 1000, // Ensure dropdown is displayed on top
                          }}
                          placeholderStyle={{ fontSize: 16, color: 'grey' }}
                          dropDownStyle={{ backgroundColor: '#fafafa' }}
                          ListEmptyComponent={
                            loadingCanal ? LoadingIndicator : null
                          }
                          onClose={() => setOpenDropdown(null)}
                        />
                        {/* Dropdown canal input field view end : */}
                      </View>

                      {/* DropDown phase view start: */}
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
                          Phase
                        </Text>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                          <Text style={{ color: 'red' }}>
                            {errors.phase}
                          </Text>
                        </View>
                        <DropDownPicker
                          listMode="SCROLLVIEW"
                          items={loadingPhase ? [] : phase}
                          value={selectedPhaseId}
                          onChangeValue={(value) => setSelectedPhaseId(value)}
                          open={openDropdown === 'phase'}
                          setOpen={() => handleOpen('phase')}
                          setValue={(callback) => setSelectedPhaseId(callback(selectedPhaseId))}
                          // setValue={setSelectedPhaseId}
                          placeholder={
                            // phase.length === 0 ? "No previous phase available for this canal" : 
                            "Select Phase"
                          }
                          // placeholder="Select Phase "
                          containerStyle={styles.dropdownContainer}
                          style={{
                            ...styles.input,

                            zIndex: 1000, // Ensure dropdown is displayed on top
                          }}
                          placeholderStyle={{ fontSize: 16, color: 'grey' }}
                          dropDownStyle={{ backgroundColor: '#fafafa' }}
                          ListEmptyComponent={
                            loadingPhase ? LoadingIndicator : null
                          }
                          onClose={() => setOpenDropdown(null)}
                        />

                        {/* Dropdown phase input field view end : */}
                      </View>

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
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                          <Text style={{ color: 'red' }}>{errors.from_rd}</Text>
                        </View>
                        {/* view6 start: */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <TextInput
                            style={{ ...styles.input, width: '50%' }}
                            placeholder="XXXXXX"
                            onChangeText={handleChangeFromRDPart1}
                            keyboardType="numeric"
                            maxLength={6}
                            value={
                              fromRDPart1 !== null ? fromRDPart1.toString() : ''
                            } // Display original value if null
                           // value={fromRDPart1 } // Display original value if null
                            // value={fromRDPart1 ? fromRDPart1 : ""} // Convert to string for text input
                            // value={fromRDPart1}
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
                            style={{ ...styles.input, width: '42%' }}
                            placeholder="XXX"
                            onChangeText={handleChangeFromRDPart2}
                            onBlur={handleBlurFromRDPart2}  // Apply padding when the user exits the input

                            keyboardType="numeric"
                            maxLength={3}
                            value={fromRDPart2 !== null ? fromRDPart2.toString() : ''} // Display original value if null

                            placeholderTextColor={'grey'}
                          />
                          {/* view6 end */}
                        </View>
                        {/* view5 end: */}
                      </View>

                      <View style={{ flexDirection: 'column', flex: 1 }}>
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
                        {/* <View style={{ flexDirection: "column", flex: 1 }}>
  
  <Text style={{ color: 'red' }}>{errors.to_rd}</Text>
</View> */}
                        {/* view8 start: */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <TextInput
                            style={{ ...styles.input, width: '48%' }}
                            placeholder="XXXXXX"
                            onChangeText={handleChangeToRDPart1}
                            keyboardType="numeric"
                            maxLength={6}
                            placeholderTextColor={'grey'}
                            value={toRDPart1 !== null ? toRDPart1.toString() : ''} // Display original value if null
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
                            style={{ ...styles.input, width: '42%' }}
                            placeholder="XXX"
                            onChangeText={handleChangeToRDPart2}
                            onBlur={handleBlurToRDPart2}

                            keyboardType="numeric"
                            maxLength={3}
                            placeholderTextColor={'grey'}
                            value={
                              toRDPart2 !== null ? toRDPart2.toString() : ''
                            } // Display original value if null
                         //   value={toRDPart2 !== null && toRDPart2 !== undefined ? toRDPart2.toString() : ''}

                          // value={toRDPart2 !== null ? toRDPart2.toString() : ''} // Display original value if null
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
                          style={{ ...styles.input }}
                          placeholder="Length Covered"
                          onChangeText={handleChange('length')}
                          value={displayLength}
                          keyboardType="numeric"
                          editable={false}
                          placeholderTextColor={
                            "grey"
                          }
                        />
                        {/* length filed ends: */}
                      </View>
                      {/* Expected Silt field */}
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
                          Expected Silt (Lac Cft)
                        </Text>
                        {/* <View style={{flexDirection: 'column', flex: 1}}>
                          <Text style={{color: 'red'}}>
                            {errors.expected_silt}
                          </Text>
                        </View> */}
                        <TextInput
                          aria-label="Expected Silt"
                          style={{ ...styles.input }}
                          placeholder="Expected Silt "
                          onChangeText={text =>
                            setExpectedSilt(parseFloat(text) || 0)
                          } // Update siltQuantity state directly
                          value={expectedSilt ? expectedSilt.toString() : ''} // Convert to string for text input
                          // onChangeText={(value) => setExpectedSilt(value)}
                          //value={expectedSilt} // State variable set by API
                          // onChangeText={handleChange("expectedSilt")} // Update the state when the user types
                          //  value={values.username}
                          // value={expectedSilt}
                          keyboardType="numeric"
                          placeholderTextColor={
                            "grey"
                          }
                        />
                      </View>

                      {/* Estimated Cost field */}
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
                          Estimated Cost (Rs. in Millions)
                        </Text>
                        {/* <View style={{flexDirection: 'column', flex: 1}}>
                          <Text style={{color: 'red'}}>
                            {errors.estimated_cost}
                          </Text>
                        </View> */}
                        <TextInput
                          aria-label="Estimated Cost"
                          style={{ ...styles.input }}
                          placeholder="Estimated Cost"
                          //  onChangeText={handleChange("estimatedCost")}
                          onChangeText={text =>
                            setEstimatedCost((text))
                          } // Update siltQuantity state directly
                          value={estimatedCost ? estimatedCost.toString() : ''} // Convert to string for text input
                          // value={values.username}
                          keyboardType="numeric"
                          placeholderTextColor={
                            "grey"
                          }
                        />
                      </View>

                      {/* DropDown work view start: */}
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
                          Nature of Work
                        </Text>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                          <Text style={{ color: 'red' }}>
                            {errors.work}
                          </Text>
                        </View>
                        <DropDownPicker
                          listMode="SCROLLVIEW"
                          items={WORK_CHOICES}
                          value={work}
                          open={openDropdown === 'work'}
                          setOpen={() => handleOpen('work')}
                          setValue={setWork}
                          placeholder="Select Work "
                          containerStyle={styles.dropdownContainer}
                          style={{
                            ...styles.input,

                            zIndex: 1000, // Ensure dropdown is displayed on top
                          }}
                          placeholderStyle={{ fontSize: 16, color: 'grey' }}
                          dropDownStyle={{ backgroundColor: '#fafafa' }}
                          onClose={() => setOpenDropdown(null)}
                        />
                        {/* Dropdown work input field view end : */}
                      </View>

                      {/* DropDown complete view start: */}
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
                          Completion Status
                        </Text>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                          <Text style={{ color: 'red' }}>{errors.complete}</Text>
                        </View>
                        <DropDownPicker
                          listMode="SCROLLVIEW"
                          items={COMPLETED_CHOICES}
                          value={complete}
                          open={openDropdown === 'complete'}
                          setOpen={() => handleOpen('complete')}
                          setValue={setComplete}
                          placeholder="Select Completion Status "
                          containerStyle={styles.dropdownContainer}
                          style={{
                            ...styles.input,

                            zIndex: 1000, // Ensure dropdown is displayed on top
                          }}
                          placeholderStyle={{ fontSize: 16, color: 'grey' }}
                          dropDownStyle={{ backgroundColor: '#fafafa' }}
                          onClose={() => setOpenDropdown(null)}
                        />
                        {/* Dropdown work input field view end : */}
                      </View>

                      {/* Date start view start: */}

                      <View style={{ ...styles.input }}>
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
                            Planned Start Date  :
                          </Text>
                        </View>
                        <Pressable onPress={() => setOpenStartDate(true)}>
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
                            <Text style={{ color: COLORS.white }}>
                              {startDate
                                ? startDate.toLocaleDateString('en-GB', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                }) // Format the date as 'DD/MM/YYYY'
                                : 'Select Start Date'}
                            </Text>
                          </View>
                        </Pressable>
                        <DatePicker
                          modal
                          open={openStartDate}
                          date={startDate || new Date()} // Pass current date if startDate is null
                          onConfirm={date => {
                            setOpenStartDate(false);
                            setStartDate(date);
                          }}
                          onCancel={() => {
                            setOpenStartDate(false);
                          }}
                          mode="date"
                        />
                        {/* Date start view ends: */}
                      </View>

                      {/* End Date view start: */}

                      <View style={{ ...styles.input }}>
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
                            Planned Date End:
                          </Text>
                        </View>
                        <Pressable onPress={() => setOpenEndDate(true)}>
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
                            <Text style={{ color: COLORS.white }}>
                              {endDate
                                ? endDate.toLocaleDateString('en-GB', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                }) // Format the date as 'DD/MM/YYYY'
                                : 'Select End Date'}
                            </Text>
                          </View>
                        </Pressable>

                        <DatePicker
                          modal
                          open={openEndDate}
                          date={endDate || new Date()} // Pass current date if endDate is null
                          onConfirm={date => {
                            setOpenEndDate(false);
                            setEndDate(date);
                          }}
                          onCancel={() => {
                            setOpenEndDate(false);
                          }}
                          mode="date"
                        />
                        {/* date end view ends: */}
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
                              <Text style={{ color: COLORS.white }}>
                                Update Task
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

export default UpdateTasks;

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
  detailsContainer: { flex: 1, paddingHorizontal: 20, marginTop: 40 },
  facility: { flexDirection: 'row', marginRight: 15 },
  facilityText: { marginLeft: 5, color: COLORS.grey },
});
