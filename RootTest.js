import { Text, View } from 'react-native';

export default function RootTest() {
  console.log("🔥 RootTest component mounted");
  return (
    <View style={{ flex: 1, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 30 }}>ROOT TEST 2</Text>
    </View>
  );
}
