import { persistImage, deletePersistedImage } from '../src/utils/images';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/user/0/app/files/',
  cacheDirectory: 'file:///data/user/0/app/cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

describe('images utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('persistImage', () => {
    it('returns empty string if empty input provided', async () => {
      const res = await persistImage('');
      expect(res).toBe('');
    });

    it('returns remote HTTP urls directly without persisting', async () => {
      const res = await persistImage('https://example.com/leaf.jpg');
      expect(res).toBe('https://example.com/leaf.jpg');
    });

    it('reuses existing photo if already located in plantguard-photos with non-zero size', async () => {
      const targetUri = 'file:///data/user/0/app/files/plantguard-photos/photo-already-saved.jpg';
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 15420,
      });

      const res = await persistImage(targetUri);
      expect(res).toBe(targetUri);
      expect(FileSystem.copyAsync).not.toHaveBeenCalled();
      expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
    });

    it('writes base64 data directly to destination and returns destinationUri', async () => {
      // Directory check
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true }) // dir exists
        .mockResolvedValueOnce({ exists: true, size: 4500 }); // check written file size

      const testBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD...';
      const res = await persistImage('file:///cache/photo.jpg', testBase64);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('plantguard-photos/photo-'),
        testBase64,
        { encoding: 'base64' }
      );
      expect(res).toContain('plantguard-photos/photo-');
      expect(res).toMatch(/\.jpg$/);
    });

    it('strips data:image prefix if present in base64 data', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: true, size: 8900 });

      const dataUri = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAA...';
      const res = await persistImage('file:///cache/photo.png', dataUri);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('plantguard-photos/photo-'),
        'iVBORw0KGgoAAAANSUhEUgAA...',
        { encoding: 'base64' }
      );
      expect(res).toContain('plantguard-photos/photo-');
    });

    it('falls back to data URI if file writing fails but base64 was provided', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true }) // dir exists
        .mockResolvedValueOnce({ exists: false }); // file write failed to verify

      (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Disk full')
      );

      const b64 = 'SAMPLE_BASE64_DATA';
      const res = await persistImage('file:///cache/photo.jpg', b64);

      expect(res).toBe('data:image/jpeg;base64,SAMPLE_BASE64_DATA');
    });

    it('copies file if no base64 provided and copy succeeds', async () => {
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true }) // dir exists
        .mockResolvedValueOnce({ exists: true, size: 12000 }); // destination check

      const res = await persistImage('file:///cache/photo.jpg');

      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: 'file:///cache/photo.jpg',
        to: expect.stringContaining('plantguard-photos/photo-'),
      });
      expect(res).toContain('plantguard-photos/photo-');
    });

    it('falls back to original uri if copy and read fail', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
      (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Missing READ permission')
      );
      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Missing READ permission')
      );

      const res = await persistImage('file:///cache/photo.jpg');
      expect(res).toBe('file:///cache/photo.jpg');
    });
  });

  describe('deletePersistedImage', () => {
    it('deletes file if it exists and returns true', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValueOnce(undefined);

      const res = await deletePersistedImage('file:///app/plantguard-photos/photo-1.jpg');
      expect(res).toBe(true);
      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        'file:///app/plantguard-photos/photo-1.jpg',
        { idempotent: true }
      );
    });

    it('returns false if file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });

      const res = await deletePersistedImage('file:///app/plantguard-photos/not-found.jpg');
      expect(res).toBe(false);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
