/**
 * ZeroClaim Rules Engine
 * 
 * This engine validates claims against standard insurance exclusions.
 * Production Note: This logic protects the 'Loss Ratio' by excluding non-insurable 
 * catastrophic risks such as War, Pandemics, and Terrorism which are typically 
 * outside the scope of standard gig-worker micro-insurance.
 */

export const evaluateClaim = (claimData) => {
  const { trigger, location, eventDate } = claimData;

  const standardExclusions = [
    { type: 'War', code: 'Clause 9.1', message: 'Rejected due to War Exclusion', description: 'Loss due to acts of war or military conflict.' },
    { type: 'Civil Unrest', code: 'Clause 3.4', message: 'Rejected due to Civil Unrest Exclusion', description: 'Loss due to riots, strikes, or civil disobedience.' },
    { type: 'Pandemic', code: 'Clause 4.2', message: 'Rejected due to Pandemic Exclusion', description: 'Pandemic Business Interruption or government mandated lockdowns.' },
    { type: 'Terrorism', code: 'Clause 7.8', message: 'Rejected due to Terrorism Exclusion', description: 'Loss resulting from acts of terrorism.' }
  ];

  const exclusion = standardExclusions.find(e => e.type === trigger);

  if (exclusion) {
    return {
      status: 'REJECTED',
      exclusionCode: exclusion.code,
      message: `${exclusion.message} (${exclusion.code})`,
      description: exclusion.description,
      passed: false
    };
  }

  return {
    status: 'APPROVED',
    passed: true
  };
};
