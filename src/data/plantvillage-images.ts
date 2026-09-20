import { ImageSourcePropType } from 'react-native';

/**
 * Authentic PlantVillage images for all 38 benchmark classes
 * Sourced directly from Penn State PlantVillage Dataset (spMohanty/PlantVillage-Dataset)
 */
export const PLANTVILLAGE_IMAGES: Record<string, ImageSourcePropType> = {
  'Apple___Apple_scab': require('../../assets/images/plantvillage/apple_apple_scab.jpg'),
  'Apple___Black_rot': require('../../assets/images/plantvillage/apple_black_rot.jpg'),
  'Apple___Cedar_apple_rust': require('../../assets/images/plantvillage/apple_cedar_apple_rust.jpg'),
  'Apple___healthy': require('../../assets/images/plantvillage/apple_healthy.jpg'),
  'Blueberry___healthy': require('../../assets/images/plantvillage/blueberry_healthy.jpg'),
  'Cherry_(including_sour)___Powdery_mildew': require('../../assets/images/plantvillage/cherry_including_sour_powdery_mildew.jpg'),
  'Cherry_(including_sour)___healthy': require('../../assets/images/plantvillage/cherry_including_sour_healthy.jpg'),
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': require('../../assets/images/plantvillage/corn_maize_cercospora_leaf_spot_gray_leaf_spot.jpg'),
  'Corn_(maize)___Common_rust_': require('../../assets/images/plantvillage/corn_maize_common_rust.jpg'),
  'Corn_(maize)___Northern_Leaf_Blight': require('../../assets/images/plantvillage/corn_maize_northern_leaf_blight.jpg'),
  'Corn_(maize)___healthy': require('../../assets/images/plantvillage/corn_maize_healthy.jpg'),
  'Grape___Black_rot': require('../../assets/images/plantvillage/grape_black_rot.jpg'),
  'Grape___Esca_(Black_Measles)': require('../../assets/images/plantvillage/grape_esca_black_measles.jpg'),
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': require('../../assets/images/plantvillage/grape_leaf_blight_isariopsis_leaf_spot.jpg'),
  'Grape___healthy': require('../../assets/images/plantvillage/grape_healthy.jpg'),
  'Orange___Haunglongbing_(Citrus_greening)': require('../../assets/images/plantvillage/orange_haunglongbing_citrus_greening.jpg'),
  'Peach___Bacterial_spot': require('../../assets/images/plantvillage/peach_bacterial_spot.jpg'),
  'Peach___healthy': require('../../assets/images/plantvillage/peach_healthy.jpg'),
  'Pepper,_bell___Bacterial_spot': require('../../assets/images/plantvillage/pepper_bell_bacterial_spot.jpg'),
  'Pepper,_bell___healthy': require('../../assets/images/plantvillage/pepper_bell_healthy.jpg'),
  'Potato___Early_blight': require('../../assets/images/plantvillage/potato_early_blight.jpg'),
  'Potato___Late_blight': require('../../assets/images/plantvillage/potato_late_blight.jpg'),
  'Potato___healthy': require('../../assets/images/plantvillage/potato_healthy.jpg'),
  'Raspberry___healthy': require('../../assets/images/plantvillage/raspberry_healthy.jpg'),
  'Soybean___healthy': require('../../assets/images/plantvillage/soybean_healthy.jpg'),
  'Squash___Powdery_mildew': require('../../assets/images/plantvillage/squash_powdery_mildew.jpg'),
  'Strawberry___Leaf_scorch': require('../../assets/images/plantvillage/strawberry_leaf_scorch.jpg'),
  'Strawberry___healthy': require('../../assets/images/plantvillage/strawberry_healthy.jpg'),
  'Tomato___Bacterial_spot': require('../../assets/images/plantvillage/tomato_bacterial_spot.jpg'),
  'Tomato___Early_blight': require('../../assets/images/plantvillage/tomato_early_blight.jpg'),
  'Tomato___Late_blight': require('../../assets/images/plantvillage/tomato_late_blight.jpg'),
  'Tomato___Leaf_Mold': require('../../assets/images/plantvillage/tomato_leaf_mold.jpg'),
  'Tomato___Septoria_leaf_spot': require('../../assets/images/plantvillage/tomato_septoria_leaf_spot.jpg'),
  'Tomato___Spider_mites Two-spotted_spider_mite': require('../../assets/images/plantvillage/tomato_spider_mites_two_spotted_spider_mite.jpg'),
  'Tomato___Target_Spot': require('../../assets/images/plantvillage/tomato_target_spot.jpg'),
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': require('../../assets/images/plantvillage/tomato_tomato_yellow_leaf_curl_virus.jpg'),
  'Tomato___Tomato_mosaic_virus': require('../../assets/images/plantvillage/tomato_tomato_mosaic_virus.jpg'),
  'Tomato___healthy': require('../../assets/images/plantvillage/tomato_healthy.jpg'),
};

export const PLANTVILLAGE_REMOTE_URLS: Record<string, string> = {
  'Apple___Apple_scab': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Apple___Apple_scab/00075aa8-d81a-4184-8541-b692b78d398a___FREC_Scab%203335.JPG',
  'Apple___Black_rot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Apple___Black_rot/0090d05d-d797-4c99-abd4-3b9cb323a5fd___JR_FrgE.S%208727.JPG',
  'Apple___Cedar_apple_rust': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Apple___Cedar_apple_rust/025b2b9a-0ec4-4132-96ac-7f2832d0db4a___FREC_C.Rust%203655.JPG',
  'Apple___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Apple___healthy/0055dd26-23a7-4415-ac61-e0b44ebfaf80___RS_HL%205672.JPG',
  'Blueberry___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Blueberry___healthy/008c85d0-a954-4127-bd26-861dc8a1e6ff___RS_HL%202431.JPG',
  'Cherry_(including_sour)___Powdery_mildew': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Cherry_(including_sour)___Powdery_mildew/00705aa7-5ea2-4419-9440-8ba65e108eb9___FREC_Pwd.M%200267.JPG',
  'Cherry_(including_sour)___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Cherry_(including_sour)___healthy/0008f3d3-2f85-4973-be9a-1b520b8b59fc___JR_HL%204092.JPG',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Cercospora_leaf_spot%20Gray_leaf_spot/00120a18-ff90-46e4-92fb-2b7a10345bd3___RS_GLSp%209357.JPG',
  'Corn_(maize)___Common_rust_': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Common_rust_/RS_Rust%201563.JPG',
  'Corn_(maize)___Northern_Leaf_Blight': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___Northern_Leaf_Blight/005318c8-a5fa-4420-843b-23bdda7322c2___RS_NLB%203853%20copy.jpg',
  'Corn_(maize)___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Corn_(maize)___healthy/00031d74-076e-4aef-b040-e068cd3576eb___R.S_HL%208315%20copy%202.jpg',
  'Grape___Black_rot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Grape___Black_rot/00090b0f-c140-4e77-8d20-d39f67b75fcc___FAM_B.Rot%200376.JPG',
  'Grape___Esca_(Black_Measles)': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Grape___Esca_(Black_Measles)/0075b632-2e34-4e4f-9697-fe2b332b7ef8___FAM_B.Msls%204399.JPG',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Grape___Leaf_blight_(Isariopsis_Leaf_Spot)/0001aa74-bbd7-433b-a900-1dccab39d521___FAM_L.Blight%204508.JPG',
  'Grape___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Grape___healthy/00e00912-bf75-4cf8-8b7d-ad64b73bea5f___Mt.N.V_HL%206067.JPG',
  'Orange___Haunglongbing_(Citrus_greening)': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Orange___Haunglongbing_(Citrus_greening)/00045d08-898c-40df-ada6-e7579637a1f9___UF.Citrus_HLB_Lab%201690.JPG',
  'Peach___Bacterial_spot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Peach___Bacterial_spot/00130039-8425-42e9-9dd9-15aead7271ff___Rut._Bact.S%203421.JPG',
  'Peach___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Peach___healthy/017d3d86-12bf-4280-8929-10dcd504ac46___Rutg._HL%203671.JPG',
  'Pepper,_bell___Bacterial_spot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Pepper%2C_bell___Bacterial_spot/0022d6b7-d47c-4ee2-ae9a-392a53f48647___JR_B.Spot%208964.JPG',
  'Pepper,_bell___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Pepper%2C_bell___healthy/00100ffa-095e-4881-aebf-61fe5af7226e___JR_HL%207886.JPG',
  'Potato___Early_blight': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Potato___Early_blight/001187a0-57ab-4329-baff-e7246a9edeb0___RS_Early.B%208178.JPG',
  'Potato___Late_blight': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Potato___Late_blight/0051e5e8-d1c4-4a84-bf3a-a426cdad6285___RS_LB%204640.JPG',
  'Potato___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Potato___healthy/00fc2ee5-729f-4757-8aeb-65c3355874f2___RS_HL%201864.JPG',
  'Raspberry___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Raspberry___healthy/00a3fc0e-64cc-4e35-ac2f-aef04fda9b22___Mary_HL%209177.JPG',
  'Soybean___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Soybean___healthy/0007ca44-b81d-475c-b8b5-c226a041f020___RS_HL%206331.JPG',
  'Squash___Powdery_mildew': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Squash___Powdery_mildew/0045a100-36d3-45df-b417-d487d6e07eb4___UMD_Powd.M%200003.JPG',
  'Strawberry___Leaf_scorch': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Strawberry___Leaf_scorch/0024203d-6e4c-490f-b9a8-e5926df0b76e___RS_L.Scorch%200795.JPG',
  'Strawberry___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Strawberry___healthy/00166615-5e7b-4318-8957-5e50df335ee8___RS_HL%201785.JPG',
  'Tomato___Bacterial_spot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Bacterial_spot/00416648-be6e-4bd4-bc8d-82f43f8a7240___GCREC_Bact.Sp%203110.JPG',
  'Tomato___Early_blight': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B%208389.JPG',
  'Tomato___Late_blight': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Late_blight/0003faa8-4b27-4c65-bf42-6d9e352ca1a5___RS_Late.B%204946.JPG',
  'Tomato___Leaf_Mold': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Leaf_Mold/00694db7-3327-45e0-b4da-a8bb7ab6a4b7___Crnl_L.Mold%206923.JPG',
  'Tomato___Septoria_leaf_spot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Septoria_leaf_spot/002533c1-722b-44e5-9d2e-91f7747b2543___Keller.St_CG%201831.JPG',
  'Tomato___Spider_mites Two-spotted_spider_mite': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Spider_mites%20Two-spotted_spider_mite/002835d1-c18e-4471-aa6e-8d8c29585e9b___Com.G_SpM_FL%208584.JPG',
  'Tomato___Target_Spot': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Target_Spot/002213fb-b620-4593-b9ac-6a6cc119b100___Com.G_TgS_FL%208360.JPG',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Tomato_Yellow_Leaf_Curl_Virus/00139ae8-d881-4edb-925f-46584b0bd68c___YLCV_NREC%202944.JPG',
  'Tomato___Tomato_mosaic_virus': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___Tomato_mosaic_virus/000ec6ea-9063-4c33-8abe-d58ca8a88878___PSU_CG%202169.JPG',
  'Tomato___healthy': 'https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/Tomato___healthy/000146ff-92a4-4db6-90ad-8fce2ae4fddd___GH_HL%20Leaf%20259.1.JPG',
};

/**
 * Get authentic PlantVillage image source for any class
 */
export function getPlantVillageImage(classKey?: string): ImageSourcePropType | undefined {
  if (!classKey) return undefined;
  return PLANTVILLAGE_IMAGES[classKey];
}

/**
 * Get fallback URL on GitHub raw content for any class
 */
export function getPlantVillageRemoteUrl(classKey?: string): string | undefined {
  if (!classKey) return undefined;
  return PLANTVILLAGE_REMOTE_URLS[classKey];
}

/**
 * Authentic representative leaf images for PlantVillage crops
 */
export const PLANTVILLAGE_CROP_IMAGES: Record<string, ImageSourcePropType> = {
  apple: PLANTVILLAGE_IMAGES['Apple___healthy'],
  blueberry: PLANTVILLAGE_IMAGES['Blueberry___healthy'],
  cherry: PLANTVILLAGE_IMAGES['Cherry_(including_sour)___healthy'],
  corn: PLANTVILLAGE_IMAGES['Corn_(maize)___healthy'],
  grape: PLANTVILLAGE_IMAGES['Grape___healthy'],
  orange: PLANTVILLAGE_IMAGES['Orange___Haunglongbing_(Citrus_greening)'],
  peach: PLANTVILLAGE_IMAGES['Peach___healthy'],
  pepper: PLANTVILLAGE_IMAGES['Pepper,_bell___healthy'],
  potato: PLANTVILLAGE_IMAGES['Potato___healthy'],
  raspberry: PLANTVILLAGE_IMAGES['Raspberry___healthy'],
  soybean: PLANTVILLAGE_IMAGES['Soybean___healthy'],
  squash: PLANTVILLAGE_IMAGES['Squash___Powdery_mildew'],
  strawberry: PLANTVILLAGE_IMAGES['Strawberry___healthy'],
  tomato: PLANTVILLAGE_IMAGES['Tomato___healthy'],
};

export function getCropImageSource(cropId: string): ImageSourcePropType | undefined {
  return PLANTVILLAGE_CROP_IMAGES[cropId];
}
