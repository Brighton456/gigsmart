const fs = require('fs');
const path = require('path');

// List of files that need Platform import
const files = [
  'src/screens/main/DepositScreen.js',
  'src/screens/main/HistoryScreen.js', 
  'src/screens/main/HomeScreen.js',
  'src/screens/main/ReferralScreen.js',
  'src/screens/main/SpinWheelScreen.js',
  'src/screens/main/UpgradeDetailScreen.js',
  'src/screens/main/WealthFundScreen.js',
  'src/screens/main/WithdrawalScreen.js'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if Platform is already imported
    if (content.includes('Platform.OS') && !content.includes('Platform,') && !content.includes('Platform }')) {
      // Find the React Native import and add Platform
      content = content.replace(
        /} from 'react-native';/,
        ',\n  Platform\n} from \'react-native\';'
      );
      
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed Platform import in ${filePath}`);
    }
  }
});

console.log('Platform imports fixed!');
