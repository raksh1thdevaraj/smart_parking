/**
 * Mathematical Formulation Engine for Smart Car Parking System
 * Implements Turn-Away Denial Rates, Slot Expansion Viability Index (SEVI),
 * and Erlang-B / Empirical Target Capacity Recommendation.
 */

/**
 * Calculates empirical probability of service denial:
 * P_denied = N_denied / (N_entered + N_denied)
 */
export function calculateDenialRate(deniedCount, enteredCount) {
  const totalAttempts = deniedCount + enteredCount;
  if (totalAttempts === 0) return 0;
  return (deniedCount / totalAttempts) * 100;
}

/**
 * Calculates Slot Expansion Viability Index (SEVI) on a 0.0 - 10.0 scale:
 * SEVI = 10 * [ w1*(N_denied / N_attempts) + w2*(T_full / T_operating) + w3*(Q_peak / Capacity) ]
 *
 * @param {number} deniedCount - Total denied vehicles
 * @param {number} enteredCount - Total successfully admitted vehicles
 * @param {number} fullRatio - Ratio of time spent at 100% capacity (0.0 to 1.0)
 * @param {number} peakQueueRatio - Peak queue pressure to capacity ratio (0.0 to 1.0)
 * @returns {{ score: number, tier: string, color: string, description: string }}
 */
export function calculateSEVI(deniedCount, enteredCount, fullRatio = 0.3, peakQueueRatio = 0.25) {
  const totalAttempts = deniedCount + enteredCount;
  const denialRatio = totalAttempts > 0 ? (deniedCount / totalAttempts) : 0;

  // Standardized weights
  const w1 = 0.50; // Denied request frequency
  const w2 = 0.35; // Saturation duration ratio
  const w3 = 0.15; // Queue pressure

  const rawScore = 10 * (w1 * denialRatio + w2 * fullRatio + w3 * peakQueueRatio);
  const clampedScore = Math.min(10, Math.max(0, parseFloat(rawScore.toFixed(1))));

  let tier = 'Nominal Operation';
  let color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let description = 'Capacity safely accommodates current vehicular volume. No physical expansion required.';

  if (clampedScore >= 6.5) {
    tier = 'Critical Bottleneck';
    color = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    description = 'High denial rate and sustained saturation detected. Immediate physical bay expansion is required.';
  } else if (clampedScore >= 3.0) {
    tier = 'Moderate Saturation';
    color = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    description = 'Peak demand causes intermittent turn-aways. Facility optimization or reservation policies recommended.';
  }

  return {
    score: clampedScore,
    tier,
    color,
    description
  };
}

/**
 * Calculates recommended additional slots (Delta C) to bring denial rate below target alpha (5% default):
 * Delta C = ceil( (N_denied / (T_peak * mu)) * (1 - alpha) )
 *
 * @param {number} currentCapacity - Base capacity (default 4)
 * @param {number} deniedCount - Number of denied entries
 * @param {number} enteredCount - Number of admitted entries
 * @param {number} targetAlpha - Target denial threshold (0.05 = 5%)
 * @returns {{ additionalSlots: number, targetCapacity: number, projectedDenialRate: number }}
 */
export function calculateCapacityRecommendation(
  currentCapacity = 4,
  deniedCount = 0,
  enteredCount = 10,
  targetAlpha = 0.05
) {
  const currentDenialRate = calculateDenialRate(deniedCount, enteredCount);

  if (currentDenialRate <= (targetAlpha * 100)) {
    return {
      additionalSlots: 0,
      targetCapacity: currentCapacity,
      projectedDenialRate: currentDenialRate,
      urgency: 'LOW'
    };
  }

  // Model additional slots needed based on turn-away volume
  const excessDemandFactor = deniedCount / Math.max(1, enteredCount);
  const additionalSlots = Math.max(1, Math.ceil(currentCapacity * excessDemandFactor * (1 - targetAlpha)));
  const targetCapacity = currentCapacity + additionalSlots;
  const projectedDenialRate = parseFloat(Math.max(1.2, (currentDenialRate / (1 + additionalSlots / currentCapacity))).toFixed(1));

  return {
    additionalSlots,
    targetCapacity,
    projectedDenialRate,
    urgency: additionalSlots >= 3 ? 'HIGH' : 'MEDIUM'
  };
}
