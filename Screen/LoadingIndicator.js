import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingIndicator = ({color}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={color||"#FF0000"} />
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default LoadingIndicator;
