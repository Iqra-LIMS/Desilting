import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Button } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import API from '../Theme&API/Config';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import SQLite from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native-animatable';
import COLORS from '../Theme&API/Theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import LoadingIndicator from '../LoadingIndicator';

interface Progress {
  id: number;
  from_rd: number;
  image_after: string;
  approved_by_str: string;
  recorded_by: number;
  recorded_by_str: string;
  to_rd: number,
  status: boolean;
  task: {
    id: number,
    from_rd: number,
    to_rd: number,
    task_representation: string,
    completed_percent: string,
    canal: {
      name: string
      zone: {
        name: string
      }
      circle: {
        circle_name: string
      }
      division: {
        div_name: string
      }
    },
  }
}

const db = SQLite.openDatabase({ name: 'progress_db', location: 'default' });


const Progress = ({ route }: any) => {
  const id = route.params.id;

  const [Progress, SetProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [noInternetModalVisible, setNoInternetModalVisible] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          fetchFromAPI();
        } else {
          fetchFromSQLite();
          setNoInternetModalVisible(true);
        }
      });
    };

    const fetchFromAPI = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Access token not found');
        }

        const response = await axios.get(API.progress + `?task=${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const progressData = response.data;

        //console.log(progressData);
        SetProgress(progressData);
        saveDataToSQLite(progressData, id);
        setLoading(false);
      } catch (error) {
        //.error('Error fetching Progress from API:', error);
        fetchFromSQLite();
        setNoInternetModalVisible(true);
      }
    };
    const fetchFromSQLite = async () => {
      (await db).transaction(tx => {
        tx.executeSql(

          'SELECT * FROM progress WHERE task_id = ?',
          [id],
          (tx, results) => {
            let len = results.rows.length;
            console.log('Number of records fetched from SQLite:', len);

            if (len > 0) {
              let progressData: Progress[] = [];
              for (let i = 0; i < len; i++) {
                const row = results.rows.item(i);

                // Parse JSON fields if necessary
                const task = row.task ? JSON.parse(row.task) : {};

                // Check if fields are null, and handle accordingly
                const approvedByStr = row.approved_by_str !== null ? row.approved_by_str : 'Not Available';

                progressData.push({
                  ...row,
                  task: {
                    task_representation: task.task_representation || 'N/A',
                    completed_percent: task.completed_percent || 0,
                    canal: {
                      name: task.canal?.name || 'Unknown',
                      zone: { name: task.canal?.zone?.name || 'Unknown' },
                      circle: { circle_name: task.canal?.circle?.circle_name || 'Unknown' },
                      division: { div_name: task.canal?.division?.div_name || 'Unknown' },
                    }
                  }
                });
              }
              SetProgress(progressData);
            } else {
              console.log('No records found in SQLite for this task ID.');
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

    const saveDataToSQLite = async (data: Progress[], taskId: number) => {
      (await db).transaction(tx => {
        // tx.executeSql(
        //   'DROP TABLE IF EXISTS progress;',
        //   [],
        //   () => console.log("Table 'progress' dropped successfully"),
        //   error => console.error("Error dropping 'progress' table:", error)
        // );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY NOT NULL,
            from_rd INTEGER,
            to_rd INTEGER,
            recorded_by_str TEXT,
            approved_by_str TEXT,
            recorded_by INTEGER,
            image_after TEXT,
            task_id INTEGER,
            task TEXT
          );`,
          [],
          () => console.log("Table 'progress' created successfully"),
          error => console.error("Error creating 'progress' table:", error)
        );

        // Delete existing records with the same task_id if required
        // tx.executeSql(
        //   `DELETE FROM progress WHERE task_id = ?`,
        //   [taskId],
        //   () => console.log(`Existing records with task_id ${taskId} deleted`),
        //   error => console.error("Error deleting records:", error)
        // );


        data.forEach(progress => {
          const task = typeof progress.task === 'object' ? JSON.stringify(progress.task) : progress.task;

          tx.executeSql(
            `INSERT OR REPLACE INTO progress (
              id, from_rd, to_rd, recorded_by_str,recorded_by, approved_by_str, image_after, task_id, task
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              progress.id,
              progress.from_rd,
              progress.to_rd,
              progress.recorded_by_str,
              progress.recorded_by,
              progress.approved_by_str,
              progress.image_after,
              taskId,
              task
            ],
            () => console.log("Data inserted successfully"),
            error => console.error("Error inserting data:", error)
          );
        });
      });
    };

    fetchProgress();
  }, [id]);

  const renderProgressData = () => {
    return Progress.map((progress, index) => (
      <ProgressCard
        key={index}
        id={progress.id}
        from_rd={progress.from_rd}
        to_rd={progress.to_rd}
        status={progress.status}
        recorded_by_str={progress.recorded_by_str}
        recorded_by={progress.recorded_by}
        approved_by_str={progress.approved_by_str}
        image_after={progress.image_after}
        task={progress.task}
      />
    ));
  };

  if (loading) {
    return <LoadingIndicator color={COLORS.dullBlack} />;
  }

  if (Progress.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Image source={require('../assets/nodata.png')} style={{ width: 150, height: 150, }}  resizeMode='contain'/>
        <Text style={styles.noDataText}>No data available against this task</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      <ScrollView>
        {renderProgressData()}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={noInternetModalVisible}
        onRequestClose={() => {
          setNoInternetModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer1}>
            <Text style={styles.modalTitle}>No Internet Connection</Text>
            <Text style={styles.modalMessage}>
              You are currently offline.
            </Text>
            <Button
              title="Close"
              onPress={() => setNoInternetModalVisible(false)}
              color={COLORS.dullBlack}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
};


const ProgressCard = ({ to_rd, from_rd, image_after, task, id, status, recorded_by_str, approved_by_str, recorded_by }: Progress) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [istatus, setStatus] = useState<boolean | null>(status);
  const navigation = useNavigation<any>();

  const progressId = id;
  //console.log(progressId, 'progressId')
  //console.log(status, 'status')
  // const fromRdFormatted = `${Math.floor(from_rd / 1000)}+${from_rd % 1000}`;
  // const toRdFormatted = `${Math.floor(to_rd / 1000)}+${to_rd % 1000}`;

const fromRdFormatted = `${Math.floor(from_rd / 1000)}+${String(from_rd % 1000).padStart(3, '0')}`;
const toRdFormatted = `${Math.floor(to_rd / 1000)}+${String(to_rd % 1000).padStart(3, '0')}`;

  const displayText = task?.task_representation.split(" | ").slice(0, 2).join(" | ");
  console.log('displayText', displayText);
  const taskId = task.id
  const taskFromRD = task?.from_rd;
  const taskToRD = task?.to_rd;
  console.log('from_rd', from_rd);
  console.log('to_rd', to_rd);
  console.log("official task from RD in progress card", taskFromRD)
  console.log("official task to RD in progress card", taskToRD)

  const handlePress = () => {
    navigation.navigate('UpdateDetailsScreen', {
      progressId: progressId,
      taskId: taskId,
      taskFromRD: taskFromRD,
      taskToRD: taskToRD,
    });
  };


  const handleDelete = async () => {
    try {
      const response = await axios.delete(API.progress + `${progressId}/`,
      );

      if (response.status === 204) {
        Alert.alert('Success', 'Progress deleted successfully');
        setShowConfirmModal(false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 405) {
        setErrorMessage('You are not allowed to delete this progress.');
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

  const [userRole, setUserRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);



  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userId= await AsyncStorage.getItem('user_id');
        const role = await AsyncStorage.getItem('userRole');
        if (role !== null) {
          setUserRole(parseInt(role));
        }
        if (userId !== null) {
          setUserId(JSON.parse(userId));
          console.log('userID in add tasks', userId);
        }
        
      } catch (error) {
        console.error(error);
      }
    };
    getUserRole();
  }, []);


  const handleApprove = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(API.approve + `${progressId}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response);
      if (response.ok) {
        Alert.alert('Success', 'Progress approved successfully');
        setStatus(true); // Update istatus to true
      } else {
        Alert.alert('Error', 'Failed to approve');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve');
    }
  };

  const handleDisapprove = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(API.rejected + `${progressId}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response, 'response');
      if (response.ok) {
        Alert.alert('Success', 'Progress disapproved successfully');
        setStatus(false); // Update istatus to false
      } else {
        Alert.alert('Error', 'Failed to disapprove');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to disapprove');
    }
  };

  const handlePres = () => {
    if (istatus) {  // If istatus is true
      handleDisapprove();
    } else {  // If istatus is false
      handleApprove();
    }
  };


  return (
    <View style={styles.card}>
      {image_after ? (
        <Image
          source={{ uri: image_after }}
          style={{ height: 140, width: '100%', borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{displayText || 'No Data Available'}</Text>

        {/* <Text style={styles.cardText}>
          <Text style={styles.bold}> Completed Percentage: </Text>
          {task?.completed_percent || '0%'}
        </Text> */}

        <Text style={styles.cardText}>
          <Text style={styles.bold}>Canal: </Text>
          {task?.canal?.name || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Division: </Text>
          {task?.canal?.division?.div_name || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Circle: </Text>
          {task?.canal?.circle?.circle_name || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Zone: </Text>
          {task?.canal?.zone?.name || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>From: </Text>
          {fromRdFormatted || 'No Data Available'}{' '}
          <Text style={styles.cardText}>
            <Text style={styles.bold}>To: </Text>
            {toRdFormatted || 'No Data Available'}
          </Text>
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Recorded by: </Text>
          {recorded_by_str || 'No data available'}
        </Text>
        {status && (
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Approve by: </Text>
            {approved_by_str || 'Not Approved yet'}
          </Text>
        )}
      </View>
      <View style={styles.buttonRow}>
        {(userRole === 8 || userRole === 7) && userId === recorded_by && (
          <TouchableOpacity onPress={handlePress} style={styles.button}>
            <Text style={styles.buttonText}>Update Progress</Text>
          </TouchableOpacity>
        )}

        {userRole === 6 && (
          <TouchableOpacity onPress={handlePres} style={styles.button}>
            <Text style={styles.buttonText}>
              {istatus ? 'Click To Disapprove Progress' : 'Click To Approve Progress'}
            </Text>
          </TouchableOpacity>
        )}

        {(userRole === 8 || userRole === 7) && userId === recorded_by  && (

          <TouchableOpacity onPress={handlePresed} style={[styles.button, { backgroundColor: COLORS.red }]}>
            <Text style={[styles.buttonText, { color: COLORS.light }]}>Delete Progress</Text>
          </TouchableOpacity>

        )}

        <Modal visible={showConfirmModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.cardText}>Are you sure you want to delete this progress?</Text>
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

        {/* Error Modal */}
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
    elevation: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: COLORS.dullBlack,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dullBlack,
    marginBottom: 10,
  },
  cardDetails: {
    marginBottom: 15,
    textAlign: 'justify',
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
    backgroundColor: COLORS.light, // Subtle background color
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dullBlack, // Line to separate header
  },

  addButton: {
    backgroundColor: COLORS.dullBlack, // Darker background for add button
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25, // Rounded corners
    elevation: 5, // More shadow for this button
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
    textTransform: 'uppercase', // Make the text uppercase for a cleaner look
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

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer1: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.dullBlack,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: COLORS.dullBlack,
    textAlign: 'center',
  },

});

export default Progress;
