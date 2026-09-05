import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import api from '../api';

const AdMob = () => {
  const [settings, setSettings] = useState({
    app_id: '',
    interstitial_id: '',
    interstitial_status: 0,
    rewarded_id: '',
    rewarded_status: 0,
    banner_id: '',
    banner_status: 0,
    native_id: '',
    native_status: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('admob.php');
      if (res.data.status && res.data.config) {
        const config = res.data.config;
        setSettings({
          app_id: config.app_id,
          interstitial_id: config.ads.interstitial.id,
          interstitial_status: config.ads.interstitial.enabled ? 1 : 0,
          rewarded_id: config.ads.rewarded.id,
          rewarded_status: config.ads.rewarded.enabled ? 1 : 0,
          banner_id: config.ads.banner.id,
          banner_status: config.ads.banner.enabled ? 1 : 0,
          native_id: config.ads.native.id,
          native_status: config.ads.native.enabled ? 1 : 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await api.post('admob.php', settings);
      if (res.data.status) {
        setMessage('AdMob config saved successfully!');
      } else {
        setMessage('Error saving config.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to connect to server.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const AdUnit = ({ title, idName, statusName }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 hover:border-gray-300 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-semibold text-gray-800 tracking-tight">{title}</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name={statusName}
            checked={settings[statusName] === 1}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
        </label>
      </div>
      <input
        type="text"
        name={idName}
        value={settings[idName]}
        onChange={handleChange}
        placeholder="ca-app-pub-..."
        className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm font-mono"
      />
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">AdMob Config</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage monetization and ad units</p>
        </div>
      </div>

      {message && (
        <div className="bg-green-50/80 backdrop-blur-sm text-green-800 p-4 rounded-2xl shadow-sm border border-green-200/50 font-medium flex items-center justify-center animate-in fade-in slide-in-from-top-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 sm:p-8 space-y-8">
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 tracking-wide uppercase">App ID</label>
          <input
            type="text"
            name="app_id"
            value={settings.app_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm font-mono"
            placeholder="ca-app-pub-..."
          />
        </div>

        <div className="border-t border-gray-100/50"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdUnit title="Interstitial Ad" idName="interstitial_id" statusName="interstitial_status" />
          <AdUnit title="Rewarded Ad" idName="rewarded_id" statusName="rewarded_status" />
          <AdUnit title="Banner Ad" idName="banner_id" statusName="banner_status" />
          <AdUnit title="Native Ad" idName="native_id" statusName="native_status" />
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-900/20 disabled:opacity-70 disabled:scale-100"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdMob;
