import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, LogOut, User, Home, Settings, UserPlus } from 'lucide-react';
import Login from './Login';
import Register from './Register';

const Navigation: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  return (
    <>
      <nav className="bg-fitness-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Dumbbell className="h-8 w-8 text-fitness-red" />
                <span className="text-white font-bold text-xl">Phi Nguyễn PT</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-fitness-red text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>

              {user ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin') 
                          ? 'bg-fitness-red text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/dashboard') 
                          ? 'bg-fitness-red text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-3">
                    <span className="text-gray-300 text-sm">
                      Xin chào, {user.fullName}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-600 hover:border-gray-500"
                  >
                    <User className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-fitness-red to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Đăng ký</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}
      {showRegister && (
        <Register 
          onClose={() => setShowRegister(false)} 
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  );
};

export default Navigation;