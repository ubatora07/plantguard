/* global __dirname, process */
const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../src/data/plantvillage-image-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const outPath = path.resolve(__dirname, '../src/data/plantvillage-images.ts');

let lines = [];
lines.push("import { ImageSourcePropType } from 'react-native';");
lines.push("");
lines.push("/**");
lines.push(" * Authentic PlantVillage images for all 38 benchmark classes");
lines.push(" * Sourced directly from Penn State PlantVillage Dataset (spMohanty/PlantVillage-Dataset)");
lines.push(" */");
lines.push("export const PLANTVILLAGE_IMAGES: Record<string, ImageSourcePropType> = {");

for (const item of manifest) {
  lines.push(`  '${item.classKey}': require('../../assets/images/plantvillage/${item.safeName}'),`);
}

lines.push("};");
lines.push("");
lines.push("export const PLANTVILLAGE_REMOTE_URLS: Record<string, string> = {");

for (const item of manifest) {
  lines.push(`  '${item.classKey}': '${item.downloadUrl}',`);
}

lines.push("};");
lines.push("");
lines.push("/**");
lines.push(" * Get authentic PlantVillage image source for any class");
lines.push(" */");
lines.push("export function getPlantVillageImage(classKey?: string): ImageSourcePropType | undefined {");
lines.push("  if (!classKey) return undefined;");
lines.push("  return PLANTVILLAGE_IMAGES[classKey];");
lines.push("}");
lines.push("");
lines.push("/**");
lines.push(" * Get fallback URL on GitHub raw content for any class");
lines.push(" */");
lines.push("export function getPlantVillageRemoteUrl(classKey?: string): string | undefined {");
lines.push("  if (!classKey) return undefined;");
lines.push("  return PLANTVILLAGE_REMOTE_URLS[classKey];");
lines.push("}");
lines.push("");
lines.push("/**");
lines.push(" * Authentic representative leaf images for PlantVillage crops");
lines.push(" */");
lines.push("export const PLANTVILLAGE_CROP_IMAGES: Record<string, ImageSourcePropType> = {");
lines.push("  apple: PLANTVILLAGE_IMAGES['Apple___healthy'],");
lines.push("  blueberry: PLANTVILLAGE_IMAGES['Blueberry___healthy'],");
lines.push("  cherry: PLANTVILLAGE_IMAGES['Cherry_(including_sour)___healthy'],");
lines.push("  corn: PLANTVILLAGE_IMAGES['Corn_(maize)___healthy'],");
lines.push("  grape: PLANTVILLAGE_IMAGES['Grape___healthy'],");
lines.push("  orange: PLANTVILLAGE_IMAGES['Orange___Haunglongbing_(Citrus_greening)'],");
lines.push("  peach: PLANTVILLAGE_IMAGES['Peach___healthy'],");
lines.push("  pepper: PLANTVILLAGE_IMAGES['Pepper,_bell___healthy'],");
lines.push("  potato: PLANTVILLAGE_IMAGES['Potato___healthy'],");
lines.push("  raspberry: PLANTVILLAGE_IMAGES['Raspberry___healthy'],");
lines.push("  soybean: PLANTVILLAGE_IMAGES['Soybean___healthy'],");
lines.push("  squash: PLANTVILLAGE_IMAGES['Squash___Powdery_mildew'],");
lines.push("  strawberry: PLANTVILLAGE_IMAGES['Strawberry___healthy'],");
lines.push("  tomato: PLANTVILLAGE_IMAGES['Tomato___healthy'],");
lines.push("};");
lines.push("");
lines.push("export function getCropImageSource(cropId: string): ImageSourcePropType | undefined {");
lines.push("  return PLANTVILLAGE_CROP_IMAGES[cropId];");
lines.push("}");
lines.push("");

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Successfully generated src/data/plantvillage-images.ts with 38 classes!');
