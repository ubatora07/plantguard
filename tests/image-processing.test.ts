import {
  assessImageQuality,
  cropCenterLeaf,
  rotateImage,
  prepareImageForAnalysis,
  cropImageWithPreset,
  detectLeafSymptomHotspots,
} from '../src/utils/image-processing';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
  manipulateAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Image: {
    getSize: jest.fn((uri, success) => success(1200, 900)),
  },
}));

describe('image-processing utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assessImageQuality', () => {
    it('returns acceptable for empty or remote URLs', async () => {
      const res = await assessImageQuality('https://example.com/leaf.jpg');
      expect(res.acceptable).toBe(true);
      expect(res.score).toBe(95);
      expect(res.isBlurryOrLowContrast).toBe(false);
    });

    it('analyzes local image and returns report', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///thumb.jpg',
        base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789==',
        width: 32,
        height: 32,
      });

      const res = await assessImageQuality('file:///local_leaf.jpg', {
        width: 800,
        height: 600,
      });

      expect(res.dimensions).toEqual({ width: 800, height: 600 });
      expect(res.isLowResolution).toBe(false);
      expect(res.acceptable).toBe(true);
    });

    it('detects low resolution images', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///thumb.jpg',
        base64: 'A'.repeat(100) + 'B'.repeat(400),
        width: 32,
        height: 32,
      });

      const res = await assessImageQuality('file:///small_leaf.jpg', {
        width: 250,
        height: 250,
      });

      expect(res.isLowResolution).toBe(true);
      expect(res.warningText).toBe('Низкое разрешение снимка');
    });
  });

  describe('cropCenterLeaf', () => {
    it('crops center of the image using factor', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cropped_leaf.jpg',
        width: 600,
        height: 450,
      });

      const result = await cropCenterLeaf('file:///original.jpg', 1.3);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file:///original.jpg',
        [
          expect.objectContaining({
            crop: expect.objectContaining({
              width: expect.any(Number),
              height: expect.any(Number),
            }),
          }),
        ],
        expect.any(Object)
      );
      expect(result).toBe('file:///cropped_leaf.jpg');
    });

    it('bypasses remote http uris', async () => {
      const res = await cropCenterLeaf('http://example.com/test.jpg');
      expect(res).toBe('http://example.com/test.jpg');
      expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
    });
  });

  describe('rotateImage', () => {
    it('rotates image by specified degrees', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///rotated_leaf.jpg',
        width: 900,
        height: 1200,
      });

      const result = await rotateImage('file:///original.jpg', 90);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file:///original.jpg',
        [{ rotate: 90 }],
        expect.any(Object)
      );
      expect(result).toBe('file:///rotated_leaf.jpg');
    });
  });

  describe('prepareImageForAnalysis', () => {
    it('resizes image to 1024 max dimension', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///compressed.jpg',
        width: 1024,
        height: 768,
      });

      const res = await prepareImageForAnalysis('file:///big_photo.jpg');
      expect(res).toBe('file:///compressed.jpg');
    });
  });

  describe('cropImageWithPreset', () => {
    it('crops image with square preset', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///square.jpg',
        width: 900,
        height: 900,
      });

      const res = await cropImageWithPreset('file:///leaf.jpg', 'square');
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        'file:///leaf.jpg',
        [expect.objectContaining({ crop: expect.objectContaining({ width: 900, height: 900 }) })],
        expect.any(Object)
      );
      expect(res).toBe('file:///square.jpg');
    });

    it('crops image with trim15 preset', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///trimmed.jpg',
        width: 1020,
        height: 765,
      });

      const res = await cropImageWithPreset('file:///leaf.jpg', 'trim15');
      expect(res).toBe('file:///trimmed.jpg');
    });
  });

  describe('detectLeafSymptomHotspots', () => {
    it('returns empty array when leaf is healthy', async () => {
      const hotspots = await detectLeafSymptomHotspots('file:///healthy.jpg', 'Здоровый лист', true);
      expect(hotspots).toEqual([]);
    });

    it('dynamically computes lesion coordinates for diseased leaves', async () => {
      const hotspots = await detectLeafSymptomHotspots('file:///diseased_leaf.jpg', 'Ранняя пятнистость', false);
      expect(hotspots.length).toBeGreaterThanOrEqual(2);
      expect(hotspots[0].type).toBe('necrosis');
      expect(hotspots[0].x).toBeGreaterThan(0);
      expect(hotspots[0].y).toBeGreaterThan(0);
      expect(hotspots[0].label).toBe('Очаг некроза ткани');
      expect(hotspots[1].type).toBe('halo');
      expect(hotspots[1].label).toBe('Хлоротичное окаймление');
    });
  });
});
