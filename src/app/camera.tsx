import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  X,
  Zap,
  ZapOff,
  Image as ImageIcon,
  RefreshCw,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { safeBack } from '../utils/navigation';
import { persistImage } from '../utils/images';
import { i18n, AppLanguage } from '../i18n';

export type ZoomKey = '1x' | '2x' | '3x';

interface ZoomConfig {
  scale: number;
  nativeZoom: number;
  label: string;
}

const ZOOM_CONFIG: Record<ZoomKey, ZoomConfig> = {
  '1x': { scale: 1.0, nativeZoom: 0.0, label: '1x' },
  '2x': { scale: 1.8, nativeZoom: 0.25, label: '2x' },
  '3x': { scale: 2.8, nativeZoom: 0.5, label: '3x' },
};

export default function CameraScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ cropId?: string }>();
  const language = (i18n.locale || 'ru') as AppLanguage;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashOn, setFlashOn] = useState(false);
  const [zoom, setZoom] = useState<ZoomKey>('1x');
  const [nativeZoomValue, setNativeZoomValue] = useState(0.0);
  const zoomAnimRef = useRef<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Two-finger pinch-to-zoom state & gesture tracking
  const [isPinching, setIsPinching] = useState(false);
  const [showPinchBadge, setShowPinchBadge] = useState(false);
  const pinchHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nativeZoomRef = useRef(0.0);

  useEffect(() => {
    nativeZoomRef.current = nativeZoomValue;
  }, [nativeZoomValue]);

  const pinchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
  }>({
    initialDist: 0,
    initialZoom: 0,
  });

  const panResponder = useRef(
    PanResponder.create({
      // Activate ONLY when precisely two fingers are on screen
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches?.length === 2,
      onStartShouldSetPanResponderCapture: (evt) => evt.nativeEvent.touches?.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches?.length === 2,
      onMoveShouldSetPanResponderCapture: (evt) => evt.nativeEvent.touches?.length === 2,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length === 2) {
          if (zoomAnimRef.current) cancelAnimationFrame(zoomAnimRef.current);
          if (pinchHideTimerRef.current) clearTimeout(pinchHideTimerRef.current);

          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          pinchStateRef.current = {
            initialDist: dist > 0 ? dist : 1,
            initialZoom: nativeZoomRef.current,
          };
          setIsPinching(true);
          setShowPinchBadge(true);
        }
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length === 2 && pinchStateRef.current.initialDist > 0) {
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          // 280px delta smoothly covers the camera zoom range
          const delta = (dist - pinchStateRef.current.initialDist) / 280;
          const newZoom = Math.max(0.0, Math.min(0.85, pinchStateRef.current.initialZoom + delta));
          nativeZoomRef.current = newZoom;
          setNativeZoomValue(newZoom);

          // Update active preset button
          if (newZoom < 0.12) {
            setZoom('1x');
          } else if (newZoom < 0.38) {
            setZoom('2x');
          } else {
            setZoom('3x');
          }
        }
      },

      onPanResponderRelease: () => {
        setIsPinching(false);
        pinchStateRef.current.initialDist = 0;
        if (pinchHideTimerRef.current) clearTimeout(pinchHideTimerRef.current);
        pinchHideTimerRef.current = setTimeout(() => {
          setShowPinchBadge(false);
        }, 900);
      },

      onPanResponderTerminate: () => {
        setIsPinching(false);
        pinchStateRef.current.initialDist = 0;
        if (pinchHideTimerRef.current) clearTimeout(pinchHideTimerRef.current);
        pinchHideTimerRef.current = setTimeout(() => {
          setShowPinchBadge(false);
        }, 900);
      },
    })
  ).current;

  // Web camera stream state
  const isWeb = Platform.OS === 'web';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webStreamReady, setWebStreamReady] = useState(false);
  const [webError, setWebError] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  // Automatically request permission on mount for native devices
  useEffect(() => {
    if (!isWeb && (!permission || (!permission.granted && permission.canAskAgain))) {
      requestPermission();
    }
  }, [permission?.granted, isWeb]);

  // Handle Web live video stream
  useEffect(() => {
    if (!isWeb) return;
    let activeStream: MediaStream | null = null;
    let cancelled = false;

    async function initWebCamera() {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setWebError('Камера не поддерживается в этом браузере');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing === 'front' ? 'user' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setWebStreamReady(true);
        setWebError(null);
      } catch (err: any) {
        console.warn('[CameraScreen] Web getUserMedia error:', err);
        setWebStreamReady(false);
        setWebError(err?.message || 'Доступ к камере заблокирован');
      }
    }

    initWebCamera();

    return () => {
      cancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isWeb, facing]);

  // Clean up animation frame & timer on unmount
  useEffect(() => {
    return () => {
      if (zoomAnimRef.current) {
        cancelAnimationFrame(zoomAnimRef.current);
      }
      if (pinchHideTimerRef.current) {
        clearTimeout(pinchHideTimerRef.current);
      }
    };
  }, []);

  const handleZoomChange = (newKey: ZoomKey) => {
    setZoom(newKey);
    const target = ZOOM_CONFIG[newKey].nativeZoom;

    if (zoomAnimRef.current) {
      cancelAnimationFrame(zoomAnimRef.current);
    }

    const start = nativeZoomValue;
    const startTime = Date.now();
    const duration = 220; // 220ms buttery smooth glide

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = start + (target - start) * ease;
      setNativeZoomValue(val);
      nativeZoomRef.current = val;

      if (progress < 1) {
        zoomAnimRef.current = requestAnimationFrame(step);
      } else {
        setNativeZoomValue(target);
        nativeZoomRef.current = target;
      }
    };

    zoomAnimRef.current = requestAnimationFrame(step);
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const asset = result.assets[0];
        const persisted = await persistImage(asset.uri, asset.base64);
        router.push({
          pathname: '/preview',
          params: {
            uri: persisted,
            isCustom: 'true',
            cropId: searchParams.cropId || 'auto',
          },
        });
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть галерею');
    }
  };

  const captureWebFrame = (): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const zoomScale = 1.0 + nativeZoomValue * 3.5;
    if (zoomScale > 1) {
      const cropW = video.videoWidth / zoomScale;
      const cropH = video.videoHeight / zoomScale;
      const cropX = (video.videoWidth - cropW) / 2;
      const cropY = (video.videoHeight - cropH) / 2;
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const captureNativeFrame = async (): Promise<string | null> => {
    if (!cameraRef.current) return null;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.85,
      base64: true,
      skipProcessing: false,
      shutterSound: false,
    });
    if (!photo?.uri && !photo?.base64) return null;
    // Persist immediately with base64 into app documents directory so Android cache cleanup / permissions never break it!
    const persisted = await persistImage(photo.uri, photo.base64);
    return persisted;
  };

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      let photoUri: string | null = null;

      if (isWeb) {
        photoUri = captureWebFrame();
      } else {
        if (!permission?.granted) {
          const res = await requestPermission();
          if (!res.granted) {
            Alert.alert(
              'Доступ к камере',
              'Пожалуйста, предоставьте приложению доступ к камере для съёмки растения.'
            );
            return;
          }
        }
        photoUri = await captureNativeFrame();
      }

      if (photoUri) {
        router.push({
          pathname: '/preview',
          params: {
            uri: photoUri,
            isCustom: 'true',
            cropId: searchParams.cropId || 'auto',
          },
        });
        return;
      }

      throw new Error('Камера не вернула снимок');
    } catch (err: any) {
      Alert.alert(
        'Ошибка съёмки',
        'Не удалось получить кадр с камеры. Вы можете выбрать фото растения из галереи.',
        [
          { text: 'Открыть галерею', onPress: handlePickFromGallery },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    if (!isWeb && !permission?.granted) {
      requestPermission();
      return;
    }
    setFlashOn((prev) => !prev);
  };

  const isCameraActive = isWeb ? webStreamReady : Boolean(permission?.granted);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 1. Real Camera Viewport (Web video or Native CameraView) with Pinch-to-zoom support */}
      <View style={styles.viewfinderViewport} {...panResponder.panHandlers}>
        {isWeb ? (
          webStreamReady ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${1.0 + nativeZoomValue * 3.5})`,
                  transition: isPinching ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
                }}
              />
            </div>
          ) : (
            <View style={styles.permissionContainer}>
              <View style={styles.permissionBadge}>
                <Camera size={38} color="#4ADE80" strokeWidth={2.2} />
              </View>
              <Text style={styles.permissionTitle}>
                {i18n.t('scan.permission_title', {
                  defaultValue: 'Для съёмки требуется доступ к камере',
                })}
              </Text>
              <Text style={styles.permissionSubtitle}>
                {webError ||
                  i18n.t('scan.permission_desc', {
                    defaultValue:
                      'Разрешите приложению использовать камеру для точной AI-диагностики',
                  })}
              </Text>
              <Pressable
                onPress={() => {
                  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
                    navigator.mediaDevices
                      .getUserMedia({ video: true })
                      .then((s) => {
                        if (videoRef.current) {
                          videoRef.current.srcObject = s;
                          videoRef.current.play().catch(() => {});
                        }
                        setWebStreamReady(true);
                        setWebError(null);
                      })
                      .catch((e) => setWebError(e.message));
                  }
                }}
                style={styles.permissionButton}
                accessibilityRole="button">
                <Camera size={18} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.permissionButtonText}>
                  {i18n.t('scan.enable_camera', { defaultValue: 'Включить камеру' })}
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePickFromGallery}
                style={styles.gallerySecondaryBtn}
                accessibilityRole="button">
                <ImageIcon size={18} color="#A7F3D0" strokeWidth={2.2} />
                <Text style={styles.gallerySecondaryBtnText}>
                  {i18n.t('scan.pick_gallery', { defaultValue: 'Выбрать фото из галереи' })}
                </Text>
              </Pressable>
            </View>
          )
        ) : permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flashOn ? 'on' : 'off'}
            enableTorch={flashOn}
            mute={true}
            zoom={nativeZoomValue}
            onCameraReady={() => setIsCameraReady(true)}
          />
        ) : (
          <View style={styles.permissionContainer}>
            <View style={styles.permissionBadge}>
              <Camera size={38} color="#4ADE80" strokeWidth={2.2} />
            </View>
            <Text style={styles.permissionTitle}>
              {i18n.t('scan.permission_title', {
                defaultValue: 'Для съёмки требуется доступ к камере',
              })}
            </Text>
            <Text style={styles.permissionSubtitle}>
              {i18n.t('scan.permission_desc', {
                defaultValue:
                  'Разрешите приложению использовать камеру для точной AI-диагностики',
              })}
            </Text>
            <Pressable
              onPress={() => requestPermission()}
              style={styles.permissionButton}
              accessibilityRole="button">
              <Camera size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.permissionButtonText}>
                {i18n.t('scan.enable_camera', { defaultValue: 'Включить камеру' })}
              </Text>
            </Pressable>
            <Pressable
              onPress={handlePickFromGallery}
              style={styles.gallerySecondaryBtn}
              accessibilityRole="button">
              <ImageIcon size={18} color="#A7F3D0" strokeWidth={2.2} />
              <Text style={styles.gallerySecondaryBtnText}>
                {i18n.t('scan.pick_gallery', { defaultValue: 'Выбрать фото из галереи' })}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Floating Pinch-to-Zoom Indicator HUD */}
        {showPinchBadge && (
          <View style={styles.pinchZoomBadge} pointerEvents="none">
            <Text style={styles.pinchZoomBadgeText}>
              {(1.0 + nativeZoomValue * 3.5).toFixed(1)}x
            </Text>
          </View>
        )}
      </View>

      {/* 2. Top Controls Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => safeBack(router, '/(tabs)')}
          style={styles.circleBtn}
          hitSlop={8}
          accessibilityLabel="Закрыть">
          <X size={20} color={colors.white} strokeWidth={2.4} />
        </Pressable>

        {/* Centered Instruction Banner */}
        <View style={styles.instructionPill}>
          <Text style={styles.instructionTitle}>
            {language === 'kk'
              ? 'Камераны өсімдік жапырағына бағыттаңыз'
              : language === 'en'
              ? 'Point camera at the plant leaf'
              : 'Наведите камеру на лист растения'}
          </Text>
          <Text style={styles.instructionSubtitle}>
            {language === 'kk'
              ? 'Жапырақты фокуста ұстаңыз'
              : language === 'en'
              ? 'Keep the leaf in sharp focus'
              : 'Держите растение в фокусе'}
          </Text>
        </View>

        <View style={styles.topRightBtns}>
          <Pressable
            onPress={toggleFlash}
            style={[styles.circleBtn, flashOn && styles.circleBtnActive]}
            hitSlop={8}
            accessibilityLabel="Вспышка">
            {flashOn ? (
              <Zap size={20} color={colors.white} fill={colors.white} strokeWidth={2.2} />
            ) : (
              <ZapOff size={20} color={colors.white} strokeWidth={2.2} />
            )}
          </Pressable>

          <Pressable
            onPress={handlePickFromGallery}
            style={styles.circleBtn}
            hitSlop={8}
            accessibilityLabel="Галерея">
            <ImageIcon size={20} color={colors.white} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      {/* 3. Target Focus Reticle & Real Zoom Controller */}
      {isCameraActive ? (
        <View pointerEvents="box-none" style={styles.viewfinderCenterArea}>
          <View pointerEvents="none" style={styles.focusFrame}>
            {/* Top-Left Bracket */}
            <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
            {/* Top-Right Bracket */}
            <View style={[styles.cornerBracket, styles.bracketTopRight]} />
            {/* Bottom-Left Bracket */}
            <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
            {/* Bottom-Right Bracket */}
            <View style={[styles.cornerBracket, styles.bracketBottomRight]} />
            {/* Center Target Indicator */}
            <View style={styles.centerReticleDot} />
          </View>

          {/* Real Zoom Controls Pill */}
          <View style={styles.zoomPill}>
            {(['1x', '2x', '3x'] as ZoomKey[]).map((key) => {
              const isActive = zoom === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleZoomChange(key)}
                  style={[styles.zoomItem, isActive && styles.zoomItemActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Увеличение ${ZOOM_CONFIG[key].label}`}>
                  <Text style={[styles.zoomText, isActive && styles.zoomTextActive]}>
                    {ZOOM_CONFIG[key].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 4. Bottom Controls Area */}
      <View style={styles.bottomControlsContainer}>
        {/* Shutter & Actions Row */}
        <View style={styles.shutterRow}>
          {/* Gallery Shortcut Button */}
          <Pressable
            onPress={handlePickFromGallery}
            style={styles.thumbnailWrapper}
            accessibilityLabel="Галерея">
            <ImageIcon size={22} color="#FFFFFF" strokeWidth={2.2} />
          </Pressable>

          {/* Large Double-Ring Shutter Button */}
          <Pressable
            onPress={handleCapture}
            disabled={isCapturing}
            style={({ pressed }) => [
              styles.shutterOuter,
              pressed && styles.shutterPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Сделать снимок">
            <View style={[styles.shutterInner, isCapturing && styles.shutterInnerCapturing]} />
          </Pressable>

          {/* Switch Camera Button */}
          <Pressable
            onPress={toggleFacing}
            style={styles.circleBtn}
            hitSlop={8}
            accessibilityLabel="Сменить камеру">
            <RefreshCw size={22} color={colors.white} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Mode Switcher Pill */}
        <View style={styles.modeSwitcherPill}>
          <Pressable
            style={[styles.modeTab, styles.modeTabActive]}
            accessibilityRole="button">
            <Text style={styles.modeTextActive}>
              {language === 'kk' ? 'Фото' : language === 'en' ? 'Photo' : 'Фото'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePickFromGallery}
            style={styles.modeTab}
            accessibilityRole="button">
            <Text style={styles.modeTextInactive}>
              {language === 'kk' ? 'Галерея' : language === 'en' ? 'Gallery' : 'Из галереи'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A120D',
    justifyContent: 'space-between',
  },
  viewfinderViewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050A07',
    overflow: 'hidden',
  },
  pinchZoomBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 18, 13, 0.85)',
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 8,
  },
  pinchZoomBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(12, 22, 16, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnActive: {
    backgroundColor: '#15803D',
    borderColor: '#4ADE80',
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionPill: {
    backgroundColor: 'rgba(12, 22, 16, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: 240,
  },
  instructionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
    textAlign: 'center',
  },
  viewfinderCenterArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  focusFrame: {
    width: 270,
    height: 270,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerReticleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerBracket: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: colors.white,
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 20,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 20,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 20,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 20,
  },
  zoomPill: {
    position: 'absolute',
    transform: [{ translateY: 172 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 22, 16, 0.78)',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  zoomItem: {
    minWidth: 36,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  zoomItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  zoomText: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '600',
  },
  zoomTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  bottomControlsContainer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  shutterRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(20, 32, 23, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
  shutterInnerCapturing: {
    backgroundColor: '#4ADE80',
    transform: [{ scale: 0.85 }],
  },
  shutterPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  modeSwitcherPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(12, 22, 16, 0.75)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeTab: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 20,
  },
  modeTabActive: {
    backgroundColor: '#15803D',
  },
  modeTextActive: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.white,
  },
  modeTextInactive: {
    fontSize: 13.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#0F1A12',
  },
  permissionBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gallerySecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gallerySecondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#E2E8F0',
  },
});
