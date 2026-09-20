import type { CropId, EconomicImpact } from '../types';

export interface CropEconomicProfile {
  cropId: CropId;
  cropName: string;
  averageYieldTonsPerHa: number;
  marketPriceTengePerKg: number;
  baseRevenueTengePerHa: number;
}

export const CROP_ECONOMIC_PROFILES: Record<string, CropEconomicProfile> = {
  tomato: {
    cropId: 'tomato',
    cropName: 'Томат',
    averageYieldTonsPerHa: 45,
    marketPriceTengePerKg: 260,
    baseRevenueTengePerHa: 11_700_000,
  },
  potato: {
    cropId: 'potato',
    cropName: 'Картофель',
    averageYieldTonsPerHa: 30,
    marketPriceTengePerKg: 180,
    baseRevenueTengePerHa: 5_400_000,
  },
  apple: {
    cropId: 'apple',
    cropName: 'Яблоня',
    averageYieldTonsPerHa: 25,
    marketPriceTengePerKg: 380,
    baseRevenueTengePerHa: 9_500_000,
  },
  corn: {
    cropId: 'corn',
    cropName: 'Кукуруза',
    averageYieldTonsPerHa: 7,
    marketPriceTengePerKg: 120,
    baseRevenueTengePerHa: 840_000,
  },
  grape: {
    cropId: 'grape',
    cropName: 'Виноград',
    averageYieldTonsPerHa: 12,
    marketPriceTengePerKg: 550,
    baseRevenueTengePerHa: 6_600_000,
  },
  pepper: {
    cropId: 'pepper',
    cropName: 'Перец сладкий',
    averageYieldTonsPerHa: 20,
    marketPriceTengePerKg: 420,
    baseRevenueTengePerHa: 8_400_000,
  },
};

export function calculateEconomicImpact(params: {
  cropId?: string;
  severity?: 'healthy' | 'mild' | 'moderate' | 'severe';
  isHealthy?: boolean;
}): EconomicImpact {
  if (params.isHealthy || params.severity === 'healthy') {
    return {
      estimatedLossPercent: 0,
      estimatedLossRubPerHa: 0,
      treatmentCostRubPerHa: 8500, // стоимость базовой био-профилактики в тенге на 1 га
      roiMultiplier: 100,
    };
  }

  const profile = (params.cropId && CROP_ECONOMIC_PROFILES[params.cropId]) || CROP_ECONOMIC_PROFILES.tomato;

  let lossPercent = 30;
  if (params.severity === 'severe') lossPercent = 45;
  else if (params.severity === 'moderate') lossPercent = 30;
  else if (params.severity === 'mild') lossPercent = 15;

  const lossTenge = Math.round((profile.baseRevenueTengePerHa * lossPercent) / 100);
  const treatmentCostTenge = 12500; // средняя стоимость биоинсектицидов / биофунгицидов на 1 га в тенге
  const netSaved = Math.max(0, Math.round(lossTenge * 0.9 - treatmentCostTenge));
  const roi = Math.round(netSaved / treatmentCostTenge);

  return {
    estimatedLossPercent: lossPercent,
    estimatedLossRubPerHa: lossTenge,
    treatmentCostRubPerHa: treatmentCostTenge,
    roiMultiplier: Math.max(15, roi),
  };
}
