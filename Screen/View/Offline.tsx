import { View, Text, StyleSheet, Image, ScrollView, Button, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import COLORS from '../Theme&API/Theme';
import { useNavigation } from '@react-navigation/native';
import API from '../Theme&API/Config';

interface TaskOfflineData {
  assigned_to: string;
  id: number;
  tasks: {
    work: string;
    canal: string;
    expected_silt: string;
    estimated_cost: string;
    planned_start_date: string;
    planned_end_date: string;
    phase: string;
    from_rd: number;
    total_length: number;
    to_rd: number;
    completed: string;
  };
}

interface ProgressOfflineData {
  id: number;
  after_latlng: string;
  before_latlng: string;
  from_rd: number;
  image_after: string;
  image_before: string;
  recorded_by: string;
  silt_quantity: number;
  task: number;
  to_rd: number;
  total_length: string;
  date: string;
}

export default function Offline({ navigation }: any) {
  const [TaskofflineData, setTaskOfflineData] = useState<TaskOfflineData[]>([]);
  const [ProgressofflineData, setProgressOfflineData] = useState<ProgressOfflineData[]>([]);

  const [loading, setLoading] = useState(false);

  // Fetch offline data from AsyncStorage
  const loadOfflineData = async () => {
    setLoading(true);
    try {
      const taskData = await AsyncStorage.getItem('offlineRequestData');
      const progressData = await AsyncStorage.getItem('offlineForms');

      if (taskData) {
        const parsedTaskData = JSON.parse(taskData);
        setTaskOfflineData(Array.isArray(parsedTaskData) ? parsedTaskData : [parsedTaskData]);
      }

      if (progressData) {
        const parsedProgressData = JSON.parse(progressData);
        setProgressOfflineData(parsedProgressData);
      }

      console.log('Loaded offline task and progress data');
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
    finally {
      setLoading(false);
    }
  };

  // Fetch offline data initially
  useEffect(() => {
    loadOfflineData();
  }, []);

  // useEffect(() => {
  //   const fetchOfflineData = async () => {
  //     try {
  //       const data = await AsyncStorage.getItem('offlineRequestData');
  //       if (data) {
  //         const parsedData = JSON.parse(data);
  //         setTaskOfflineData(Array.isArray(parsedData) ? parsedData : [parsedData]);
  //         // console.log('Offline data:', parsedData);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching offline data:', error);
  //     }
  //   };

  //   fetchOfflineData();
  // }, []);


  const renderTaskOfflineData = () => {
    return TaskofflineData.map((task, index) => (
      <TaskOfflineCard
        key={index}
        id={task.id}
        assigned_to={task.assigned_to}
        tasks={task.tasks}
        setTaskOfflineData={setTaskOfflineData}
      />
    ));
  };

  const renderProgressOfflineData = () => {
    return ProgressofflineData.map((progress, index) => (
      <ProgressOfflineCard
        key={index}
        id={progress.id}
        from_rd={progress.from_rd}
        to_rd={progress.to_rd}
        image_after={progress.image_after}
        image_before={progress.image_before}
        task={progress.task}
        date={progress.date}
        total_length={progress.total_length}
        after_latlng={progress.after_latlng}
        before_latlng={progress.before_latlng}
        silt_quantity={progress.silt_quantity}
        recorded_by={progress.recorded_by}
        setProgressOfflineData={setProgressOfflineData}
      />
    ));
  };


  if (TaskofflineData.length === 0 && ProgressofflineData.length === 0) {
    return (
      <View style={styles.container}>

        <TouchableOpacity onPress={loadOfflineData} style={[styles.button, { backgroundColor: COLORS.dullBlack }]}
          disabled={loading} // Optionally disable the button while loading
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.light} />
          ) : (
            <Text style={[styles.buttonText, { color: COLORS.light }]}>Load Offline Data</Text>
          )}
        </TouchableOpacity>

        <Image
          source={require('../assets/nodata.png')}
          style={{ width: 360, height: 360, alignSelf: 'center' }}
          resizeMode="contain"
        />


      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginBottom: 55 }}>
      <View style={{ justifyContent: 'space-between', alignItems: 'flex-end', right: 10 }}>
      <TouchableOpacity onPress={loadOfflineData} style={[styles.button, { backgroundColor: COLORS.dullBlack }]}
        disabled={loading} // Optionally disable the button while loading
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.light} />
        ) : (
          <Text style={[styles.buttonText, { color: COLORS.light }]}>Reload Offline Data</Text>
        )}
      </TouchableOpacity>
      </View>
      

      <ScrollView contentContainerStyle={{ padding: 5 }}>
        {/* <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Offline Data</Text> */}
        {renderProgressOfflineData()}
        {renderTaskOfflineData()}
      </ScrollView>
    </View>

  );
}



const TaskOfflineCard = ({ assigned_to, tasks, setTaskOfflineData, id }: { assigned_to: string; tasks: any; setTaskOfflineData: React.Dispatch<React.SetStateAction<TaskOfflineData[]>>; id: number }) => {
  const navigation = useNavigation<any>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);


  const uploadOfflineTasks = async () => {
    setLoading(true);
    const taskObject = {
      work: tasks.work,
      canal: tasks.canal,
      phase: tasks.phase,
      from_rd: tasks.from_rd,
      to_rd: tasks.to_rd,
      total_length: tasks.total_length,
      completed: tasks.completed,
      planned_start_date: tasks.planned_start_date,
      planned_end_date: tasks.planned_end_date,
      expected_silt: tasks.expected_silt,
      estimated_cost: tasks.estimated_cost,
    };
    const requestBody = { assigned_to, tasks: taskObject };
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      Alert.alert('Error', 'Access token not found');
      return;
    }

    try {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        const response = await fetch(API.tasksAssignment, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          Alert.alert('Success', 'Task uploaded successfully.');

          // Fetch current offline data, filter out the uploaded task, and update storage and state
          const offlineData = await AsyncStorage.getItem('offlineRequestData');
          if (offlineData) {
            const parsedData = JSON.parse(offlineData);

            // Filter out the successfully uploaded task
            const updatedData = parsedData.filter((item: { id: number }) => item.id !== id);

            await AsyncStorage.setItem('offlineRequestData', JSON.stringify(updatedData));
            setTaskOfflineData(updatedData); // Update local state to remove the uploaded task
          }
        } else {
          Alert.alert('Upload Failed', data.message || 'Error uploading task.');
        }
      } else {
        Alert.alert('No Internet', 'Please connect to the internet to upload tasks.');
      }
    } catch (error) {
      console.error('Error uploading task:', error);
      Alert.alert('Error', 'An unexpected error occurred while uploading.');
    }
    finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };
  const from_rd = tasks.from_rd;
  const to_rd = tasks.to_rd;

  const fromRdFormatted = `${Math.floor(from_rd / 1000)}+${from_rd % 1000}`;
  const toRdFormatted = `${Math.floor(to_rd / 1000)}+${to_rd % 1000}`;

  return (
    <View style={styles.card}>
      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{tasks.work}</Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Canal:</Text> {tasks.canal || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Phase:</Text> {tasks.phase || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>Estimated Cost:</Text> {tasks.estimated_cost || 'No Data Available'}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.bold}>From:</Text> {fromRdFormatted || 'No Data Available'} -
          <Text style={styles.bold}>To:</Text> {toRdFormatted || 'No Data Available'}
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => setShowConfirmModal(true)} style={[styles.button, { backgroundColor: COLORS.dullBlack }]}>
          <Text style={[styles.buttonText, { color: COLORS.light }]}>Upload Task</Text>
        </TouchableOpacity>
        <Modal visible={showConfirmModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>Confirm upload of this task?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={uploadOfflineTasks} style={styles.confirmButton}
                  disabled={loading} // Optionally disable the button while loading
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.light} />
                  ) : (
                    <Text style={[styles.buttonText, { color: COLORS.light }]}>Confirm</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.cancelButton}>
                  <Text style={[styles.buttonText, { color: COLORS.light }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const ProgressOfflineCard = ({
  id,
  from_rd,
  to_rd,
  image_after,
  image_before,
  task,
  setProgressOfflineData,
  date,
  total_length,
  after_latlng,
  before_latlng,
  silt_quantity,
  recorded_by,
}: {
  id: number;
  from_rd: number;
  to_rd: number;
  image_after: string;
  image_before: string;
  task: number;
  date: string;
  total_length: string;
  after_latlng: string;
  before_latlng: string;
  silt_quantity: number;
  recorded_by: string;
  setProgressOfflineData: React.Dispatch<React.SetStateAction<any>>;
}) => {



  const navigation = useNavigation<any>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadOfflineProgressHelper = async () => {
    setLoading(true); // Start loading
    const formData = new FormData();

    formData.append('date', new Date().toISOString().split('T')[0]);
    formData.append('total_length', total_length);
    formData.append('recorded_by', recorded_by);
    formData.append('to_rd', to_rd);
    formData.append('from_rd', from_rd);
    formData.append('task', task);
    formData.append('silt_quantity', silt_quantity);
    formData.append('before_latlng', before_latlng);
    formData.append('after_latlng', after_latlng);

    if (image_before) {
      const filenameBefore = image_before.substring(image_before.lastIndexOf('/') + 1);
      const matchBefore = /\.(\w+)$/.exec(filenameBefore);
      const typeBefore = matchBefore ? `image/${matchBefore[1]}` : 'image';

      formData.append('image_before', {
        uri: image_before,
        name: filenameBefore,
        type: typeBefore,
      });
    }

    // Attach after image
    if (image_after) {
      const filenameAfter = image_after.substring(image_after.lastIndexOf('/') + 1);
      const matchAfter = /\.(\w+)$/.exec(filenameAfter);
      const typeAfter = matchAfter ? `image/${matchAfter[1]}` : 'image';

      formData.append('image_after', {
        uri: image_after,
        name: filenameAfter,
        type: typeAfter,
      });
    }



    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      Alert.alert('Error', 'Access token not found');
      return;
    }

    try {
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        console.log("\n formData : ", formData, "\n")

        const response = await fetch(API.progress, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        console.log('response', formData);

        if (response.ok) {
          Alert.alert('Success', 'Progress uploaded successfully.');

          // Update offline storage after successful upload
          const offlineData = await AsyncStorage.getItem('offlineForms');
          if (offlineData) {
            const parsedData = JSON.parse(offlineData);
            const updatedData = parsedData.filter((item: { id: number }) => item.id !== id);
            await AsyncStorage.setItem('offlineForms', JSON.stringify(updatedData));
            setProgressOfflineData(updatedData);
          }
        } else {
          const data = await response.json();
          console.error('Error uploading progress:', data);
          Alert.alert('Upload Failed', data.message || 'Error uploading progress.');
        }
      } else {
        Alert.alert('No Internet', 'Please connect to the internet to upload progress.');
      }
    } catch (error) {
      console.error('Error uploading progress:', error);
      Alert.alert('Error', 'An unexpected error occurred while uploading.');
    }
    finally {
      setLoading(false);
      setShowConfirmModal(false);
    }

  };


  const fromRdFormatted = `${Math.floor(from_rd / 1000)}+${from_rd % 1000}`;
  const toRdFormatted = `${Math.floor(to_rd / 1000)}+${to_rd % 1000}`;

  return (
    <View style={styles.card}>
      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{task}</Text>

        <Text style={styles.cardText}>
          <Text style={styles.bold}>Silt Quantity:</Text> {silt_quantity || 'No Data Available'}     
          <Text style={styles.bold}>     Date:</Text> {date || 'No Data Available'}
        </Text>

        <Text style={styles.cardText}>
          <Text style={styles.bold}>Length:</Text> {total_length || 'No Data Available'} 
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {image_before ? (
            <Image source={{ uri: image_before }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No Before Image Available</Text>
          )}

          {/* Display After Image */}
          {image_after ? (
            <Image source={{ uri: image_after }} style={styles.image} />
          ) : (
            <Text style={styles.noImageText}>No After Image Available</Text>
          )}
        </View>

        <Text style={styles.cardText}>
          <Text style={styles.bold}>From:</Text> {fromRdFormatted || 'No Data Available'}       -
          <Text style={styles.bold}>     To:</Text> {toRdFormatted || 'No Data Available'}
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => setShowConfirmModal(true)} style={[styles.button, { backgroundColor: COLORS.dullBlack }]}>
          <Text style={[styles.buttonText, { color: COLORS.light }]}>Upload Progress</Text>
        </TouchableOpacity>
        <Modal visible={showConfirmModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>Confirm upload of this progress?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={uploadOfflineProgressHelper}
                  style={styles.confirmButton}
                  disabled={loading} // Optionally disable the button while loading
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.light} />
                  ) : (
                    <Text style={[styles.buttonText, { color: COLORS.light }]}>Confirm</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.cancelButton}>
                  <Text style={[styles.buttonText, { color: COLORS.light }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: { width: '45%', height: 100, marginVertical: 8, borderRadius: 8 }, // Adjust dimensions as needed
  noImageText: { fontSize: 14, color: 'gray', textAlign: 'center', marginVertical: 8 },
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
    fontSize: 20,
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
    alignItems: 'center',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
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


