import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Image, TextInput } from 'react-native';
import API from '../Theme&API/Config';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../Theme&API/Theme';
import {useNavigation } from '@react-navigation/native';
import LoadingIndicator from '../LoadingIndicator';
import NetInfo from '@react-native-community/netinfo';
import SQLite from 'react-native-sqlite-storage';

interface Progress {
  id: number,
  assigned_by: {
    user_name: string;
  }
  assigned_to: {
    user_name: string
  }
  tasks: {
    id: number,
    task_representation: string,
    from_rd: number,
    to_rd: number,
    work: string,
    planned_start_date: string,
    planned_end_date: string,
    completed: string,
    completed_percent: string,

  }
  assigned_date: string,
}


const db = SQLite.openDatabase({ name: 'tasks.db', location: 'default' }, () => { }, error => console.log(error));

const Home = ({ navigation }: any) => {


  const [Tasks, SetTasks] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const[userId, setUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);


  // Check Internet Connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected !== null) {
        setIsConnected(state.isConnected);
      }
    });
    return () => unsubscribe();
  }, []);

  // Create table if not exists
  const createTable = () => {
    db.transaction(tx => {
      // Drop the table if it exists
      // tx.executeSql(
      //   'DROP TABLE IF EXISTS progress;',
      //   [],
      //   () => {
      //     console.log('Table deleted successfully');
      //   },
      //   (error) => {
      //     console.error('Error deleting table:', error);
      //   }
      // );

      // Create the table with corrected syntax
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tasks TEXT,
            assigned_by TEXT,
            assigned_to TEXT,
            assigned_date TEXT
          );`,
        [],
        () => {
          console.log('Table created successfully: progress');
        },
        (error) => {
          console.error('Error creating table:', error);
        }
      );
    });
  };

  // Save tasks to SQLite
  const saveTasksToDB = (progressArray: any[]) => {
    db.transaction(tx => {
      progressArray.forEach(progress => {
        const tasks = typeof progress.tasks === 'object' ? JSON.stringify(progress.tasks) : progress.tasks;
        const assigned_by = typeof progress.assigned_by === 'object' ? JSON.stringify(progress.assigned_by) : progress.assigned_by;
        const assigned_to = typeof progress.assigned_to === 'object' ? JSON.stringify(progress.assigned_to) : progress.assigned_to;

        tx.executeSql(
          'INSERT OR REPLACE INTO progress (id, tasks, assigned_by, assigned_to, assigned_date) VALUES (?, ?, ?, ?, ?)',
          [
            progress.id,
            tasks,
            assigned_by,
            assigned_to,
            progress.assigned_date,
          ],
          () => console.log('Record inserted successfully'),
          (error) => console.error('Error inserting record:', error)
        );
      });
    });
  };

  // Fetch tasks from SQLite
  const fetchTasksFromDB = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM progress', [], (tx, results) => {
        let len = results.rows.length;
        console.log('Number of records fetched from SQLite:', len);

        if (len > 0) {
          let progressData: Progress[] = [];
          for (let i = 0; i < len; i++) {
            const row = results.rows.item(i);

            // Parse JSON fields if necessary
            const tasks = row.tasks ? JSON.parse(row.tasks) : {};

            progressData.push({
              ...row,
              assigned_by: {
                user_name: row.assigned_by ? JSON.parse(row.assigned_by).user_name : '',
              },
              assigned_to: {
                user_name: row.assigned_to ? JSON.parse(row.assigned_to).user_name : '',
              },
              tasks: {
                id: tasks.id || 0,
                task_representation: tasks.task_representation || 'N/A',
                from_rd: tasks.from_rd || 0,
                to_rd: tasks.to_rd || 0,
                work: tasks.work || 'N/A',
                planned_start_date: tasks.planned_start_date || 'N/A',
                planned_end_date: tasks.planned_end_date || 'N/A',
              }
            });
          }
          SetTasks(progressData);
        } else {
          console.log('No records found in SQLite.');
        }
        setLoading(false);
      },
        (error) => {
          console.error('Error fetching data from SQLite:', error);
          setLoading(false);
        }
      );
    });
  };

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      const role = await AsyncStorage.getItem('userRole');
      const fullname= await AsyncStorage.getItem('full_name');
      const username= await AsyncStorage.getItem('user_name');


      if (!role) {
        throw new Error('Role not found');
      }
      setUserRole(parseInt(role));

      if (!fullname) {
        throw new Error('Name not found');
      }
      setUserName(JSON.parse(fullname));

      if (!accessToken) {
        throw new Error('Access token not found');
      }

      if (!username) {
        throw new Error('User ID not found');
      }
      setUserId(JSON.parse(username));

      if (isConnected) {
        const response = await axios.get(API.assigned, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        SetTasks(response.data);
        console.log('Tasks fetched from API:', response.data);
        saveTasksToDB(response.data);
      } else {
        setShowNoInternetModal(true);
        fetchTasksFromDB();
        console.log('No internet connection, fetching tasks from SQLite...');
        console.log('Tasks fetched from SQLite:', fetchTasksFromDB);

      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    createTable();
    fetchTasks();
  }, [isConnected]);

  const renderNoInternetModal = () => (
    <Modal visible={showNoInternetModal} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { alignItems: 'center', flexDirection: 'column', }]}>
          <Text style={styles.cardText}>You are Currently</Text>
          <Image source={require('../assets/error.png')} style={{ width: 150, height: 150, }} resizeMode='contain' />
          <TouchableOpacity onPress={() => setShowNoInternetModal(false)} style={styles.closeButton}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderProgressData = () => {
    return Tasks.map((progress, index) => (
      <ProgressCard
        key={index}
        id={progress.id}
        assigned_by={progress.assigned_by}
        assigned_to={progress.assigned_to}
        tasks={progress.tasks}
        assigned_date={progress.assigned_date}
      />
    ));
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);

    if (text.trim() === '') {
      // If the search term is empty, fetch all tasks again
      fetchTasks();
    } else {
      const filteredTasks = Tasks.filter(task => {
        const assignedBy = task.assigned_by?.user_name.toLowerCase() || '';
        const taskName = task.tasks?.task_representation.toLowerCase() || '';

        return (
          assignedBy.includes(text.toLowerCase()) ||
          taskName.includes(text.toLowerCase())
        );
      });

      SetTasks(filteredTasks);
    }
  };

  const handlePressed = async () => {

    navigation.navigate('AddTasks');

  }

  if (isLoading) {
    return <LoadingIndicator color={COLORS.dullBlack} />;
  }

  return (
    <View style={{ flex: 1, marginBottom: 50 }}>
      <View style={styles.headerContainer1}>
        <Text style={[styles.cardTitle, { left: 20, top: 10 }]}> <Icon name="account" size={20} color={COLORS.dullBlack} /> {userName}</Text>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchTasks}
          >
            <View style={styles.refreshBtnContent}>
              <Icon name="refresh" size={20} color={COLORS.dullBlack} />
              <Text style={styles.refreshText}>Refresh</Text>
            </View>
          </TouchableOpacity>
          {userRole !== null && (userRole === 6 || userRole === 7) && (
            <TouchableOpacity
              onPress={handlePressed}
              style={styles.addButton}
            >
              <View style={styles.addBtnContent}>
                <Text style={styles.addBtnText}> + Add Task </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={COLORS.dullBlack}
          value={searchTerm}
          onChangeText={handleSearch}
        />
        <Icon name="magnify" size={25} color={COLORS.dullBlack} />
      </View>
      {renderNoInternetModal()}

      {
        renderProgressData()?.length === 0 ? (

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../assets/nodata.png')} style={{ width: 150, height: 150, }}  resizeMode='contain'/>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.dullBlack }}>No Task Available</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {renderProgressData()}
          </ScrollView>

        )}

    </View>
  );
};

const ProgressCard = ({ assigned_by, assigned_to, tasks, assigned_date, id }: Progress) => {
  const navigation = useNavigation<any>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);
  const taskId = tasks?.id;
  const displayText = tasks?.task_representation.split(" | ").slice(0, 2).join(" | ");
  const[userId, setUserId] = useState<string | null>(null);

  console.log('displayText', displayText);

  const formatDate = (isoDateString: string | number | Date) => {
    const date = new Date(isoDateString);

    // Customize the date format using options
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleString('en-US');
  };

  // Example usage
  const isoDateString = assigned_date;
  console.log(formatDate(isoDateString));

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const username= await AsyncStorage.getItem('user_name');
        if (username !== null) {
          setUserId(JSON.parse(username));
        }

        if (role !== null) {
          setUserRole(parseInt(role));
        }
      } catch (error) {
        console.error(error);
      }
    };

    getUserRole();
  }, []);

  const from_rd = tasks?.from_rd;
  const to_rd = tasks?.to_rd;
  console.log('from_rd', from_rd);
  console.log('to_rd', to_rd);

const fromRdFormatted = `${Math.floor(tasks?.from_rd / 1000)}+${String(tasks?.from_rd % 1000).padStart(3, '0')}`;
const toRdFormatted = `${Math.floor(tasks?.to_rd / 1000)}+${String(tasks?.to_rd % 1000).padStart(3, '0')}`;

  const handlePress = () => {
    navigation.navigate('Progress', {
      id: taskId,
    });
  };

  const handlePressed = () => {
    navigation.navigate('DetailsScreen', {
      id: taskId,
      from_rd: from_rd,
      to_rd: to_rd,
    });
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(API.tasks + `${taskId}/`,
      );

      if (response.status === 204) {
        Alert.alert('Success', 'Task deleted successfully');
        setShowConfirmModal(false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 405) {
        setErrorMessage('You are not allowed to delete this Task.');
        setShowErrorModal(true);
      } else {
        setErrorMessage('An unexpected error occurred.');
        setShowErrorModal(true);
      }
    }
  };

  const handlePresed = async () => {
    setShowConfirmModal(true);
  };

  const handlePres = () => {
    navigation.navigate('UpdateTasks', {
      id: taskId
    });
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.cardTitle}>{displayText}</Text>
        {userRole !== null && (userRole === 6 || userRole === 7) && userId === assigned_by?.user_name && (
          <TouchableOpacity onPress={handlePres}>
            <Icon name="application-edit-outline" size={20} color={COLORS.dullBlack} />
          </TouchableOpacity>
        )}

        {userRole === 6 && (
          <TouchableOpacity onPress={handlePresed}>
            <Icon name="delete-outline" size={25} color="red" />
          </TouchableOpacity>
        )}

        <Modal visible={showConfirmModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.cardText}>Are you sure you want to delete this task?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleDelete} style={styles.confirmButton}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowConfirmModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={[styles.buttonText, { color: COLORS.light }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showErrorModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { alignItems: 'center' }]}>
              <Text style={styles.cardText}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setShowErrorModal(false)} style={styles.closeButton}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.cardText}><Text style={styles.bold}>Assigned By:</Text> {assigned_by?.user_name}</Text>
        <Text style={styles.cardText}><Text style={styles.bold}>Assigned Date:</Text> {formatDate(isoDateString)}</Text>
        <Text style={styles.cardText}><Text style={styles.bold}>Assigned To:</Text> {assigned_to?.user_name}</Text>
        <Text style={styles.cardText}><Text style={styles.bold}>End Date:</Text> {tasks?.planned_end_date} <Text style={styles.cardText}><Text style={styles.bold}>Start Date:</Text> {tasks?.planned_start_date}</Text></Text>
        <Text style={styles.cardText}><Text style={styles.bold}>From:</Text> {fromRdFormatted} <Text style={styles.bold}>To:</Text> {toRdFormatted}</Text>
        <Text style={styles.cardText}><Text style={styles.bold}>Completed Percentage:</Text> {`${Math.floor(Number(tasks?.completed_percent || 0))}%`}</Text>
        <Text style={styles.cardText}><Text style={styles.bold}>Status:</Text> {tasks?.completed}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handlePress} style={styles.button}>
          <Text style={styles.buttonText}>View Progress</Text>
        </TouchableOpacity>
        {(userRole === 8 || userRole === 7) && (
          <TouchableOpacity onPress={handlePressed} style={styles.button}>
            <Text style={styles.buttonText}>Add Progress</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.light,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dullBlack,
    marginBottom: 10,
  },
  cardDetails: {
    marginBottom: 15,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.dullBlack,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.dullBlack,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 0.48,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: COLORS.Clouds,
    fontSize: 14,
    fontWeight: 'bold',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dullBlack,
  },
  headerContainer1: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: COLORS.light,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    borderColor: COLORS.dullBlack,
    color: COLORS.dullBlack,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  searchButton: {
    padding: 8,
    backgroundColor: COLORS.light,
    borderRadius: 8,
  },
  refreshButton: {
    backgroundColor: COLORS.Clouds,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  refreshBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 16,
    color: COLORS.dullBlack,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.dullBlack,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtnText: {
    color: COLORS.Clouds,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  confirmButton: {
    padding: 10,
    backgroundColor: COLORS.dullBlack,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButton: {
    padding: 10,
    backgroundColor: COLORS.dullBlack,
    borderRadius: 5,
    marginTop: 20,

  },

});

export default Home;
