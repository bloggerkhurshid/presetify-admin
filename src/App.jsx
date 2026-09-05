import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import AdMob from './pages/AdMob';
import PushNotifications from './pages/PushNotifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const auth = localStorage.getItem('isAdmin');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <div className="relative">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/notifications" element={<PushNotifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admob" element={<AdMob />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>

        {/* Global Popup Login Overlay */}
        {!isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-500">
            <Login setAuth={setIsAuthenticated} />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
