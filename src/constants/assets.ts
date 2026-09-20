import { PLANTVILLAGE_CROP_IMAGES } from '../data/plantvillage-images';

/**
 * Static image assets bundled with the application.
 */
export const ASSETS = {
  logo: require('../../assets/images/icon.png'),
  heroLeafBg: require('../../assets/images/hero/hero_leaf_bg.jpg'),
  crops: PLANTVILLAGE_CROP_IMAGES,
  diseases: {
    earlyBlight: require('../../assets/images/diseases/leaf_early_blight.jpg'),
    healthy: require('../../assets/images/diseases/leaf_healthy.jpg'),
    aphids: require('../../assets/images/diseases/leaf_aphids.jpg'),
    powderyMildew: require('../../assets/images/diseases/leaf_powdery_mildew.jpg'),
  },
  guide: {
    triptych: require('../../assets/images/guide/guide_leaf_triptych.jpg'),
    good: require('../../assets/images/guide/guide_same_leaf_good.jpg'),
    badFar: require('../../assets/images/guide/guide_same_leaf_far.jpg'),
    badBlurry: require('../../assets/images/guide/guide_same_leaf_blurry.jpg'),
    foliage: require('../../assets/images/guide/top_right_foliage.png'),
  },
};
