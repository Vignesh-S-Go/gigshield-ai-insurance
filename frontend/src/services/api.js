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
    const basePremiums = { Basic: 25, Standard: 49, Pro: 79 };
    const base = basePremiums[plan] || 25;

    let zoneFactor = 1.0;
    const cityUpper = city?.toUpperCase();
    if (cityUpper === 'MUMBAI' || cityUpper === 'DELHI') {
      zoneFactor = 1.2;
    } else if (cityUpper === 'BANGALORE') {
      zoneFactor = 1.1;
    }

    const premium = (base * zoneFactor) + (riskScore * 0.15);

    return {
      success: true,
      premium: Math.round(premium * 100) / 100,
      breakdown: {
        basePremium: base,
        cityAdjustment: `${((zoneFactor - 1) * 100).toFixed(0)}%`,
        riskAdjustment: `${(riskScore * 0.15).toFixed(2)} pts`,
        earningsAdjustment: '0%',
      },
      aiConfidence: (Math.random() * 10 + 90).toFixed(1) + '%',
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
