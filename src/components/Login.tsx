import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        onClose();
      } else {
        // Hiển thị thông báo lỗi cụ thể
        setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.');
      }
    } catch (err: any) {
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.';
      
      if (err?.message) {
        if (err.message.includes('Invalid login credentials') || 
            err.message.includes('Invalid email or password')) {
          errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.';
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.';
        } else if (err.message.includes('Too many requests')) {
          errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng đợi một lúc rồi thử lại.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-fitness-red to-red-600 rounded-full p-3 mr-3">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-fitness-black">Đăng nhập</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fitness-red focus:border-transparent"
                placeholder="Nhập email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fitness-red focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Đăng nhập thất bại
                    </h3>
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Tài khoản demo:</strong><br />
              Email: admin@phinpt.com<br />
              Password: admin123
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-fitness-red to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>

            {onSwitchToRegister && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister();
                    }}
                    className="text-fitness-red hover:text-red-700 font-medium"
                    disabled={isLoading}
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;