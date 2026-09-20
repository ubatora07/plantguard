import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  PanResponder,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Crop,
  Check,
  X,
  RotateCw,
  Maximize2,
  Square,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';
import * as ImageManipulator from 'expo-image-manipulator';

interface VisualCropEditorModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onApplyCrop: (croppedUri: string) => void;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function VisualCropEditorModal({
  visible,
  imageUri,
  onClose,
  onApplyCrop,
}: VisualCropEditorModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workingUri, setWorkingUri] = useState(imageUri);

  // Layout of the image canvas container
  const canvasWidth = windowWidth - 32;
  const canvasHeight = Math.min(420, Math.round(windowHeight * 0.52));

  // Display dimensions of image inside canvas (using contain aspect ratio)
  const [displayRect, setDisplayRect] = useState<Rect>({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  });

  // Current crop rectangle inside canvas coordinates
  const [cropBox, setCropBox] = useState<Rect>({
    x: 20,
    y: 20,
    width: canvasWidth - 40,
    height: canvasHeight - 40,
  });

  // Keep a mutable ref to cropBox for smooth PanResponder drag/resize math
  const cropBoxRef = useRef<Rect>(cropBox);
  cropBoxRef.current = cropBox;

  const displayRectRef = useRef<Rect>(displayRect);
  displayRectRef.current = displayRect;

  useEffect(() => {
    if (visible && imageUri) {
      setWorkingUri(imageUri);
      Image.getSize(
        imageUri,
        (w, h) => {
          setNaturalSize({ width: w, height: h });
          computeLayout(w, h);
        },
        () => {
          // Default fallback dimensions
          setNaturalSize({ width: 1000, height: 1000 });
          computeLayout(1000, 1000);
        }
      );
    }
  }, [visible, imageUri]);

  const computeLayout = (imgWidth: number, imgHeight: number) => {
    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let dispW = canvasWidth;
    let dispH = canvasHeight;
    let dispX = 0;
    let dispY = 0;

    if (imgAspect > canvasAspect) {
      dispH = Math.round(canvasWidth / imgAspect);
      dispY = Math.round((canvasHeight - dispH) / 2);
    } else {
      dispW = Math.round(canvasHeight * imgAspect);
      dispX = Math.round((canvasWidth - dispW) / 2);
    }

    const newDisplay: Rect = { x: dispX, y: dispY, width: dispW, height: dispH };
    setDisplayRect(newDisplay);

    // Initial crop frame occupies centered 80% of image area
    const initialW = Math.round(dispW * 0.85);
    const initialH = Math.round(dispH * 0.85);
    const initialX = Math.round(dispX + (dispW - initialW) / 2);
    const initialY = Math.round(dispY + (dispH - initialH) / 2);

    const initialCrop: Rect = {
      x: initialX,
      y: initialY,
      width: initialW,
      height: initialH,
    };
    setCropBox(initialCrop);
  };

  // Drag responder for moving the crop frame
  const moveStartRef = useRef<{ boxX: number; boxY: number }>({
    boxX: 0,
    boxY: 0,
  });

  const movePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          // Reject if touch starts within 36px of corners, so corners always get the touch
          const { locationX, locationY } = evt.nativeEvent;
          const currentW = cropBoxRef.current.width;
          const currentH = cropBoxRef.current.height;
          const cornerZone = 36;
          const isNearCorner =
            (locationX < cornerZone || locationX > currentW - cornerZone) &&
            (locationY < cornerZone || locationY > currentH - cornerZone);
          return !isNearCorner;
        },
        onMoveShouldSetPanResponder: (_evt, gestureState) => {
          return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          moveStartRef.current = {
            boxX: cropBoxRef.current.x,
            boxY: cropBoxRef.current.y,
          };
        },
        onPanResponderMove: (_evt, gestureState) => {
          const dx = gestureState.dx;
          const dy = gestureState.dy;

          const disp = displayRectRef.current;
          const currentW = cropBoxRef.current.width;
          const currentH = cropBoxRef.current.height;

          let newX = moveStartRef.current.boxX + dx;
          let newY = moveStartRef.current.boxY + dy;

          // Clamp within displayed image bounds
          newX = Math.max(disp.x, Math.min(disp.x + disp.width - currentW, newX));
          newY = Math.max(disp.y, Math.min(disp.y + disp.height - currentH, newY));

          const updated = {
            x: Math.round(newX),
            y: Math.round(newY),
            width: currentW,
            height: currentH,
          };
          cropBoxRef.current = updated;
          setCropBox(updated);
        },
      }),
    []
  );

  // Dynamic 4-corner resize responders with capture priority
  const resizeStartRef = useRef<{
    boxX: number;
    boxY: number;
    boxW: number;
    boxH: number;
  }>({
    boxX: 0,
    boxY: 0,
    boxW: 0,
    boxH: 0,
  });

  const createCornerResponder = (corner: 'tl' | 'tr' | 'bl' | 'br') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        resizeStartRef.current = {
          boxX: cropBoxRef.current.x,
          boxY: cropBoxRef.current.y,
          boxW: cropBoxRef.current.width,
          boxH: cropBoxRef.current.height,
        };
      },
      onPanResponderMove: (_evt, gestureState) => {
        const dx = gestureState.dx;
        const dy = gestureState.dy;

        const disp = displayRectRef.current;
        const { boxX, boxY, boxW, boxH } = resizeStartRef.current;
        const minDim = 40;

        let newX = boxX;
        let newY = boxY;
        let newW = boxW;
        let newH = boxH;

        if (corner === 'br') {
          const maxAllowedW = disp.x + disp.width - boxX;
          const maxAllowedH = disp.y + disp.height - boxY;
          newW = Math.max(minDim, Math.min(maxAllowedW, boxW + dx));
          newH = Math.max(minDim, Math.min(maxAllowedH, boxH + dy));
        } else if (corner === 'bl') {
          newX = Math.max(disp.x, Math.min(boxX + boxW - minDim, boxX + dx));
          newW = boxW - (newX - boxX);
          const maxAllowedH = disp.y + disp.height - boxY;
          newH = Math.max(minDim, Math.min(maxAllowedH, boxH + dy));
        } else if (corner === 'tr') {
          const maxAllowedW = disp.x + disp.width - boxX;
          newW = Math.max(minDim, Math.min(maxAllowedW, boxW + dx));
          newY = Math.max(disp.y, Math.min(boxY + boxH - minDim, boxY + dy));
          newH = boxH - (newY - boxY);
        } else if (corner === 'tl') {
          newX = Math.max(disp.x, Math.min(boxX + boxW - minDim, boxX + dx));
          newW = boxW - (newX - boxX);
          newY = Math.max(disp.y, Math.min(boxY + boxH - minDim, boxY + dy));
          newH = boxH - (newY - boxY);
        }

        const updatedBox = {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        };
        cropBoxRef.current = updatedBox;
        setCropBox(updatedBox);
      },
    });

  const tlResponder = useMemo(() => createCornerResponder('tl'), []);
  const trResponder = useMemo(() => createCornerResponder('tr'), []);
  const blResponder = useMemo(() => createCornerResponder('bl'), []);
  const brResponder = useMemo(() => createCornerResponder('br'), []);

  // Quick aspect ratio snap
  const handleSnapRatio = (ratio: '1:1' | '4:3' | '16:9' | 'reset') => {
    const disp = displayRectRef.current;
    if (ratio === 'reset') {
      const resetW = Math.round(disp.width * 0.9);
      const resetH = Math.round(disp.height * 0.9);
      setCropBox({
        x: Math.round(disp.x + (disp.width - resetW) / 2),
        y: Math.round(disp.y + (disp.height - resetH) / 2),
        width: resetW,
        height: resetH,
      });
      return;
    }

    let targetAspect = 1;
    if (ratio === '4:3') targetAspect = 4 / 3;
    if (ratio === '16:9') targetAspect = 16 / 9;

    const currentCenterX = cropBox.x + cropBox.width / 2;
    const currentCenterY = cropBox.y + cropBox.height / 2;

    let targetW = cropBox.width;
    let targetH = Math.round(targetW / targetAspect);

    if (targetH > disp.height || targetW > disp.width) {
      targetH = Math.round(disp.height * 0.8);
      targetW = Math.round(targetH * targetAspect);
    }

    targetW = Math.min(disp.width, targetW);
    targetH = Math.min(disp.height, Math.round(targetW / targetAspect));

    let targetX = Math.round(currentCenterX - targetW / 2);
    let targetY = Math.round(currentCenterY - targetH / 2);

    targetX = Math.max(disp.x, Math.min(disp.x + disp.width - targetW, targetX));
    targetY = Math.max(disp.y, Math.min(disp.y + disp.height - targetH, targetY));

    setCropBox({
      x: targetX,
      y: targetY,
      width: targetW,
      height: targetH,
    });
  };

  // Rotate 90 degrees in-editor
  const handleRotateInEditor = async () => {
    if (isProcessing || !workingUri) return;
    setIsProcessing(true);
    try {
      const manip = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setWorkingUri(manip.uri);
      Image.getSize(manip.uri, (w, h) => {
        setNaturalSize({ width: w, height: h });
        computeLayout(w, h);
      });
    } catch {
      Alert.alert('Ошибка', 'Не удалось повернуть фото');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply crop and send to parent
  const handleApply = async () => {
    if (!naturalSize || isProcessing || !workingUri) return;

    setIsProcessing(true);
    try {
      const disp = displayRect;
      const scaleX = naturalSize.width / (disp.width || 1);
      const scaleY = naturalSize.height / (disp.height || 1);

      const relX = Math.max(0, cropBox.x - disp.x);
      const relY = Math.max(0, cropBox.y - disp.y);

      const originX = Math.max(0, Math.round(relX * scaleX));
      const originY = Math.max(0, Math.round(relY * scaleY));
      const cropW = Math.min(naturalSize.width - originX, Math.round(cropBox.width * scaleX));
      const cropH = Math.min(naturalSize.height - originY, Math.round(cropBox.height * scaleY));

      const cropped = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ crop: { originX, originY, width: cropW, height: cropH } }],
        { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG }
      );

      onApplyCrop(cropped.uri);
      onClose();
    } catch (err) {
      console.warn('[VisualCropEditor] Crop error:', err);
      Alert.alert('Ошибка', 'Не удалось выполнить кадрирование снимка');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Editor Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerBtn} hitSlop={10}>
            <X size={22} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Crop size={18} color="#4ADE80" strokeWidth={2.4} />
            <Text style={styles.headerTitle}>Редактор кадрирования</Text>
          </View>

          <Pressable
            onPress={handleApply}
            disabled={isProcessing}
            style={[styles.applyHeaderBtn, isProcessing && { opacity: 0.6 }]}
            hitSlop={8}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.applyHeaderBtnText}>Готово</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Subtitle instructions */}
        <Text style={styles.instructionText}>
          Перемещайте рамку по листу или тяните за правый нижний угол:
        </Text>

        {/* Center Stage: Photo Canvas with Crop Overlay */}
        <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
          {workingUri ? (
            <Image
              source={{ uri: workingUri }}
              style={styles.canvasImage}
              resizeMode="contain"
            />
          ) : null}

          {/* Vignette Mask Surrounding the Crop Box */}
          {/* Top Mask */}
          <View
            style={[
              styles.maskSection,
              {
                left: displayRect.x,
                top: displayRect.y,
                width: displayRect.width,
                height: Math.max(0, cropBox.y - displayRect.y),
              },
            ]}
            pointerEvents="none"
          />
          {/* Bottom Mask */}
          <View
            style={[
              styles.maskSection,
              {
                left: displayRect.x,
                top: cropBox.y + cropBox.height,
                width: displayRect.width,
                height: Math.max(
                  0,
                  displayRect.y + displayRect.height - (cropBox.y + cropBox.height)
                ),
              },
            ]}
            pointerEvents="none"
          />
          {/* Left Mask */}
          <View
            style={[
              styles.maskSection,
              {
                left: displayRect.x,
                top: cropBox.y,
                width: Math.max(0, cropBox.x - displayRect.x),
                height: cropBox.height,
              },
            ]}
            pointerEvents="none"
          />
          {/* Right Mask */}
          <View
            style={[
              styles.maskSection,
              {
                left: cropBox.x + cropBox.width,
                top: cropBox.y,
                width: Math.max(
                  0,
                  displayRect.x + displayRect.width - (cropBox.x + cropBox.width)
                ),
                height: cropBox.height,
              },
            ]}
            pointerEvents="none"
          />

          {/* Interactive Crop Rectangle Frame (Internal Drag moves the box) */}
          <View
            style={[
              styles.cropFrame,
              {
                left: cropBox.x,
                top: cropBox.y,
                width: cropBox.width,
                height: cropBox.height,
              },
            ]}
            {...movePanResponder.panHandlers}>
            {/* Rule of Thirds Grid Lines */}
            <View style={styles.gridLineH1} pointerEvents="none" />
            <View style={styles.gridLineH2} pointerEvents="none" />
            <View style={styles.gridLineV1} pointerEvents="none" />
            <View style={styles.gridLineV2} pointerEvents="none" />

            {/* Visual Corner L-Brackets */}
            <View style={[styles.cornerL, styles.cornerTL]} pointerEvents="none" />
            <View style={[styles.cornerL, styles.cornerTR]} pointerEvents="none" />
            <View style={[styles.cornerL, styles.cornerBL]} pointerEvents="none" />
            <View style={[styles.cornerL, styles.cornerBR]} pointerEvents="none" />
          </View>

          {/* 4 Dedicated Sibling Corner Resize Handles (Rendered directly in canvas, never clipped by Android) */}
          <View
            style={[
              styles.cornerHitbox,
              {
                left: cropBox.x - 30,
                top: cropBox.y - 30,
              },
            ]}
            {...tlResponder.panHandlers}>
            <View style={styles.cornerHandleDot} />
          </View>

          <View
            style={[
              styles.cornerHitbox,
              {
                left: cropBox.x + cropBox.width - 30,
                top: cropBox.y - 30,
              },
            ]}
            {...trResponder.panHandlers}>
            <View style={styles.cornerHandleDot} />
          </View>

          <View
            style={[
              styles.cornerHitbox,
              {
                left: cropBox.x - 30,
                top: cropBox.y + cropBox.height - 30,
              },
            ]}
            {...blResponder.panHandlers}>
            <View style={styles.cornerHandleDot} />
          </View>

          <View
            style={[
              styles.cornerHitbox,
              {
                left: cropBox.x + cropBox.width - 30,
                top: cropBox.y + cropBox.height - 30,
              },
            ]}
            {...brResponder.panHandlers}>
            <View style={[styles.cornerHandleDot, styles.cornerHandleDotAccent]} />
          </View>
        </View>

        {/* Aspect Ratio Snapping Controls */}
        <View style={styles.presetsRow}>
          <Pressable
            style={styles.presetChip}
            onPress={() => handleSnapRatio('1:1')}>
            <Square size={13} color="#4ADE80" strokeWidth={2.4} />
            <Text style={styles.presetChipText}>1:1</Text>
          </Pressable>

          <Pressable
            style={styles.presetChip}
            onPress={() => handleSnapRatio('4:3')}>
            <Text style={styles.presetRatioLabel}>4:3</Text>
            <Text style={styles.presetChipText}>Лист</Text>
          </Pressable>

          <Pressable
            style={styles.presetChip}
            onPress={() => handleSnapRatio('16:9')}>
            <Text style={styles.presetRatioLabel}>16:9</Text>
            <Text style={styles.presetChipText}>Широкий</Text>
          </Pressable>

          <Pressable
            style={styles.presetChip}
            onPress={() => handleSnapRatio('reset')}>
            <Maximize2 size={13} color="#94A3B8" strokeWidth={2.2} />
            <Text style={styles.presetChipText}>Сброс</Text>
          </Pressable>

          <Pressable
            style={styles.presetChipRotate}
            onPress={handleRotateInEditor}>
            <RotateCw size={13} color="#38BDF8" strokeWidth={2.4} />
            <Text style={[styles.presetChipText, { color: '#38BDF8' }]}>90°</Text>
          </Pressable>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Отмена</Text>
          </Pressable>

          <Pressable
            style={[styles.applyBtn, isProcessing && { opacity: 0.6 }]}
            onPress={handleApply}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.applyBtnText}>Применить кадрирование</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1812',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  applyHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  applyHeaderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 12,
    color: '#A3B899',
    textAlign: 'center',
    marginVertical: 8,
  },
  canvas: {
    alignSelf: 'center',
    backgroundColor: '#060B08',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  canvasImage: {
    width: '100%',
    height: '100%',
  },
  maskSection: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#4ADE80',
    backgroundColor: 'transparent',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33.33%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66.66%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  gridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  gridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66.66%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  cornerL: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#FFFFFF',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cornerHitbox: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 25,
  },
  cornerHandleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#16A34A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 10,
  },
  cornerHandleDotAccent: {
    backgroundColor: '#4ADE80',
    borderColor: '#FFFFFF',
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  presetChipRotate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  presetRatioLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4ADE80',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
