/**
 * DUNK-O-METER 9000 - Scientific Calculation Engine
 * Believable, humorous, deterministic physics algorithm with organic variance.
 */

class DunkCalculator {
  constructor() {
    this.tempMultipliers = {
      cold: 0.74,
      normal: 1.0,
      hot: 1.32
    };

    this.styleMultipliers = {
      gentle: 0.85,
      normal: 1.0,
      aggressive: 1.38
    };

    this.sizeMultipliers = {
      small: 0.82,
      medium: 1.0,
      large: 1.25
    };
  }

  /**
   * Calculate all physical, structural, and survival telemetry.
   * @param {Object} biscuit - Biscuit definition from database
   * @param {Object} beverage - Beverage definition from database
   * @param {Object} settings - User settings { duration, temperature, style, size }
   */
  calculate(biscuit, beverage, settings) {
    const tempMult = this.tempMultipliers[settings.temperature] || 1.0;
    const styleMult = this.styleMultipliers[settings.style] || 1.0;
    const sizeMult = this.sizeMultipliers[settings.size] || 1.0;
    const drinkMult = beverage.absorptionMultiplier || 1.0;
    const duration = parseFloat(settings.duration) || 5.0;

    // Biscuit physical coefficients
    const strength = biscuit.structuralStrength || 50;
    const absorption = biscuit.absorptionRate || 1.0;
    const cream = biscuit.creamFactor || 0;
    const thickness = biscuit.thickness || 5.0;
    const baseCrispiness = biscuit.crispiness || 75;

    // Environmental resistance factor
    const liquidAggression = drinkMult * tempMult * styleMult;

    // Maximum theoretical structural breaking threshold in seconds
    // High strength + thick + cream = high threshold. High absorption + hot liquid = fast drop.
    const thicknessFactor = Math.pow(thickness / 4.5, 0.45);
    const creamBonus = 1 + (cream / 100) * 0.42;
    const baseThreshold = (strength * 0.16) * thicknessFactor * creamBonus;
    const estimatedBreakingTime = Math.max(1.2, (baseThreshold * sizeMult) / liquidAggression);

    // Dynamic Dunk Ratio: how close user pushed the biscuit to its breaking threshold
    const dunkRatio = duration / estimatedBreakingTime;

    // Controlled pseudo-random organic variance (±3%) based on input parameters
    const seed = Math.sin(duration * 13.37 + strength * 7.11 + drinkMult * 99.1);
    const organicVariance = seed * 3.5;

    // Survival Probability calculation: sigmoid curve around ratio = 1.0
    let survival;
    if (dunkRatio <= 0.3) {
      // Very safe zone
      survival = 98 - (dunkRatio / 0.3) * 10;
    } else if (dunkRatio <= 0.7) {
      // Moderate absorption zone
      survival = 88 - ((dunkRatio - 0.3) / 0.4) * 26;
    } else if (dunkRatio <= 1.0) {
      // Danger zone
      survival = 62 - ((dunkRatio - 0.7) / 0.3) * 38;
    } else if (dunkRatio <= 1.25) {
      // Failure underway
      survival = 24 - ((dunkRatio - 1.0) / 0.25) * 16;
    } else {
      // Complete collapse
      survival = Math.max(1, 8 - (dunkRatio - 1.25) * 6);
    }

    survival = Math.round(Math.max(1, Math.min(99, survival + organicVariance)));
    const breakRisk = 100 - survival;

    // Crispiness drops faster than structural survival
    const crispinessDepreciation = Math.pow(duration / (estimatedBreakingTime * 0.75), 1.35);
    const crispinessRemaining = Math.round(
      Math.max(2, Math.min(100, baseCrispiness * Math.max(0, 1 - crispinessDepreciation * 0.92) + (seed * 2)))
    );
    const softnessLevel = 100 - crispinessRemaining;

    // Classification Rank
    let rank = {};
    if (survival >= 80) {
      rank = {
        code: "champion",
        title: "BISCUIT CHAMPION",
        badge: "🟢",
        color: "#00ff88",
        message: "This biscuit fears no beverage."
      };
    } else if (survival >= 60) {
      rank = {
        code: "skilled",
        title: "SKILLED DUNKER",
        badge: "🟡",
        color: "#a3e635",
        message: "A respectable performance in dangerous liquid conditions."
      };
    } else if (survival >= 40) {
      rank = {
        code: "danger",
        title: "BISCUIT IN DANGER",
        badge: "🟠",
        color: "#f59e0b",
        message: "Proceed with extreme snacking caution."
      };
    } else if (survival >= 15) {
      rank = {
        code: "critical",
        title: "CRITICAL BISCUIT FAILURE",
        badge: "🔴",
        color: "#ef4444",
        message: "Structural collapse is highly probable."
      };
    } else {
      rank = {
        code: "destroyed",
        title: "BISCUIT COMPLETELY DESTROYED",
        badge: "💀",
        color: "#dc2626",
        message: "Congratulations. You have created biscuit soup."
      };
    }

    // Dynamic Funny Conclusion Selection
    const conclusion = this.selectConclusion(biscuit, rank.code);

    return {
      survivalProbability: survival,
      breakRisk: breakRisk,
      crispinessRemaining: crispinessRemaining,
      softnessLevel: softnessLevel,
      estimatedBreakingTime: parseFloat(estimatedBreakingTime.toFixed(1)),
      dunkDuration: duration,
      rank: rank,
      conclusion: conclusion,
      isEmergencyWorthy: survival < 45,
      fractureStage: this.calculateFractureStage(dunkRatio)
    };
  }

  /**
   * Determine fracture stage for visual simulation (0 = pristine, 4 = catastrophic break)
   */
  calculateFractureStage(dunkRatio) {
    if (dunkRatio < 0.45) return 0; // Pristine
    if (dunkRatio < 0.75) return 1; // Slight darkening / surface soak
    if (dunkRatio < 0.95) return 2; // Softened / micro-cracks
    if (dunkRatio < 1.15) return 3; // Severe fissures & vibration
    return 4; // Catastrophic snap & detachment
  }

  selectConclusion(biscuit, rankCode) {
    // 35% chance of biscuit-specific easter egg if available
    if (Math.random() < 0.45 && SCIENTIFIC_CONCLUSIONS.biscuitSpecific[biscuit.id]) {
      return SCIENTIFIC_CONCLUSIONS.biscuitSpecific[biscuit.id];
    }

    const pool = SCIENTIFIC_CONCLUSIONS[rankCode] || SCIENTIFIC_CONCLUSIONS.skilled;
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }
}

window.dunkCalculator = new DunkCalculator();
