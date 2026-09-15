import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SafeIonicons from '../components/SafeIonicons';
import { colors } from '../constants/theme';

// Main screens for bottom tabs
import HomeScreen from '../screens/main/HomeScreen';
import TaskScreen from '../screens/main/TaskScreen';
import UpgradeScreen from '../screens/main/UpgradeScreen';
import TeamScreen from '../screens/main/TeamScreen';
import AccountScreen from '../screens/main/AccountScreen';

// Additional screens for each section
import WealthFundScreen from '../screens/main/WealthFundScreen';
import DepositScreen from '../screens/main/DepositScreen';
import WithdrawalScreen from '../screens/main/WithdrawalScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import SpinWheelScreen from '../screens/main/SpinWheelScreen';
import UpgradeDetailScreen from '../screens/main/UpgradeDetailScreen';
import ReferralScreen from '../screens/main/ReferralScreen';
import PersonalInfoScreen from '../screens/main/PersonalInfoScreen';
import TeamReportsScreen from '../screens/main/TeamReportsScreen';
import RedeemGiftsScreen from '../screens/main/RedeemGiftsScreen';
import HelpBookScreen from '../screens/main/HelpBookScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const sharedStackOptions = {
  headerShown: false,
  animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
  contentStyle: { 
    backgroundColor: 'transparent'
  },
};

const HomeStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="WealthFund" component={WealthFundScreen} />
    <Stack.Screen name="RedeemGifts" component={RedeemGiftsScreen} />
    <Stack.Screen name="HelpBook" component={HelpBookScreen} />
  </Stack.Navigator>
));

const TaskStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="TaskMain" component={TaskScreen} />
  </Stack.Navigator>
));

const UpgradeStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="UpgradeMain" component={UpgradeScreen} />
    <Stack.Screen name="UpgradeDetail" component={UpgradeDetailScreen} />
  </Stack.Navigator>
));

const TeamStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="TeamMain" component={TeamScreen} />
    <Stack.Screen name="Referral" component={ReferralScreen} />
  </Stack.Navigator>
));

const AccountStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="AccountMain" component={AccountScreen} />
    <Stack.Screen name="Recharge" component={DepositScreen} />
    <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="SpinWheel" component={SpinWheelScreen} />
    <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
    <Stack.Screen name="TeamReports" component={TeamReportsScreen} />
  </Stack.Navigator>
));

const MainNavigator = React.memo(() => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.gradientBlue1,
          borderTopColor: colors.gradientBlue1,
          paddingTop: 5,
          paddingBottom: 8,
          height: 60,
          ...(Platform.OS === 'web' && {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          })
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Task') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Upgrade') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <SafeIonicons name={iconName} size={size} color={color} />;
        },
        unmountOnBlur: false,
        lazy: false,
        animationEnabled: false,
        animationTypeForReplace: 'push',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Task" component={TaskStack} />
      <Tab.Screen name="Upgrade" component={UpgradeStack} />
      <Tab.Screen name="Team" component={TeamStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
});

export default MainNavigator;
