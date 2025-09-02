import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import COLORS from '../Screen/Theme&API/Theme';
import Home from '../Screen/View/Home';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View, Animated, Modal } from 'react-native';
import Offline from '../Screen/View/Offline';
import Icon from 'react-native-vector-icons/Ionicons';
import OnBoardScreen from '../Screen/View/OnBoardScreen';
import Splash from '../Screen/View/Splash';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Progress from '../Screen/View/Progress';
import DetailsScreen from '../Screen/View/DetailsScreen';
import AddTasks from '../Screen/View/AddTasks';
import axios from 'axios';
import API from '../Screen/Theme&API/Config';
import UpdateDetailsScreen from '../Screen/View/UpdateDetailsScreen';
import UpdateTasks from '../Screen/View/UpdateTasks';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ navigation }: any) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('userRole');
            navigation.replace('OnBoardScreen');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    const handlePlusPress = () => {
        setModalVisible(true);
    };



    const scheme = useColorScheme();
    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    tabBarHideOnKeyboard: true,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 10,
                        left: 25,
                        right: 25,
                        elevation: 5,
                        backgroundColor: COLORS.Clouds,
                        borderRadius: 30,
                        height: 55,
                    },
                    tabBarLabelPosition: 'beside-icon',
                    tabBarShowLabel: true,
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: 'transparent',
                    },
                    tabBarActiveTintColor: COLORS.dullBlack,
                    tabBarInactiveTintColor: COLORS.dullBlack,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={Home}
                    options={{
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="home-outline" color={color} size={size} />
                        ),
                        headerRight: () => (
                            <TouchableOpacity onPress={handlePlusPress} activeOpacity={1} style={{ marginRight: 10 }}>
                                <Icon name="log-out-outline" size={30} color={COLORS.dullBlack} />
                            </TouchableOpacity>
                        ),
                        // title: 'Desilting',
                        title:'Desilting',

                    }}
                />
                <Tab.Screen
                    name="Offline"
                    component={Offline}
                    options={{
                        tabBarLabel: 'Offline',
                        tabBarIcon: ({ color, size }) => (
                            <Icon name="cloud-offline-outline" color={color} size={size} />
                        ),
                        headerRight: () => (
                            <TouchableOpacity onPress={handlePlusPress} activeOpacity={1} style={{ marginRight: 10 }}>
                                <Icon name="log-out-outline" size={30} color={COLORS.dullBlack} />
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Tab.Navigator>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                style={styles.modalContainer}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to log out?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    handleLogout();
                                }}
                            >
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </Modal>

        </>

    );
};


const Appnavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Offline" component={Offline} />
                <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="OnBoardScreen" component={OnBoardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
                <Stack.Screen name="Progress" component={Progress} options={{ headerShown: true, title: 'Desilting tasks Progress', }} />
                <Stack.Screen name="DetailsScreen" component={DetailsScreen} options={{ headerShown: true, title: 'Add Progress',}} />
                <Stack.Screen name="AddTasks" component={AddTasks} options={{ headerShown: true, title: 'Add Task', }} />
                <Stack.Screen name="UpdateTasks" component={UpdateTasks} options={{ headerShown: true, title: 'Update Task', }} />
                <Stack.Screen name="UpdateDetailsScreen" component={UpdateDetailsScreen} options={{ headerShown: true, title: 'Update Progress', }} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
export default Appnavigation;

const styles = StyleSheet.create({


    circle: {
        width: 35,
        height: 35,
        borderRadius: 25,
        backgroundColor: '#FF9A28',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        // You can add additional styles here if needed
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    menuIcon: {
        marginRight: 10,
    },
    tabBarLabelStyle: {
        fontSize: 12,
        color: '#FFE5F6',
        left: 20

    },
    tabBarLabelFocused: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 14,
        left: 20
    },




    tabBarStyle: {
        position: 'absolute',
        bottom: 10,
        left: 25,
        right: 25,
        elevation: 5,
        backgroundColor: '#a5cbff',
        borderRadius: 20,
        height: 55,
    },


    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
    },
    modalView: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 20,
        fontSize: 18,
        textAlign: 'center',
        color: 'black',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        margin: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: COLORS.Clouds,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
    },


});



