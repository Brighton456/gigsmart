// Generate mock apps for the task screen
export const generateMockApps = (count) => {
  const categories = [
    'Finance', 'Social', 'Gaming', 'Education', 'Health', 'Productivity',
    'Travel', 'Shopping', 'Entertainment', 'Food & Drink'
  ];
  
  const prefixes = [
    'Super', 'Ultra', 'Mega', 'Pro', 'Elite', 'Smart', 'Quick', 'Easy',
    'Power', 'Swift', 'Fast', 'Royal', 'Prime', 'Best', 'Top', 'Master'
  ];
  
  const names = [
    'Wallet', 'Connect', 'Chat', 'Play', 'Learn', 'Coach', 'Track', 'Shop',
    'Watch', 'Music', 'Video', 'Photo', 'Notes', 'Calc', 'Map', 'Health',
    'Diet', 'Workout', 'News', 'Weather', 'Alarm', 'ToDo', 'Scanner', 'Reader'
  ];
  
  const publishers = [
    'Tech Solutions', 'Digital Labs', 'App Factory', 'Software Inc.', 'Mobile Devs',
    'Smart Studios', 'CreativeTech', 'Innovative Apps', 'Future Software', 'NextGen Tech'
  ];
  
  // App logo colors
  const logoColors = [
    '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545',
    '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8',
    '#6c757d', '#343a40', '#3b5998', '#1da1f2', '#bd081c',
    '#00b489', '#ea4c89', '#ff5700', '#0077b5', '#00aff0',
    '#ff3300', '#7289da', '#ff6600', '#00c300', '#9146ff'
  ];
  
  // App logos as emoji for simplicity
  const logos = [
    '💰', '🔒', '💬', '🎮', '📚', '🏋️', '📊', '🛒',
    '📺', '🎵', '📹', '📸', '📝', '🧮', '🗺️', '❤️',
    '🥗', '💪', '📰', '🌦️', '⏰', '✅', '📱', '📖',
    '🚗', '✈️', '🏠', '💼', '💻', '📞', '🔍', '🎨'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const prefixIndex = Math.floor(Math.random() * prefixes.length);
    const nameIndex = Math.floor(Math.random() * names.length);
    const publisherIndex = Math.floor(Math.random() * publishers.length);
    const logoIndex = Math.floor(Math.random() * logos.length);
    const colorIndex = Math.floor(Math.random() * logoColors.length);
    
    const appName = `${prefixes[prefixIndex]}${names[nameIndex]}`;
    const rating = (Math.random() * 2 + 3).toFixed(1); // Rating between 3 and 5
    const size = Math.floor(Math.random() * 500) + 10; // Size between 10MB and 510MB
    const downloads = Math.floor(Math.random() * 1000) + 1; // Downloads between 1K and 1000K
    const downloadsFormatted = downloads > 999 ? `${(downloads / 1000).toFixed(1)}K+` : `${downloads}+`;
    
    return {
      id: `app-${index + 1}`,
      name: appName,
      category: categories[categoryIndex],
      publisher: publishers[publisherIndex],
      size: `${size}MB`,
      rating,
      downloads: downloadsFormatted,
      logo: logos[logoIndex],
      color: logoColors[colorIndex],
      installTime: 15000 // 15 seconds installation time
    };
  });
};

// Generate UK-like bank names for wealth fund
export const generateBanks = () => {
  return [
    {
      id: 'bank1',
      name: 'Thames Royal Bank',
      rate: 0.2, // 0.2% daily
      days: 7, // 7-day period
      minAmount: 500,
      description: 'Low risk, short term investment',
      color: '#007bff'
    },
    {
      id: 'bank2',
      name: 'Barcliff Trust Bank',
      rate: 0.5, // 0.5% daily
      days: 14, // 14-day period
      minAmount: 1000,
      description: 'Balanced risk and return profile',
      color: '#28a745'
    },
    {
      id: 'bank3',
      name: 'Mersey Crown Bank',
      rate: 0.8, // 0.8% daily
      days: 21, // 21-day period
      minAmount: 2000,
      description: 'Medium risk, medium term investment',
      color: '#ffc107'
    },
    {
      id: 'bank4',
      name: 'Edinburgh Capital Bank',
      rate: 1.5, // 1.5% daily
      days: 30, // 30-day period
      minAmount: 5000,
      description: 'Higher risk with attractive returns',
      color: '#dc3545'
    },
    {
      id: 'bank5',
      name: 'Windsor Elite Bank',
      rate: 2.0, // 2.0% daily
      days: 45, // 45-day period
      minAmount: 10000,
      description: 'Premium investment option',
      color: '#6f42c1'
    },
    {
      id: 'bank6',
      name: 'Liverpool Sovereign Bank',
      rate: 3.0, // 3.0% daily
      days: 60, // 60-day period
      minAmount: 20000,
      description: 'Maximum return investment package',
      color: '#fd7e14'
    }
  ];
};

// Spin wheel segments
export const spinWheelSegments = [
  { value: 0, label: 'Try Again', color: '#6c757d', probability: 0.55 },
  { value: 500, label: 'KES 500', color: '#28a745', probability: 0.15 },
  { value: 0, label: 'No Luck', color: '#dc3545', probability: 0.10 },
  { value: 1000, label: 'KES 1,000', color: '#007bff', probability: 0.08 },
  { value: 0, label: 'Miss', color: '#ffc107', probability: 0.05 },
  { value: 5000, label: 'KES 5,000', color: '#6f42c1', probability: 0.04 },
  { value: 0, label: 'Free Spin', color: '#20c997', probability: 0.02 },
  { value: 50000, label: 'KES 50,000', color: '#e83e8c', probability: 0.006 },
  { value: 300000, label: 'KES 300,000', color: '#fd7e14', probability: 0.004 }
];

// Helper to format currency
export const formatCurrency = (amount) => {
  return `KES ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Check if withdrawal is allowed in current time window
export const isWithdrawalTimeValid = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();
  
  // Monday to Friday (1-5), 9am to 10pm (9-22)
  return day >= 1 && day <= 5 && hour >= 9 && hour < 22;
};

// Check if it's a weekday (Monday to Friday)
export const isWeekday = () => {
  const day = new Date().getDay();
  return day >= 1 && day <= 5;
};
