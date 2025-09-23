'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { Camera, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
}

interface AbsenData {
  userId: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  accuracy: number;
  address: string;
}

export default function AbsenPage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userId, setUserId] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    return new Promise<LocationData>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung browser ini'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            // Reverse geocoding untuk mendapatkan alamat
            // const key=process.env.OCD_API;
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=e8fee8693cd845abb367177172d99eed`
            );
            
            let address = `${latitude}, ${longitude}`;
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                address = data.results[0].formatted;
              }
            }
            
            resolve({
              latitude,
              longitude,
              accuracy: accuracy || 0,
              address
            });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            // Fallback jika reverse geocoding gagal
            resolve({
              latitude,
              longitude,
              accuracy: accuracy || 0,
              address: `${latitude}, ${longitude}`
            });
          }
        },
        (error) => {
          let errorMessage = 'Gagal mendapatkan lokasi';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Akses lokasi ditolak. Mohon izinkan akses lokasi.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informasi lokasi tidak tersedia.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Request lokasi timeout.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setIsCapturing(true);
      setMessage(null);

      // Get location first
      const locationData = await getCurrentLocation();
      setLocation(locationData);

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // front camera for selfie
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal mengakses kamera atau lokasi'
      });
      setIsCapturing(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoDataUrl(dataUrl);

    // Stop camera
    stopCamera();
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  // Submit absen
  const submitAbsen = async () => {
    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'User ID wajib diisi' });
      return;
    }

    if (!location || !photoDataUrl) {
      setMessage({ type: 'error', text: 'Foto dan lokasi harus tersedia' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const absenData: AbsenData = {
        userId: userId.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        photoUrl: photoDataUrl,
        accuracy: location.accuracy,
        address: location.address
      };

      const response = await fetch('/api/absen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(absenData),
      });

      if (response.status == 409) {
        throw new Error('Gagal submit absen, sudah absen hari ini, coba lagi nanti');
      }

      const result = await response.json();
      console.log('Absen berhasil:', result);

      setMessage({ type: 'success', text: 'Absen berhasil disimpan!' });
      
      // Reset form
      setPhotoDataUrl('');
      setLocation(null);
      setUserId('');
      
    } catch (error) {
      console.error('Error submitting absen:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal submit absen'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset all
  const resetForm = () => {
    setPhotoDataUrl('');
    setLocation(null);
    setMessage(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-6 h-6" />
            <h1 className="text-xl font-bold">Absen Online</h1>
          </div>
          <p className="text-blue-100 text-center mt-1 text-sm">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* User ID Input */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Masukkan User ID"
              disabled={isCapturing || isSubmitting}
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Camera Section */}
          <div className="space-y-4">
            {!isCapturing && !photoDataUrl && (
              <button
                onClick={startCamera}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>Mulai Ambil Foto</span>
              </button>
            )}

            {/* Video Preview */}
            {isCapturing && (
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-3">
                  <button
                    onClick={capturePhoto}
                    className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-full shadow-lg transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Photo Preview */}
            {photoDataUrl && (
              <div className="space-y-3">
                <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={photoDataUrl}
                    alt="Captured photo"
                    className="w-full h-64 object-cover"
                    width={640}
                    height={480}
                  />
                </div>
                <button
                  onClick={() => {
                    setPhotoDataUrl('');
                    startCamera();
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 rounded-xl transition-colors"
                >
                  Ambil Ulang Foto
                </button>
              </div>
            )}

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Location Info */}
          {location && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Lokasi Terdeteksi</p>
                  <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Akurasi: {location.accuracy.toFixed(0)}m
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {photoDataUrl && location && userId.trim() && (
              <button
                onClick={submitAbsen}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Absen</span>
                  </>
                )}
              </button>
            )}

            {(photoDataUrl || location) && !isCapturing && (
              <button
                onClick={resetForm}
                disabled={isSubmitting}
                className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 rounded-xl transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}