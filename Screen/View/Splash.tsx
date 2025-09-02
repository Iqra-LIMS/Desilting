import { View, Text, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Animatable from 'react-native-animatable';
import COLORS from '../Theme&API/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../Theme&API/Config';

export default function Splash({ navigation }: any) {

    useEffect(() => {
        const checkToken = async () => {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const role = await AsyncStorage.getItem('userRole');
            const name = await AsyncStorage.getItem('user_name');
            console.log(role, 'role');
            console.log(name, 'name');

            if (accessToken) {
                try {
                    const response = await fetch(API.verifyToken, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    if (response.ok) {
                        navigation.replace('MainTabNavigator');
                    }
                    else {
                        await AsyncStorage.removeItem('accessToken');
                        await AsyncStorage.removeItem('refreshToken');
                        await AsyncStorage.removeItem('user_id');
                        await AsyncStorage.removeItem('userRole');
                        navigation.replace('OnBoardScreen');
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    navigation.replace('OnBoardScreen');
                }
            } else {
                navigation.replace('OnBoardScreen');
            }
        };

        const timeout = setTimeout(() => {
            checkToken();
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    // useEffect(() => {
    //     const fetchUsers = async () => {
    //         try {
    //             const accessToken = await AsyncStorage.getItem('accessToken');
    //             const user_id = await AsyncStorage.getItem('user_id');
    //             console.log(user_id, 'userid');
    //             console.log(accessToken, 'accessToken');

    //             if (!accessToken) {
    //                 throw new Error('Access token not found');
    //             }

    //             const response = await axios.get(API.userlist + `${user_id}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`,
    //                     'Content-Type': 'application/json',
    //                 },
    //             });

    //             const userRole = response.data.role;

    //             await AsyncStorage.setItem('userRole', JSON.stringify(userRole));
    //             console.log('User role saved:', userRole);
    //         } catch (error) {
    //             console.error('Error fetching Progress:', error);
    //         }
    //     };

    //     fetchUsers();
    // }, []);

    return (
        <View
            style={{
                backgroundColor: ' white',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <StatusBar translucent backgroundColor={COLORS.tranparent} />

            <Animatable.Image
                style={{
                    height: 180,
                    width: 180,
                }}
                duration={2000}
                animation="fadeInDownBig"
                source={require('../assets/logo.png')} />
            {/* <Text style={{color:COLORS.Raisin}}>Lims Crop Scouting</Text> */}
        </View>
    )
}