import React, { useState, useEffect, useRef } from 'react';
import { Linking, Image,StyleSheet, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';
import { uploadAvatar } from '@/utils/profilesService';
import { PixelButton } from '@/components/PixelButton';
import { PixelText } from '@/components/PixelText';
import {useIsFocused} from "@react-navigation/native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    CameraView.isAvailableAsync().then(setHasCamera);
  }, []);

  const openSettings = () => Linking.openSettings();

  const toggleFacing = () => setFacing(facing === 'front' ? 'back' : 'front');
  const toggleFlash = () => setFlash(flash === 'off' ? 'on' : 'off');

  const handleMountError = () => setMountError('No se pudo iniciar la cámara');

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady || uploading) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      setPreview(photo.uri);
    } catch {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const confirmUpload = async () => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');
      let uri = preview!;
      // Si es web, convertir a Blob (opcional)
      const { url, error } = await uploadAvatar(user.id, uri);
      if (error || !url) throw new Error('No se pudieron subir los datos');
      router.replace('/profile');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudieron subir los datos');
    } finally {
      setUploading(false);
    }
  };

  // Renderizado de estados
  if (!permission) return <View style={styles.container}><PixelText>Cargando cámara...</PixelText></View>;
  if (permission.status === 'denied' && !permission.canAskAgain)
    return <View style={styles.container}>
      <PixelText>Se necesita permiso para usar la cámara</PixelText>
      <PixelButton title="Go settings" onPress={openSettings} />
      <PixelButton title="Cancel" onPress={() => router.back()} />
    </View>;
  if (!permission.granted)
    return <View style={styles.container}>
      <PixelText>Se necesita permiso para usar la cámara</PixelText>
      <PixelButton title="Give permission" onPress={requestPermission} />
      <PixelButton title="Cancel" onPress={() => router.back()} />
    </View>;
  if (!hasCamera)
    return <View style={styles.container}>
      <PixelText>No se encontró cámara en el dispositivo</PixelText>
      <PixelButton title="Volver" onPress={() => router.back()} />
    </View>;
  if (mountError)
    return <View style={styles.container}>
      <PixelText>{mountError}</PixelText>
      <PixelButton title="Retry" onPress={() => setMountError(null)} />
      <PixelButton title="Cancel" onPress={() => router.back()} />
    </View>;
  if (preview)
    return <View style={styles.container}>
      <Image source={{ uri: preview }} style={styles.camera} />
      <View style={styles.buttonContainer}>
        <PixelButton title="Repeat" onPress={() => setPreview(null)} disabled={uploading} />
        <PixelButton title="Confirm" onPress={confirmUpload} disabled={uploading} />
      </View>
      {uploading && <PixelText>Cargando...</PixelText>}
    </View>;

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing={facing}
          flash={facing === 'back' ? flash : 'off'}
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={handleMountError}
          ratio="4:3"
          active={isFocused}
        />
      )}
      <View style={styles.buttonContainer}>
        <PixelButton title="Take Photo" onPress={takePicture} disabled={!isCameraReady || uploading} />
        <PixelButton title="Cambiar Cámara" onPress={toggleFacing} />
        {facing === 'back' && (
          <PixelButton title={flash === 'off' ? 'Flash Apagado' : 'Flash Encendido'} onPress={toggleFlash} />
        )}
        <PixelButton title="Cancelar" onPress={() => router.back()} />
      </View>
    </View>
  );
}
// Estilos
// ...estilos igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
});