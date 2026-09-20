/**
 * In-memory channel for the camera → analyze handoff.
 * The camera screen stores the freshly captured photo here and returns back;
 * the analyze tab reads it when the screen regains focus. The value lives
 * only in memory for the current flow — nothing is persisted here.
 */
export interface PendingPhoto {
  uri: string;
  width: number;
  height: number;
  /** True when the photo came from the camera flow. */
  source: 'camera';
}

let pending: PendingPhoto | null = null;

export function setPendingPhoto(photo: PendingPhoto): void {
  pending = photo;
}

export function consumePendingPhoto(): PendingPhoto | null {
  const value = pending;
  pending = null;
  return value;
}
