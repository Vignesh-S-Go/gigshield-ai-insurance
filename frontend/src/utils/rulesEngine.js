/**
 * GigShield Rules Engine
 * 
 * This engine validates claims against standard insurance exclusions.
 * Production Note: This logic protects the 'Loss Ratio' by excluding non-insurable 
 * catastrophic risks such as War, Pandemics, and Terrorism which are typically 
 * outside the scope of standard gig-worker micro-insurance.
 */

export const evaluateClaim = (claimData) => {
  const { trigger, location, eventDate } = claimData;

  const standardExclusions = [
    { type: 'War', code: 'EX-WAR-01', description: 'Loss due to acts of war or military conflict.' },
    { type: 'Civil Unrest', code: 'EX-CIV-03', description: 'Loss due to riots, strikes, or civil disobedience.' },
    { type: 'Pandemic', code: 'EX-PAN-02', description: 'Pandemic Business Interruption or government mandated lockdowns.' },
    { type: 'Terrorism', code: 'EX-TER-04', description: 'Loss resulting from acts of terrorism.' }
  ];

  const exclusion = standardExclusions.find(e => e.type === trigger);

  if (exclusion) {
    return {
      status: 'REJECTED',
      exclusionCode: exclusion.code,
      message: `Exclusion Applied: ${exclusion.code} - ${exclusion.type}`,
      description: exclusion.description,
      passed: false
    };
  }

  return {
    status: 'APPROVED',
    passed: true
  };
};
