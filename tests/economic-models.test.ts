import { calculateEconomicImpact, CROP_ECONOMIC_PROFILES } from '../src/data/economic-models';

describe('Economic Loss & ROI Calculator (Agronomic Impact)', () => {
  it('returns zero loss for healthy plants', () => {
    const result = calculateEconomicImpact({
      cropId: 'tomato',
      isHealthy: true,
      severity: 'healthy',
    });

    expect(result.estimatedLossPercent).toBe(0);
    expect(result.estimatedLossRubPerHa).toBe(0);
    expect(result.treatmentCostRubPerHa).toBeGreaterThan(0);
    expect(result.roiMultiplier).toBe(100);
  });

  it('correctly scales loss percentage based on disease severity', () => {
    const mild = calculateEconomicImpact({ cropId: 'potato', severity: 'mild', isHealthy: false });
    const moderate = calculateEconomicImpact({ cropId: 'potato', severity: 'moderate', isHealthy: false });
    const severe = calculateEconomicImpact({ cropId: 'potato', severity: 'severe', isHealthy: false });

    expect(mild.estimatedLossPercent).toBe(15);
    expect(moderate.estimatedLossPercent).toBe(30);
    expect(severe.estimatedLossPercent).toBe(45);

    expect(mild.estimatedLossRubPerHa).toBeLessThan(moderate.estimatedLossRubPerHa);
    expect(moderate.estimatedLossRubPerHa).toBeLessThan(severe.estimatedLossRubPerHa);
  });

  it('calculates realistic KZT/ha damage for known crops', () => {
    const crops = ['tomato', 'potato', 'apple', 'corn', 'grape', 'pepper'];
    for (const crop of crops) {
      const impact = calculateEconomicImpact({
        cropId: crop,
        severity: 'moderate',
        isHealthy: false,
      });

      const profile = CROP_ECONOMIC_PROFILES[crop];
      const expectedLoss = Math.round((profile.baseRevenueTengePerHa * 30) / 100);
      expect(impact.estimatedLossRubPerHa).toBe(expectedLoss);
      expect(impact.roiMultiplier).toBeGreaterThan(0);
      expect(impact.treatmentCostRubPerHa).toBe(12500);
    }
  });

  it('falls back to default tomato profile if cropId is unknown or missing', () => {
    const fallback = calculateEconomicImpact({
      cropId: 'unknown_exotic_plant',
      severity: 'moderate',
      isHealthy: false,
    });

    const tomatoProfile = CROP_ECONOMIC_PROFILES.tomato;
    const expectedLoss = Math.round((tomatoProfile.baseRevenueTengePerHa * 30) / 100);
    expect(fallback.estimatedLossRubPerHa).toBe(expectedLoss);
  });
});
