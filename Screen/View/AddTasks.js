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
  TouchableOpacity,
  Modal,
  Button,
  ToastAndroid,Alert
} from 'react-native';
import COLORS from '../Theme&API/Theme';
import API from '../Theme&API/Config';
import NetInfo from '@react-native-community/netinfo';
import { ActivityIndicator } from 'react-native';
import { Formik } from 'formik';

import DropDownPicker from 'react-native-dropdown-picker';
import DatePicker from 'react-native-date-picker';

const { width } = Dimensions.get('screen');
import { useNavigation } from '@react-navigation/native';
// import GetLocation from 'react-native-get-location';
// import moment from 'moment';
import LoadingIndicator from '../LoadingIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'taskManager.db', location: 'default' });

//TODO: .4. validation ............... 7. change toasts .... * DROPDOWN

const AddTasks = () => {
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

  const navigation = useNavigation();
  const zero = 0;
  //UserID from login screen
  const [userId, setUserId] = useState(null);

  const [response, setResponse] = useState([]);
  const [errors, setErrors] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false); // For modal visibility
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

  // State to control the open/close state of the dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);
  // dropdown and dropdown id states:
  //canals:
  const [canal, setCanal] = useState([]);
  const [selectedCanalId, setSelectedCanalId] = useState(null);
  const [canalId, setCanalId] = useState(null);
  const [loadingCanal, setLoadingCanal] = useState(true);
  //assignment:
  const [assignment, setAssignment] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);

  const [work, setWork] = useState(null);
  const [complete, setComplete] = useState('Pending');
  //const [defaultValueCompleted, setDefaultValueCompleted] = useState(Pending);
//tailRD:
const [tailRD, setTailRD] = useState(0);

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
  const [isConnected, setIsConnected] = useState(true);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);

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
        (parseFloat(toRDPart1 ) + parseFloat(toRDPart2)) -(parseFloat(fromRDPart1)  + parseFloat(fromRDPart2)),
       // fromRDPart1 + fromRDPart2 - (toRDPart1 + toRDPart2),
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

  const handleChangeFromRDPart1 = text => {
    setfromRDPart1(parseInt(text, 10) * 1000);
  };
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
  const handleChangeToRDPart1 = text => {
    settoRDPart1(parseInt(text, 10) * 1000);
  };
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
          // console.log("userID in add tasks", userId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    getUserId();
  }, []);
  const getTokens = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const bearerToken = await AsyncStorage.getItem('accessToken');
      // console.log("Refresh Token:", refreshToken);
      // console.log("Bearer Token:", bearerToken);
      return { refreshToken, bearerToken };
    } catch (error) {
      console.error('Error retrieving tokens from storage:', error);
      return { refreshToken: null, bearerToken: null };
    }
  };
  useEffect(() => {
    getTokens();
  }, []);

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const createTables = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS canals (id INTEGER PRIMARY KEY NOT NULL, value INTEGER UNIQUE, label TEXT, UNIQUE(value));`,
        [],
        () => console.log("Table 'canals' created successfully."),
        error => console.error("Error creating 'canals' table:", error),
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS assignments (id INTEGER PRIMARY KEY NOT NULL, value INTEGER UNIQUE, label TEXT, UNIQUE(value));`,
        [],
        () => console.log("Table 'assignments' created successfully."),
        error => console.error("Error creating 'assignments' table:", error),
      );
      // tx.executeSql(
      //   `DROP TABLE IF EXISTS phases;`,
      //   [],
      //   () => console.log("Dropped 'phases' table."),
      //   error => console.error("Error dropping 'phases' table:", error),
      // );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS phases (id INTEGER PRIMARY KEY NOT NULL, value INTEGER UNIQUE, label TEXT, UNIQUE(value));`,
        [],
        () => console.log("Table 'phases' created successfully."),
        error => console.error("Error creating 'phases' table:", error),
      );

    });

  };

  const saveDataToSQLite = (tableName, data) => {
    console.log(`Saving data to ${tableName} table...`);
    console.log(data, 'data to save in table');
  
    db.transaction(tx => {
      data.forEach(item => {
        const values = [item.label, item.value];
        tx.executeSql(
          `INSERT OR REPLACE INTO ${tableName} (label, value) VALUES (?, ?)`,
          values,
          () =>
            // console.log(
            //  // `Inserted data: label=${item.label}, value=${item.value} into ${tableName}`,
            // ),
          error => console.error(`Error inserting into ${tableName}`, error),
        );
      });
    });
  };

  const getDataFromSQLite = (tableName, params = []) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM ${tableName}`,
          params,
          (tx, results) => {
            const rows = results.rows.raw();
            resolve(rows);
          },
          error => {
            console.error(`Error fetching from ${tableName}`, error);
            reject(error);
          },
        );
      });
    });
  };

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
        ` Oops! ${fieldName} cannot be negative. ❌`,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      return false; // Stop further processing
    }
  }

  return true; // All values are valid
}

  const fetchCanalData = async () => {
    try {
      setLoadingCanal(true);
      const networkState = await NetInfo.fetch();
      const { refreshToken, bearerToken } = await getTokens();

      if (!refreshToken || !bearerToken) {
        console.error('Missing tokens, unable to fetch canal data');
        return;
      }

      if (networkState.isConnected) {
        const response = await fetch(API.canals, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
    // console.log('Canalassss dropdown Data', data)
   
        const formattedCanals = data.map(canal => ({
          value: canal.id,
          label: canal.name,
        }));
        setCanal(formattedCanals);
        saveDataToSQLite('canals', formattedCanals);
       
      } else {
        const cachedData = await getDataFromSQLite('canals');

        console.log('Cached data:', cachedData);
        const formattedCanals = cachedData.map(canal => ({
          value: canal.value,
          label: canal.label,
        }));
        setCanal(formattedCanals);
        
        
      }
    } catch (error) {
      console.error('Error fetching canals:', error);
    } finally {
      setLoadingCanal(false);
    }
  };


  const initializeDB = async () => {
    (await db).transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tail_rd_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          canal_id INTEGER UNIQUE,
          tail_rd TEXT
        );`,
        [],
        () => console.log('tail_rd_data table created'),
        (_, error) => console.error('Error creating table:', error)
      );
    });
  };
  
  initializeDB();




// this is for getting the tail rd once canal is selected 
// const handleCanalSelection = async (selectedCanalId) => {
//   try {
//     if (!selectedCanalId) {
//       console.error('No canal ID selected.');
//       return;
//     }
//   console.log('Selected Canal ID in handleCanalSelection:', selectedCanalId); // Debug log
//     await fetchTailRD(selectedCanalId);
//   } catch (error) {
//     console.error('Error handling canal selection:', error);
//   }
// };
// this is tail rd fetched from canals api based on selected canal id .. this will be used to validate the RDs
// const fetchTailRD = async (selectedCanalId) => {
//   if (!selectedCanalId || typeof selectedCanalId !== 'number') {
//     console.error('Invalid Canal ID:', selectedCanalId); // Debug log
//     return;
//   }

//   try {
//     const { bearerToken } = await getTokens();

//     if (!bearerToken) {
//       console.error('Missing bearer token, unable to fetch tail RD data');
//       return;
//     }

//     const endpoint = `${API.canals}${selectedCanalId}`;
//     console.log('Fetching from URL:', endpoint); // Debug log

//     const response = await fetch(endpoint, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${bearerToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       console.error(`Failed to fetch data: ${response.status} - ${response.statusText}`);
//       return;
//     }

//     const data = await response.json();
//     console.log('*******Tail RD for selected canal:', data.tail_rd); 
//     setTailRD(data.tail_rd);
//   } catch (error) {
//     console.error('Error fetching tail RD:', error);
//   }
// };


const saveTailRDToDB = async (canalId, tailRD) => {
  (await db).transaction((tx) => {
    tx.executeSql(
      `INSERT OR REPLACE INTO tail_rd_data (canal_id, tail_rd) VALUES (?, ?);`,
      [canalId, tailRD],
      () => console.log(`Tail RD saved for canal ID ${canalId}`),
      (_, error) => console.error('Error saving tail RD to SQLite:', error)
    );
  });
};

const fetchTailRD = async (selectedCanalId) => {
  if (!selectedCanalId || typeof selectedCanalId !== 'number') {
    console.error('Invalid Canal ID:', selectedCanalId);
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

    // Save Tail RD in SQLite
    saveTailRDToDB(selectedCanalId, data.tail_rd);

    setTailRD(data.tail_rd);
  } catch (error) {
    console.error('Error fetching tail RD:', error);
  }
};


const getTailRDFromDB = (canalId) => {
  return new Promise(async (resolve, reject) => {
    (await db).transaction((tx) => {
      tx.executeSql(
        `SELECT tail_rd FROM tail_rd_data WHERE canal_id = ?;`,
        [canalId],
        (_, result) => {
          if (result.rows.length > 0) {
            const { tail_rd } = result.rows.item(0);
            console.log(`Fetched Tail RD from SQLite: ${tail_rd}`);
            resolve(tail_rd);
          } else {
            console.warn('No Tail RD found for the selected Canal ID.');
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error fetching tail RD from SQLite:', error);
          reject(error);
        }
      );
    });
  });
};



const handleCanalSelection = async (selectedCanalId) => {
  try {
    if (!selectedCanalId) {
      console.error('No canal ID selected.');
      return;
    }

    console.log('Selected Canal ID in handleCanalSelection:', selectedCanalId);

    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      // Online: Fetch from API
      await fetchTailRD(selectedCanalId);
    } else {
      // Offline: Fetch from SQLite
      const tailRD = await getTailRDFromDB(selectedCanalId);
      if (tailRD) {
        setTailRD(tailRD);
      } else {
        console.warn('No Tail RD found in offline storage.');
      }
    }
  } catch (error) {
    console.error('Error handling canal selection:', error);
  }
};



const ValidatingToRDWithTailRD = (toRD) => {
  if (toRD > tailRD) {
    // ToastAndroid.showWithGravity(
    //   `Invalid To RD: ${toRD} exceeds  Canal's Tail RD: ${tailRD}`,
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


  
  const fetchAssignmentData = async () => {
    try {
      setLoadingAssignment(true);
      const networkState = await NetInfo.fetch();
      const { refreshToken, bearerToken } = await getTokens();

      if (!refreshToken || !bearerToken) {
        console.error('Missing tokens, unable to fetch assignment data');
        return;
      }

      if (networkState.isConnected) {
        const response = await fetch(API.titles, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const formattedAssignments = data.map(assignment => ({
          label: assignment.title,
          value: assignment.id,
        }));

        saveDataToSQLite('assignments', formattedAssignments);
        setAssignment(formattedAssignments);
      } else {
        const cachedData = await getDataFromSQLite('assignments');
        console.log(cachedData, 'assignment Cached Data');
        const formattedAssignments = cachedData.map(assignment => ({
          label: assignment.label,
          value: assignment.value,
        }));

        setAssignment(formattedAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoadingAssignment(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
    fetchCanalData();
    checkInternetConnection();
    fetchPhaseData();
  
    
  }, [zero]);

  const checkInternetConnection = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  };


  const fetchPhaseData = async () => {
    try {
      setLoadingPhase(true);
      const networkState = await NetInfo.fetch();
      const { refreshToken, bearerToken } = await getTokens();
  
      if (!refreshToken || !bearerToken) {
        console.error('Missing tokens, unable to fetch phase data');
        return;
      }
  
      if (networkState.isConnected) {
        const response = await fetch(API.phases, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
        console.log('Phase API response', data);
  
        const formattedPhases = data.map(phase => ({
          label: phase.name,
          value: phase.id,
        }));
  
        saveDataToSQLite('phases', formattedPhases);
        setPhase(formattedPhases);
      } else {
        const phasecachedData = await getDataFromSQLite('phases');
        console.log('Phases Cached Data:', phasecachedData);
        const formattedPhases = phasecachedData.map(phase => ({
          label: phase.label,
          value: phase.value,
        }));
  
        setPhase(formattedPhases);
      }
    } catch (error) {
      console.error('Error fetching phases:', error);
    } finally {
      setLoadingPhase(false);
    }
  };



useEffect(() => {
  createTables();
}, [isConnected, zero]);

const validateDates = (startDate, endDate, work) => {
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
    ToastAndroid.showWithGravity(
      'Please select End Date.',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    return false;
  }

  // Ensure start date comes before end date
  if (startDate > endDate) {
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

// const validateRequiredFields = (values) => {
//   const requiredFields = [ 'from_rd', 'to_rd', 'completed'];

//   for (let field of requiredFields) {
//     if (!values[field]) {
//       ToastAndroid.showWithGravity(
//         `${field.replace('_', ' ')} is a required field.`,
//         ToastAndroid.LONG,
//         ToastAndroid.CENTER,
//       );
//       return false;
//     }
//   }

//   return true;  // If all required fields are valid
// };

const submitForm = async values => {
  const fromRD = (parseFloat(fromRDPart1) + parseFloat(fromRDPart2));
  const toRD = (parseFloat(toRDPart1) + parseFloat(toRDPart2));
  console.log('from rd totallllllllllllllllllllllllllllllllllllll ', fromRD);
  console.log('to RD total', toRD);
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
  // if (fromRD === null || fromRD === undefined || fromRD === '') {
  //   ToastAndroid.showWithGravity(
  //     'Please enter From RD.',
  //     ToastAndroid.LONG,
  //     ToastAndroid.CENTER,
  //   );
  //   return false;
  // }
  // if (toRD === null || toRD === undefined || toRD === '') {
  //   ToastAndroid.showWithGravity(
  //     'Please enter To RD.',
  //     ToastAndroid.LONG,
  //     ToastAndroid.CENTER,
  //   );
  //   return false;
  // }
  // if (!fromRD) {
  //   ToastAndroid.showWithGravity(
  //     'Please enter from RD.',
  //     ToastAndroid.LONG,
  //     ToastAndroid.CENTER,
  //   );
  //   return false;
  // }

  if (!values.estimatedCost) {
    console.error("Estimated Costs is missing");
    ToastAndroid.showWithGravity(
      'Estimated Costs is a required field . please fill it in.',
      ToastAndroid.LONG,
      ToastAndroid.TOP,
    );

    return;
  }
  if (!work) {
    console.error("work is missing");
    ToastAndroid.showWithGravity(
      'Nature of Work is a required field . Please fill it in.',
      ToastAndroid.LONG,
      ToastAndroid.TOP,
    );

    return;
  }
  if (!selectedAssignmentId) {
    console.error("Assignment is missing");
    ToastAndroid.showWithGravity(
      'Assignment is a required field . Please fill it in.',
      ToastAndroid.LONG,
      ToastAndroid.TOP,
    );

    return;
  }

  if (!values.expectedSilt) {
    ToastAndroid.showWithGravity(
      'Please enter expected silt.',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    return false;
  }
  if (!selectedPhaseId) {
    ToastAndroid.showWithGravity(
      'Please select a phase.',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    return false;
  }
  if (!selectedCanalId) {
    ToastAndroid.showWithGravity(
      'Please select a canal.',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    return false;
  }
  
   if (!ValidatingToRDWithTailRD(toRD)) {
    return false; 
  }
  const isValidDates = validateDates(startDate, endDate, work);

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

  const isValidRD = validateRD(parseFloat(fromRD), parseFloat(toRD));
  // if (!isValidDates || !isValidRD) {
  //   if (!isValidDates) {
  //     setErrors(prevErrors => ({
  //       ...prevErrors,
  //       planned_start_date: 'Invalid start or end date',
  //       planned_end_date: 'Invalid start or end date',
  //     }));
  //   }
  //   if (!isValidRD) {
  //     setErrors(prevErrors => ({
  //       ...prevErrors,
  //       from_rd: 'Invalid From RD or To RD',
  //       to_rd: 'Invalid From RD or To RD',
  //     }));
  //   }
  //   return;
  // }

  if (!isValidDates || !isValidRD) {
    return; // Prevent form submission if validations fail
  }

  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  // if (!userId) {
  //   ToastAndroid.showWithGravity(
  //     'User ID not found. Please log in again.',a
  //     ToastAndroid.LONG,
  //     ToastAndroid.TOP,
  //   );
  //   return;
  // }
  console.log('Form values api at line 665 :', values);
  const requiredFields = {
    from_rd: fromRD,
    work: work,
    to_rd: toRD,
    phase: selectedPhaseId,
    canal: selectedCanalId,
    assigned_to: selectedAssignmentId,
    expected_silt: values.expectedSilt,
    completed: complete,
    // planned_end_date: formattedEndDate,
    // planned_start_date: formattedStartDate,
    expected_silt: values.expectedSilt, // Silt Quantity
    estimated_cost: values.estimatedCost, // Estimated Cost
  };
  // Check if any required field is missing
  const missingFields = Object.keys(requiredFields).filter(
    key => requiredFields[key] === undefined || requiredFields[key] === null,
  );

  if (missingFields.length > 0) {
    // Set errors for the missing fields
    setErrors(prevErrors => ({
      ...prevErrors,
      ...missingFields.reduce((acc, field) => {
        acc[field] = 'This field is required';
        return acc;
      }, {}),
    }));
    return; // Prevent form submission
  }

  // Continue with form submission if validation passes
  setErrors({}); // Clear errors
  // ... rest of submitForm code
  try {
    const { refreshToken, bearerToken } = await getTokens();

    if (!bearerToken) {
      console.error('Missing bearer token, unable to submit form');
      return;
    }
    setLoading(true);

    const taskObject = {
      work: work,
      canal: selectedCanalId,
      phase: selectedPhaseId,
      from_rd: fromRD,
      to_rd: toRD,
      total_length: finalLength,
      completed: complete,
      planned_start_date: formattedStartDate,
      planned_end_date: formattedEndDate,
      expected_silt: values.expectedSilt, // Silt Quantity
      estimated_cost: values.estimatedCost, // Estimated Cost
    };

    const requestBody = {
      assigned_to: selectedAssignmentId,
      tasks: taskObject,
    };

    console.log('Form data Add tasks form', requestBody);

    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        // Internet is available, submit the form
        const { refreshToken, bearerToken } = await getTokens();
        if (!bearerToken) {
          console.error('Missing bearer token, unable to submit form');
          return;
        }
        setLoading(true);

        const response = await fetch(API.tasksAssignment, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('API response add tasks form:', data);
        if (!response.ok) {
          
          ToastAndroid.showWithGravity(
            data.message || 'Failed to submit form ',
            ToastAndroid.LONG,
            ToastAndroid.TOP,
          );
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
          errorMessage || 'Failed to Add Tasks. Please try again.', // Message to display
          [{text: 'OK'}], // Button configuration
        );
          throw data
        }

        ToastAndroid.showWithGravity(
          'Form submitted successfully  ✅',
          ToastAndroid.LONG,
          ToastAndroid.TOP,
        );

        setTimeout(() => {
          navigation.navigate('MainTabNavigator');
        }, 3000);

        setLoading(false);
      } else {
       

        const generateUniqueId = () =>
          `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

        const uniqueId = generateUniqueId();
        const offlineData = {
          id: uniqueId,
          ...requestBody,
        };

        // Retrieve existing offline data from AsyncStorage
        const existingData = await AsyncStorage.getItem('offlineRequestData');
        const offlineArray = existingData ? JSON.parse(existingData) : [];

        offlineArray.push(offlineData);

        // Save the updated array back to AsyncStorage
        await AsyncStorage.setItem(
          'offlineRequestData',
          JSON.stringify(offlineArray),
        );

        console.log('Offline data saved:', offlineArray);

        ToastAndroid.showWithGravity(
          'No internet connection. Data saved offline.',
          ToastAndroid.LONG,
          ToastAndroid.TOP,
        );

        setIsModalVisible(true);
        navigation.navigate('MainTabNavigator');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      ToastAndroid.showWithGravity(
        'Failed to save form offline. Please try again.',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
    } finally {
      setLoading(false);
    }
  } catch (error) {
    console.error('Form submission error:', error);
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
          errorMessage || 'Failed to Add Tasks. Please try again.', // Message to display
          [{text: 'OK'}], // Button configuration
        );
  } finally {
    setLoading(false);
  }
};

// Modal component
const OfflineStorageModal = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}>
    <View style={styles.modalView}>
      <Text style={styles.modalText}>Your data is stored offline.</Text>
      <TouchableOpacity onPress={onClose}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);
return (
  <>
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {showNoInternetModal && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showNoInternetModal}
          onRequestClose={() => setShowNoInternetModal(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>No Internet Connection</Text>
            <TouchableOpacity onPress={() => setShowNoInternetModal(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <OfflineStorageModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

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
                  paddingTop: 10,

                  //backgroundColor: 'pink',
                }}>
                {/* view3 start: */}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                  }}>
                  {/* view4 start: */}
                  <View style={{ flexDirection: 'column', flex: 1 }}>
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
                      <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ color: 'red' }}>{errors.canal}</Text>
                      </View>
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        items={canal}
                        value={selectedCanalId}
                        setValue={(callback) => {
                          const value = callback(selectedCanalId); // Extract the new value
                          console.log('Selected value in canal dropdown:', value); // Debug log
                          setSelectedCanalId(value); // Update state
                          handleCanalSelection(value); // Call function to handle selection
                        }}
                      //  onValueChange={(value) => handleCanalSelection(value)}
                        open={openDropdown === 'canal'}
                        setOpen={() => handleOpen('canal')}
                        // setValue={val => {
                        //   setSelectedCanalId(val);
                        //   fetchPhaseData(val);
                        // }}
                       // onChangeItem={(item) => handleCanalSelection(item.value)} // Pass selected canal ID directly
                        searchable={true}
                        searchPlaceholder="Search for Canal"
                        placeholder="Select Canal"
                        containerStyle={styles.dropdownContainer}
                        style={{ ...styles.input, zIndex: 1000 }}
                        placeholderStyle={styles.placeholderStyle}
                        dropDownStyle={{ backgroundColor: '#fafafa' }}
                        ListEmptyComponent={
                          loadingCanal ? LoadingIndicator : null
                        }
                        onClose={() => setOpenDropdown(null)}
                      />
                    </View>
                    {/* Dropdown canal input field view end */}

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
                        <View
                          style={{ flexDirection: 'column', flex: 1 }}></View>
                        <DropDownPicker
                          listMode="SCROLLVIEW"
                          items={loadingPhase ? [] : phase}
                          value={selectedPhaseId}
                          open={openDropdown === 'phase'}
                          setOpen={() => handleOpen('phase')}
                          setValue={setSelectedPhaseId}
                          // placeholder="Select Phase "
                          placeholder={
                            // phase.length === 0
                            // ? 'No previous phase available for this canal'
                            // : 

                            'Select Phase'
                          }
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

                    {/* view5 start: */}
                    {/* From RD and To RD fields start: */}
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

                      <View style={{ flexDirection: 'column', flex: 1 }}></View>
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
                          style={{ ...styles.input, width: '42%' }}
                          placeholder="XXX"
                          onChangeText={handleChangeFromRDPart2}
                          onBlur={handleBlurFromRDPart2}  // Apply padding when the user exits the input
                          keyboardType="numeric"
                          maxLength={3}
                          value={fromRDPart2}
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
                      <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ color: 'red' }}>
                          {errors.to_rd}
                        </Text>
                      </View>
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
                          value={toRDPart2}
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
                      <View style={{ flexDirection: 'column', flex: 1 }}></View>
                      <TextInput
                        aria-label="Length Covered"
                        style={{ ...styles.input }}
                        placeholder="Length Covered"
                        onChangeText={handleChange('length')}
                        value={displayLength}
                        keyboardType="numeric"
                        editable={false}
                        placeholderTextColor={'grey'}
                      />
                      {/* lenghth filed ends: */}
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
                      <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ color: 'red' }}>
                          {errors.expected_silt}
                        </Text>
                      </View>
                      <TextInput
                        aria-label="Expected Silt"
                        style={{ ...styles.input }}
                        placeholder=" Expected Silt "
                        onChangeText={handleChange('expectedSilt')} // Update the state when the user types
                        value={values.username}
                        // value={expectedSilt}
                        keyboardType="numeric"
                        placeholderTextColor={'grey'}
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
                      <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ color: 'red' }}>
                          {errors.estimated_cost}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'column', flex: 1 }}></View>
                      <TextInput
                        aria-label="Estimated Cost"
                        style={{ ...styles.input }}
                        placeholder="Estimated Cost"
                        onChangeText={handleChange('estimatedCost')}
                        value={values.username}
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
                        //    defaultValue={defaultValueCompleted}
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
                    {/* DropDown Assignment view start: */}
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
                        Assign To
                      </Text>
                      <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ color: 'red' }}>
                          {errors.assigned_to}
                        </Text>
                      </View>
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        items={loadingAssignment ? [] : assignment}
                        value={selectedAssignmentId}
                        open={openDropdown === 'assignment'}
                        setOpen={() => handleOpen('assignment')}
                        setValue={setSelectedAssignmentId}
                        searchable={true}
                        searchPlaceholder="Search for Assignee"
                        placeholder="Select Assignee"
                        containerStyle={styles.dropdownContainer}
                        style={{ ...styles.input, zIndex: 1000 }}
                        placeholderStyle={styles.placeholderStyle}
                        dropDownStyle={{ backgroundColor: '#fafafa' }}
                        ListEmptyComponent={
                          loadingAssignment ? LoadingIndicator : null
                        }
                        onClose={() => setOpenDropdown(null)}
                      />
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
                      <View style={{ flexDirection: 'column', flex: 1, }}>
                        <Text style={{ color: 'red' }}>
                          {errors.startDate}
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
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                          <Text style={{ color: 'red' }}>
                            {errors.formattedEndDate}
                          </Text>
                        </View>
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
                              Assign Task
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

export default AddTasks;

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
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
