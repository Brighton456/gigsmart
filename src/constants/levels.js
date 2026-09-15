// Level definitions based on the requirements
export const levels = [
  {
    id: 0,
    name: 'Recruit',
    cost: 0,
    tasks: 0,
    earningsPerTask: 0,
    dailyEarnings: 0,
    annualEarnings: 0,
    color: '#6c757d', // Gray
    multiplier: 1.0,
    description: 'Starting level for all new users. No task earnings.',
    icon: 'person-outline',
    nextLevelId: 1
  },
  {
    id: 1,
    name: 'Intern',
    cost: 800,
    tasks: 5,
    earningsPerTask: 10,
    dailyEarnings: 50, // 5 tasks x 10 KES
    annualEarnings: 18250, // 50 x 365
    color: '#28a745', // Green
    multiplier: 1.2,
    description: 'Begin your journey with 5 daily tasks.',
    icon: 'briefcase-outline',
    nextLevelId: 2
  },
  {
    id: 2,
    name: 'J1',
    cost: 2000,
    tasks: 10,
    earningsPerTask: 10,
    dailyEarnings: 100, // 10 tasks x 10 KES
    annualEarnings: 36500, // 100 x 365
    color: '#007bff', // Blue
    multiplier: 1.5,
    description: 'Doubled tasks for higher daily earnings.',
    icon: 'trending-up-outline',
    nextLevelId: 3
  },
  {
    id: 3,
    name: 'J2',
    cost: 6000,
    tasks: 25,
    earningsPerTask: 10,
    dailyEarnings: 250, // 25 tasks x 10 KES
    annualEarnings: 91250, // 250 x 365
    color: '#6f42c1', // Purple
    multiplier: 2.0,
    description: 'Significant increase in daily task limit.',
    icon: 'star-outline',
    nextLevelId: 4
  },
  {
    id: 4,
    name: 'J3',
    cost: 25000,
    tasks: 89,
    earningsPerTask: 10,
    dailyEarnings: 890, // 89 tasks x 10 KES
    annualEarnings: 324850, // 890 x 365
    color: '#fd7e14', // Orange
    multiplier: 2.5,
    description: 'Professional level with high daily earnings.',
    icon: 'star-outline',
    nextLevelId: 5
  },
  {
    id: 5,
    name: 'J4',
    cost: 64000,
    tasks: 200,
    earningsPerTask: 10,
    dailyEarnings: 2000, // 200 tasks x 10 KES
    annualEarnings: 730000, // 2000 x 365
    color: '#dc3545', // Red
    multiplier: 3.0,
    description: 'Expert level with massive task capacity.',
    icon: 'flame-outline',
    nextLevelId: 6
  },
  {
    id: 6,
    name: 'J5',
    cost: 128000,
    tasks: 640,
    earningsPerTask: 10,
    dailyEarnings: 6400, // 640 tasks x 10 KES
    annualEarnings: 2336000, // 6400 x 365
    color: '#e83e8c', // Pink
    multiplier: 4.0,
    description: 'Master level with extraordinary earning potential.',
    icon: 'trophy-outline',
    nextLevelId: 7
  },
  {
    id: 7,
    name: 'J6',
    cost: 512000,
    tasks: 2500,
    earningsPerTask: 10,
    dailyEarnings: 25000, // 2500 tasks x 10 KES
    annualEarnings: 9125000, // 25000 x 365
    color: '#ffc107', // Gold
    multiplier: 5.0,
    description: 'Ultimate level with maximum earning capacity.',
    icon: 'trophy-outline',
    nextLevelId: null
  },
];

// Withdrawal amounts as specified in requirements
export const withdrawalAmounts = [70, 470, 1750, 3970, 49970];

// Withdrawal fee percentage
export const withdrawalFeePercentage = 0.1; // 10%

// Withdrawal time window
export const withdrawalTimeWindow = {
  startHour: 9, // 9 AM
  endHour: 22, // 10 PM
  validDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
};

// Task time window (any time Monday to Friday)
export const taskTimeWindow = {
  validDays: [1, 2, 3, 4, 5], // Monday to Friday
};
