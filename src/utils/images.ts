import * as FileSystem from 'expo-file-system/legacy';

/**
 * Copies a picked/captured photo from the shared cache into the app's
 * documents directory so history thumbnails survive cache cleanup.
 * Falls back to the original URI if copying fails (the photo still works
 * for the current session).
 */
export async function persistImage(
  uri: string,
  base64Data?: string | null
): Promise<string> {
  if (!uri && !base64Data) return uri;

  // If it's already a data URL and no base64 provided, return as is
  if (uri && !uri.startsWith('file://') && !uri.startsWith('content://') && !base64Data) {
    return uri;
  }

  try {
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
    if (!baseDir) {
      if (base64Data) {
        const clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        return `data:image/jpeg;base64,${clean}`;
      }
      return uri;
    }

    const targetDir = `${baseDir}plantguard-photos/`;

    // If the image is ALREADY inside targetDir and has non-zero size, reuse it
    if (uri && uri.startsWith(targetDir)) {
      try {
        const existingInfo = await FileSystem.getInfoAsync(uri);
        if (existingInfo.exists && (existingInfo.size === undefined || existingInfo.size > 0)) {
          return uri;
        }
      } catch {}
    }

    const dirInfo = await FileSystem.getInfoAsync(targetDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    }

    const extension = extractExtension(uri || 'photo.jpg');
    const filename = `photo-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}.${extension}`;
    const destinationUri = `${targetDir}${filename}`;

    // 1. If base64Data is provided, write directly to documentDirectory!
    // This completely bypasses scoped storage / READ permission errors on Android camera cache!
    if (base64Data) {
      try {
        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        await FileSystem.writeAsStringAsync(destinationUri, cleanBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const check = await FileSystem.getInfoAsync(destinationUri);
        if (check.exists && (check.size === undefined || check.size > 0)) {
          return destinationUri;
        }
      } catch (writeErr) {
        console.warn('[images] Failed to write base64 to destination:', writeErr);
      }
    }

    // 2. Try copying the file from uri
    if (uri && (uri.startsWith('file://') || uri.startsWith('content://'))) {
      try {
        await FileSystem.copyAsync({ from: uri, to: destinationUri });
        const check = await FileSystem.getInfoAsync(destinationUri);
        if (check.exists && (check.size === undefined || check.size > 0)) {
          return destinationUri;
        }
        // If file is empty (0 bytes), delete it so it doesn't corrupt subsequent decoders
        await FileSystem.deleteAsync(destinationUri, { idempotent: true });
      } catch {
        // Clean up partial/corrupt destination file
        try {
          await FileSystem.deleteAsync(destinationUri, { idempotent: true });
        } catch {}

        // Fallback: read base64 and write directly if file copy has access restriction
        if (!base64Data) {
          try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            await FileSystem.writeAsStringAsync(destinationUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const check = await FileSystem.getInfoAsync(destinationUri);
            if (check.exists && (check.size === undefined || check.size > 0)) {
              return destinationUri;
            }
          } catch {}
        }
      }
    }

    // 3. In-memory data URI fallback if file writing failed but base64 is available
    if (base64Data) {
      const clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      return `data:image/jpeg;base64,${clean}`;
    }

    return uri;
  } catch (error) {
    console.warn('[images] failed to persist photo, using original URI', error);
    if (base64Data) {
      const clean = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      return `data:image/jpeg;base64,${clean}`;
    }
    return uri;
  }
}

/**
 * Deletes a persisted photo file from disk when its history record is removed.
 * Prevents accumulation of orphan image files.
 */
export async function deletePersistedImage(uri: string): Promise<boolean> {
  if (!uri || !uri.startsWith('file://')) return false;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[images] failed to delete persisted photo', error);
    return false;
  }
}

function extractExtension(uri: string): string {
  const clean = uri.split('?')[0];
  const ext = clean.slice(clean.lastIndexOf('.') + 1).toLowerCase();
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : 'jpg';
}
