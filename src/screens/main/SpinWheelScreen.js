import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { colors } from '../../constants/theme';
import SpinWheel from '../../components/SpinWheel';

const SpinWheelScreen = ({ navigation }) => {
  const [showSpin, setShowSpin] = useState(true);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SpinWheel visible={showSpin} onClose={() => { setShowSpin(false); navigation.goBack(); }} />
    </View>
  );
};

export default SpinWheelScreen;
