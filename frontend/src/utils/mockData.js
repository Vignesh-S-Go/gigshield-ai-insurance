// ============================================
// ZeroClaim Mock Data — Realistic Indian Data
// ============================================

export const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Lucknow'];

export const triggerTypes = ['Rain', 'Heat', 'Flood', 'AQI', 'Curfew'];

export const planTypes = ['Basic', 'Standard', 'Pro'];

export const planDetails = {
  Basic: { premium: 25, maxPayout: 500, color: '#64748b' },
  Standard: { premium: 49, maxPayout: 1200, color: '#6366f1' },
  Pro: { premium: 79, maxPayout: 2000, color: '#f59e0b' },
};

const firstNames = ['Rajesh', 'Amit', 'Priya', 'Suresh', 'Deepak', 'Anita', 'Vikram', 'Neha', 'Sanjay', 'Pooja', 'Manoj', 'Kavita', 'Arjun', 'Sunita', 'Ravi', 'Meena', 'Arun', 'Divya', 'Kiran', 'Lakshmi', 'Venkat', 'Pallavi', 'Ramesh', 'Swati', 'Ganesh', 'Rekha', 'Harish', 'Jyoti', 'Mohan', 'Aarti'];
const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Verma', 'Gupta', 'Nair', 'Reddy', 'Joshi', 'Yadav', 'Mishra', 'Das', 'Iyer', 'Malik', 'Chauhan', 'Deshmukh', 'Patil', 'Bhat', 'Menon', 'Tiwari'];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId() {
  return 'GS-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function generatePhone() {
  return '+91 ' + rand(70000, 99999) + '' + rand(10000, 99999);
}

// Generate Workers
export function generateWorkers(count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const city = pick(cities);
    const plan = pick(planTypes);
    const weeklyEarnings = rand(4000, 6000);
    const riskScore = Math.round((Math.random() * 0.7 + 0.15) * 100) / 100;

    return {
      id: generateId(),
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      phone: generatePhone(),
      city,
      plan,
      weeklyEarnings,
      riskScore,
      totalEarnings: weeklyEarnings * rand(10, 40),
      joinedDate: new Date(2025, rand(0, 11), rand(1, 28)).toISOString(),
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      deliveryPlatform: pick(['Zomato', 'Swiggy']),
      totalDeliveries: rand(200, 5000),
      avgRating: (Math.random() * 1.5 + 3.5).toFixed(1),
      earningsHistory: Array.from({ length: 12 }, (_, m) => ({
        month: new Date(2025, m).toLocaleString('default', { month: 'short' }),
        earnings: rand(15000, 26000),
        deliveries: rand(80, 250),
      })),
      claimsHistory: Array.from({ length: rand(0, 5) }, () => ({
        id: generateId(),
        date: new Date(2025, rand(0, 11), rand(1, 28)).toISOString(),
        trigger: pick(triggerTypes),
        amount: rand(500, 2000),
        status: pick(['Approved', 'Paid', 'Flagged']),
      })),
      riskBreakdown: {
        weatherExposure: Math.random().toFixed(2),
        claimFrequency: Math.random().toFixed(2),
        earningsVolatility: Math.random().toFixed(2),
        zoneRisk: Math.random().toFixed(2),
        fraudIndicator: (Math.random() * 0.3).toFixed(2),
      },
    };
  });
}

// Generate Claims
export function generateClaims(workers, count = 80) {
  return Array.from({ length: count }, () => {
    const worker = pick(workers);
    const trigger = pick(triggerTypes);
    const status = pick(['Approved', 'Flagged', 'Paid', 'Pending']);
    const amount = rand(500, 2000);

    return {
      id: generateId(),
      workerId: worker.id,
      workerName: worker.name,
      workerCity: worker.city,
      triggerType: trigger,
      status,
      payoutAmount: amount,
      date: new Date(2025, rand(6, 11), rand(1, 28)).toISOString(),
      triggerData: {
        temperature: trigger === 'Heat' ? rand(38, 48) + '°C' : null,
        rainfall: trigger === 'Rain' ? rand(15, 80) + 'mm/hr' : null,
        floodLevel: trigger === 'Flood' ? rand(1, 5) + 'ft' : null,
        aqi: trigger === 'AQI' ? rand(300, 500) : null,
        curfewHours: trigger === 'Curfew' ? `${rand(6, 12)} hours` : null,
      },
      validationStatus: status === 'Flagged' ? 'Failed' : 'Passed',
      gpsVerified: Math.random() > 0.15,
      processingTime: rand(2, 45) + ' minutes',
      weatherSource: pick(['IMD', 'OpenWeather', 'AccuWeather']),
    };
  });
}

// Generate Policies
export function generatePolicies(workers) {
  return workers.filter(w => w.status === 'active').map(worker => ({
    id: generateId(),
    workerId: worker.id,
    workerName: worker.name,
    planType: worker.plan,
    premium: planDetails[worker.plan].premium,
    maxPayout: planDetails[worker.plan].maxPayout,
    status: Math.random() > 0.08 ? 'Active' : 'Expired',
    startDate: worker.joinedDate,
    renewalDate: new Date(2026, rand(0, 5), rand(1, 28)).toISOString(),
    autoRenew: Math.random() > 0.3,
    city: worker.city,
  }));
}

// Claims Over Time (for line chart)
export function getClaimsOverTime() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    claims: rand(20, 120),
    payouts: rand(15000, 95000),
  }));
}

// Payouts by Zone (for bar chart)
export function getPayoutsByZone() {
  return cities.slice(0, 6).map(city => ({
    zone: city,
    payouts: rand(50000, 300000),
    claims: rand(20, 100),
  }));
}

// Trigger Distribution (for pie chart)
export function getTriggerDistribution() {
  const colors = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
  return triggerTypes.map((type, i) => ({
    name: type,
    value: rand(10, 40),
    color: colors[i],
  }));
}

// AI Insights
export function getAIInsights() {
  return {
    highRiskZones: [
      { zone: 'Mumbai - Andheri', riskLevel: 0.89, trigger: 'Flood', prediction: 'Heavy flooding expected in 3 days' },
      { zone: 'Delhi - Connaught Place', riskLevel: 0.82, trigger: 'AQI', prediction: 'AQI levels expected to cross 400' },
      { zone: 'Chennai - Marina', riskLevel: 0.76, trigger: 'Rain', prediction: 'Cyclone alert — severe rainfall' },
      { zone: 'Bangalore - Whitefield', riskLevel: 0.71, trigger: 'Flood', prediction: 'Waterlogging risk due to drainage' },
      { zone: 'Jaipur - Walled City', riskLevel: 0.65, trigger: 'Heat', prediction: 'Temperatures may reach 46°C' },
    ],
    predictions: [
      { day: 'Mon', disruptions: rand(3, 12), confidence: rand(72, 95) },
      { day: 'Tue', disruptions: rand(3, 12), confidence: rand(72, 95) },
      { day: 'Wed', disruptions: rand(3, 12), confidence: rand(72, 95) },
      { day: 'Thu', disruptions: rand(3, 12), confidence: rand(72, 95) },
      { day: 'Fri', disruptions: rand(3, 12), confidence: rand(72, 95) },
      { day: 'Sat', disruptions: rand(3, 12), confidence: rand(72, 95) },
      { day: 'Sun', disruptions: rand(3, 12), confidence: rand(72, 95) },
    ],
    fraudAlerts: [
      { id: generateId(), workerName: 'Suspicious Pattern Detected', description: '3 claims in 24hrs from same GPS location', severity: 'high', timestamp: '2 hours ago' },
      { id: generateId(), workerName: 'GPS Mismatch Alert', description: 'Claim location differs from registered zone', severity: 'medium', timestamp: '5 hours ago' },
      { id: generateId(), workerName: 'Unusual Claim Timing', description: 'Claim triggered outside working hours', severity: 'low', timestamp: '1 day ago' },
      { id: generateId(), workerName: 'Duplicate Trigger Alert', description: 'Multiple claims for same weather event', severity: 'high', timestamp: '1 day ago' },
    ],
  };
}

// Zone Risk Data
export function getZoneRiskData() {
  return [
    { zone: 'Mumbai - Andheri West', city: 'Mumbai', riskScore: 0.92, activePolicies: rand(80, 200), recentClaims: rand(10, 30), primaryThreat: 'Flood', coordinates: { lat: 19.1368, lng: 72.8293 } },
    { zone: 'Delhi - Rohini', city: 'Delhi', riskScore: 0.85, activePolicies: rand(80, 200), recentClaims: rand(10, 30), primaryThreat: 'AQI', coordinates: { lat: 28.7495, lng: 77.0566 } },
    { zone: 'Chennai - T. Nagar', city: 'Chennai', riskScore: 0.81, activePolicies: rand(60, 150), recentClaims: rand(8, 25), primaryThreat: 'Rain', coordinates: { lat: 13.0418, lng: 80.2341 } },
    { zone: 'Bangalore - Koramangala', city: 'Bangalore', riskScore: 0.73, activePolicies: rand(60, 150), recentClaims: rand(5, 20), primaryThreat: 'Flood', coordinates: { lat: 12.9352, lng: 77.6245 } },
    { zone: 'Pune - Kothrud', city: 'Pune', riskScore: 0.68, activePolicies: rand(40, 100), recentClaims: rand(5, 15), primaryThreat: 'Rain', coordinates: { lat: 18.5074, lng: 73.8077 } },
    { zone: 'Hyderabad - Gachibowli', city: 'Hyderabad', riskScore: 0.62, activePolicies: rand(50, 120), recentClaims: rand(5, 15), primaryThreat: 'Heat', coordinates: { lat: 17.4401, lng: 78.3489 } },
    { zone: 'Jaipur - Malviya Nagar', city: 'Jaipur', riskScore: 0.79, activePolicies: rand(30, 80), recentClaims: rand(5, 20), primaryThreat: 'Heat', coordinates: { lat: 26.8563, lng: 75.8100 } },
    { zone: 'Kolkata - Salt Lake', city: 'Kolkata', riskScore: 0.71, activePolicies: rand(40, 100), recentClaims: rand(5, 18), primaryThreat: 'Flood', coordinates: { lat: 22.5809, lng: 88.4169 } },
  ];
}

// Dashboard Metrics
export function getDashboardMetrics(workers, claims) {
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const activePolicies = workers.filter(w => w.status === 'active').length;
  const todayClaims = rand(5, 18);
  const totalPayout = claims.reduce((sum, c) => sum + (c.status === 'Paid' ? c.payoutAmount : 0), 0);
  const fraudAlerts = claims.filter(c => c.status === 'Flagged').length;

  return {
    activeWorkers,
    activePolicies,
    todayClaims,
    totalPayout,
    fraudAlerts,
  };
}

// Notifications
export function getNotifications() {
  return [
    { id: 1, title: 'Claim Rejected', message: 'Rejected due to Pandemic Exclusion (Clause 4.2).', type: 'danger', icon: '🚨', time: '2 min ago', read: false },
    { id: 2, title: 'AI Risk Assistant', message: 'Heavy rain detected in Mumbai → risk increased by 20%.', type: 'warning', icon: '☔', time: '15 min ago', read: false },
    { id: 3, title: 'Premium Update', message: 'Worker GS-5N3X premium increased due to high risk behavior.', type: 'info', icon: '💰', time: '1 hr ago', read: false },
    { id: 4, title: 'Fraud Alert', message: 'Suspicious claim activity from Worker GS-9Z2P.', type: 'danger', icon: '🛡️', time: '2 hrs ago', read: false },
    { id: 5, title: 'AI Risk Assistant', message: 'Night deliveries consistently increasing claim probability by 23%.', type: 'warning', icon: '🌙', time: '3 hrs ago', read: false },
    { id: 6, title: 'Fraud Alert', message: 'Multiple claims filed from same user in short time (Velocity Check Failed).', type: 'danger', icon: '🚨', time: '5 hrs ago', read: true },
  ];
}
