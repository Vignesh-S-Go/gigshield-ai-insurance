// Mock API service — simulates network requests with delays

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
  // Auth
  sendOTP: async (phone) => {
    await delay(800);
    return { success: true, message: 'OTP sent successfully' };
  },

  verifyOTP: async (phone, otp) => {
    await delay(1000);
    if (otp === '123456' || otp.length === 6) {
      return { success: true, token: 'mock-jwt-token-' + Date.now() };
    }
    return { success: false, message: 'Invalid OTP' };
  },

  // Workers
  fetchWorkers: async () => {
    await delay(600);
    return { success: true };
  },

  // Claims
  fetchClaims: async () => {
    await delay(500);
    return { success: true };
  },

  // Premium Calculation (AI Mock)
  calculatePremium: async ({ plan, city, riskScore, weeklyEarnings }) => {
    await delay(1500);
    const basePremiums = { Basic: 99, Standard: 199, Pro: 349 };
    const base = basePremiums[plan];
    const cityMultiplier = {
      Mumbai: 1.3, Delhi: 1.25, Chennai: 1.2, Bangalore: 1.15,
      Kolkata: 1.1, Pune: 1.05, Hyderabad: 1.0, Jaipur: 1.1,
      Ahmedabad: 1.0, Lucknow: 0.95,
    }[city] || 1.0;
    const riskMultiplier = 1 + (riskScore * 0.5);
    const earningsMultiplier = weeklyEarnings > 5000 ? 1.1 : 1.0;
    
    const premium = Math.round(base * cityMultiplier * riskMultiplier * earningsMultiplier);
    
    return {
      success: true,
      premium,
      breakdown: {
        basePremium: base,
        cityAdjustment: `${((cityMultiplier - 1) * 100).toFixed(0)}%`,
        riskAdjustment: `${((riskMultiplier - 1) * 100).toFixed(0)}%`,
        earningsAdjustment: `${((earningsMultiplier - 1) * 100).toFixed(0)}%`,
      },
      aiConfidence: (Math.random() * 15 + 85).toFixed(1) + '%',
    };
  },

  // Trigger Payout
  processPayout: async (claimId, amount) => {
    await delay(2000);
    return {
      success: true,
      transactionId: 'TXN' + Date.now(),
      upiRef: 'UPI' + Math.random().toString(36).substr(2, 10).toUpperCase(),
      amount,
      timestamp: new Date().toISOString(),
    };
  },

  // Weather Data
  getWeatherAlerts: async (city) => {
    await delay(700);
    return {
      success: true,
      alerts: [
        { type: 'Rain', severity: 'High', message: 'Heavy rainfall expected' },
        { type: 'Heat', severity: 'Medium', message: 'Temperature above 40°C' },
      ],
    };
  },

  // Export CSV
  exportData: async (dataType) => {
    await delay(1000);
    return { success: true, downloadUrl: '#' };
  },
};

export default api;
