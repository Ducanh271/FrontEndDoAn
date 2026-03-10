import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

export default function Register() {
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    name: '',
    email: '',
    department_id: 1, // Tạm fix cứng phòng ban 1
    position_id: 1,
  });

  const [images, setImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Xử lý khi gõ vào ô input
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm chụp 5 tấm ảnh liên tiếp
  const captureFaces = async () => {
    setIsCapturing(true);
    setImages([]); // Reset ảnh cũ
    setResult(null);

    let capturedImages = [];
    for (let i = 0; i < 5; i++) {
      // Dừng 0.5s giữa mỗi lần chụp để có góc mặt khác nhau xíu
      await new Promise(resolve => setTimeout(resolve, 500));

      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        capturedImages.push(imageSrc);
        setImages(prev => [...prev, imageSrc]); // Cập nhật UI ngay lập tức
      }
    }

    setIsCapturing(false);
  };

  // Hàm Submit gửi lên Golang
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < 5) {
      alert("Vui lòng quét đủ 5 khuôn mặt trước khi đăng ký!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Ép kiểu ID về số nguyên (tránh lỗi JSON)
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id),
        position_id: parseInt(formData.position_id),
        images: images,
      };

      const response = await axios.post('http://localhost:8080/api/employees/register', payload);

      setResult({ type: 'success', data: response.data });
      setImages([]); // Thành công thì xóa ảnh cũ đi

    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        // Hứng lỗi từ AI (như thiếu mặt, fake, liveness rớt)
        setResult({ type: 'error', data: error.response.data });
      } else {
        setResult({ type: 'error', data: { message: "Lỗi kết nối đến máy chủ Backend!" } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* CỘT 1: FORM THÔNG TIN */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng Ký Nhân Viên (DeepGuard)</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã Nhân Viên</label>
              <input type="text" name="employee_code" required onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <input type="text" name="name" required onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" required onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* THÊM DROP DOWN CHỌN PHÒNG BAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phòng Ban</label>
              <select name="department_id" onChange={handleInputChange} value={formData.department_id}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value={1}>Phòng IT</option>
                <option value={2}>Phòng Nhân Sự</option>
                <option value={3}>Phòng Kinh Doanh</option>
              </select>
            </div>

            {/* THÊM DROP DOWN CHỌN CHỨC VỤ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Chức Vụ</label>
              <select name="position_id" onChange={handleInputChange} value={formData.position_id}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value={1}>Intern</option>
                <option value={2}>Fresher</option>
                <option value={3}>Manager</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || images.length < 5}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium 
                ${(loading || images.length < 5) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Đang phân tích AI...' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>
          {/* HIỂN THỊ KẾT QUẢ */}
          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-medium ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {result.data.message}
              </h3>
              {result.data.stats && (
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Ảnh hợp lệ: {result.data.stats.valid_faces}/5</li>
                  <li>Liveness (Người thật): {result.data.stats.liveness_pass}/5</li>
                  <li>Deepfake Pass: {result.data.stats.deepfake_pass}/5</li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* CỘT 2: CAMERA & ẢNH */}
        <div className="flex flex-col items-center">
          <div className="border-4 border-dashed border-gray-300 rounded-lg overflow-hidden relative bg-black w-full aspect-video flex items-center justify-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }} // Dùng camera trước
              className="w-full h-full object-cover"
            />
            {isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-bold text-xl">
                Đang quét khuôn mặt...
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={captureFaces}
            disabled={isCapturing}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
          >
            📸 Quét Khuôn Mặt (Chụp 5 ảnh)
          </button>

          {/* HIỂN THỊ 5 ẢNH PREVIEW */}
          <div className="mt-4 flex gap-2 w-full justify-center">
            {images.map((img, idx) => (
              <img key={idx} src={img} alt={`face-${idx}`} className="w-16 h-16 object-cover rounded-md border-2 border-indigo-200 shadow-sm" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
