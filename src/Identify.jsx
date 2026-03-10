// src/Identify.jsx
import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function Identify() {
  const webcamRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const captureAndIdentify = async () => {
    setIsCapturing(true);
    setImages([]);
    setResult(null);

    let capturedImages = [];
    // Chụp 3 tấm ảnh
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        capturedImages.push(imageSrc);
        setImages(prev => [...prev, imageSrc]);
      }
    }
    setIsCapturing(false);

    // Bắt đầu gửi API để nhận diện
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/attendance/identify', {
        images: capturedImages
      });

      setResult({ type: 'success', data: response.data });
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setResult({ type: 'error', data: error.response.data });
      } else {
        setResult({ type: 'error', data: { message: "Lỗi kết nối đến máy chủ Backend!" } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Hệ thống Nhận diện (DeepGuard)</h2>

      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl flex flex-col items-center">
        {/* KHUNG CAMERA */}
        <div className="border-4 border-dashed border-gray-300 rounded-lg overflow-hidden relative bg-black w-full aspect-video flex items-center justify-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            className="w-full h-full object-cover"
          />
          {isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white font-bold text-xl">
              Đang quét khuôn mặt (3 ảnh)...
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-70 text-white font-bold text-xl">
              Đang phân tích AI...
            </div>
          )}
        </div>

        <button
          onClick={captureAndIdentify}
          disabled={isCapturing || loading}
          className={`mt-6 w-full py-3 px-4 rounded-md shadow-sm text-white font-bold text-lg transition-all
            ${(isCapturing || loading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Đang xử lý...' : '👁️ Bắt đầu quét khuôn mặt'}
        </button>

        {/* HIỂN THỊ KẾT QUẢ NHẬN DIỆN */}
        {result && (
          <div className={`mt-6 w-full p-5 rounded-lg border-2 ${result.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {result.type === 'success' ? (
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">✅ Nhận diện thành công!</h3>
                <p className="text-lg text-gray-700">Xin chào, <span className="font-bold text-green-700">{result.data.employee_name}</span></p>
                <p className="text-sm text-gray-500">Mã NV: {result.data.employee_code}</p>
                <p className="text-sm text-gray-400 mt-2">Độ lệch (Distance): {result.data.distance.toFixed(4)}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">❌ Thất bại</h3>
                <p className="text-red-600">{result.data.message}</p>
                {result.data.stats && (
                  <ul className="mt-3 text-sm text-gray-600 list-disc pl-5">
                    <li>Ảnh hợp lệ: {result.data.stats.valid_faces}/3</li>
                    <li>Liveness Pass: {result.data.stats.liveness_pass}/3</li>
                    <li>Deepfake Pass: {result.data.stats.deepfake_pass}/3</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* ẢNH PREVIEW CỦA 3 LẦN CHỤP */}
        <div className="mt-4 flex gap-2 w-full justify-center">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`face-${idx}`} className="w-16 h-16 object-cover rounded-md border-2 border-green-200 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
