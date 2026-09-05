import { useState, useEffect } from 'react';
import { Send, Bell, Smartphone, Key, AlertCircle, CheckCircle2, Loader2, ExternalLink, Sparkles, Flame, Sun, Film, Compass, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const PRESET_TEMPLATES = [
  {
    id: 'new_drop',
    category: 'New Drop',
    icon: Sparkles,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    title: '✨ Fresh Preset Drop: [Preset Name]',
    message: 'Level up your photos! The new [Preset Name] Lightroom preset is now live and 100% free to import.',
    image_url: ''
  },
  {
    id: 'moody_cinematic',
    category: 'Moody / Film',
    icon: Film,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    title: '🎬 New Moody Cinematic Preset Available',
    message: 'Give your shots an editorial film look in 1 tap. Open Presetify to import into Adobe Lightroom Mobile now.',
    image_url: ''
  },
  {
    id: 'golden_hour',
    category: 'Golden Hour',
    icon: Sun,
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    title: '🌅 Golden Hour Warm Tones Just Arrived',
    message: 'Capture sunset magic on every photo. Download the latest free .DNG preset in Presetify today!',
    image_url: ''
  },
  {
    id: 'trending',
    category: 'Trending',
    icon: Flame,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    title: '🔥 Community Favorite: [Preset Name]',
    message: 'Over 5,000+ creators imported this preset this week. Tap to get your free .DNG copy now!',
    image_url: ''
  },
  {
    id: 'travel_vibes',
    category: 'Travel & Urban',
    icon: Compass,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    title: '✈️ Wanderlust Tones for Your Travel Photos',
    message: 'Turn everyday holiday shots into stunning postcards. Tap to open Presetify and edit in Lightroom.',
    image_url: ''
  }
];

const PushNotifications = () => {
  const [credentials, setCredentials] = useState({
    onesignal_app_id: '',
    onesignal_rest_api_key: '',
    onesignal_rest_api_key_masked: ''
  });

  const [notification, setNotification] = useState({
    title: '',
    message: '',
    image_url: '',
    launch_url: ''
  });

  const [stats, setStats] = useState({
    total_devices: 0,
    onesignal_subscribers: null
  });

  const [recentPresets, setRecentPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [settingsRes, statsRes, presetsRes] = await Promise.all([
        api.get('get_settings.php'),
        api.get('get_dashboard_stats.php'),
        api.get('list_wallpapers.php?page=1&limit=6').catch(() => ({ data: { data: [] } }))
      ]);

      if (settingsRes.data.status && settingsRes.data.data) {
        const d = settingsRes.data.data;
        setCredentials({
          onesignal_app_id: d.onesignal_app_id || '2a1dbe99-41cf-4bc3-a8be-c4bcf089ce5b',
          onesignal_rest_api_key: '',
          onesignal_rest_api_key_masked: d.onesignal_rest_api_key_masked || ''
        });
      }

      if (statsRes.data.status && statsRes.data.data) {
        setStats({
          total_devices: statsRes.data.data.total_devices || 0,
          onesignal_subscribers: statsRes.data.data.onesignal_subscribers
        });
      }

      if (presetsRes.data && Array.isArray(presetsRes.data.data)) {
        setRecentPresets(presetsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tmpl, preset = null) => {
    setActiveTemplateId(tmpl.id);
    const presetName = preset ? preset.title : 'Vintage Film';
    const presetUrl = preset ? `https://api.devkayy.in/${preset.thumbnail_path}` : notification.image_url;

    const populatedTitle = tmpl.title.replace(/\[Preset Name\]/g, presetName);
    const populatedMessage = tmpl.message.replace(/\[Preset Name\]/g, presetName);

    setNotification((prev) => ({
      ...prev,
      title: populatedTitle,
      message: populatedMessage,
      image_url: presetUrl || prev.image_url
    }));
  };

  const handlePickPreset = (preset) => {
    const fullImgUrl = `https://api.devkayy.in/${preset.thumbnail_path}`;
    setNotification((prev) => {
      let title = prev.title;
      let message = prev.message;
      if (!title) {
        title = `✨ New Preset: ${preset.title}`;
      } else {
        title = title.replace(/\[Preset Name\]/g, preset.title);
      }
      if (!message) {
        message = `Download "${preset.title}" (${preset.category_name || 'Free'}) now in Presetify and import straight to Lightroom!`;
      } else {
        message = message.replace(/\[Preset Name\]/g, preset.title);
      }
      return {
        ...prev,
        title,
        message,
        image_url: fullImgUrl
      };
    });
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setSavingCreds(true);
    setStatusMessage(null);

    try {
      const payload = {
        onesignal_app_id: credentials.onesignal_app_id
      };
      if (credentials.onesignal_rest_api_key) {
        payload.onesignal_rest_api_key = credentials.onesignal_rest_api_key;
      }

      const res = await api.post('update_settings.php', payload);
      if (res.data.status) {
        setStatusMessage({ type: 'success', text: 'OneSignal credentials saved to database!' });
        fetchInitialData();
      } else {
        setStatusMessage({ type: 'error', text: res.data.message || 'Failed to save credentials' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Server communication error while saving credentials' });
    } finally {
      setSavingCreds(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notification.title.trim() || !notification.message.trim()) {
      setStatusMessage({ type: 'error', text: 'Notification title and message are required.' });
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      const res = await api.post('send_push_notification.php', notification);
      if (res.data.status) {
        setStatusMessage({
          type: 'success',
          text: `Notification delivered successfully! (Targeted: ${res.data.recipients ?? 'Active subscribers'})`
        });
        setNotification({
          title: '',
          message: '',
          image_url: '',
          launch_url: ''
        });
      } else {
        setStatusMessage({ type: 'error', text: res.data.message || 'Failed to send notification' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error occurred while dispatching notification via OneSignal.'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Bell className="text-gray-900" size={28} />
            Push Notifications
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Send real-time alerts & new preset updates directly to installed Android devices.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/60 px-4 py-2.5 rounded-2xl">
          <Smartphone size={20} className="text-indigo-600" />
          <div>
            <div className="text-xs text-gray-500 font-medium">Installed Devices</div>
            <div className="text-lg font-bold text-gray-900">{stats.total_devices} Devices</div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200/70'
              : 'bg-red-50 text-red-900 border-red-200/70'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-red-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Send Notification Form */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Send size={18} className="text-gray-800" />
              Compose Notification
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Dispatches instantly to all subscribed user devices.</p>
          </div>

          {/* Preset Notification Format / Templates */}
          <div className="space-y-3 bg-gradient-to-br from-gray-50 to-indigo-50/30 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Preset Notification Formats &amp; Templates
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_TEMPLATES.map((tmpl) => {
                const IconComponent = tmpl.icon;
                const isSelected = activeTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white hover:bg-gray-100/80 text-gray-800 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`p-1 rounded-md ${isSelected ? 'bg-gray-800 text-amber-300' : tmpl.badgeColor}`}>
                        <IconComponent size={13} />
                      </span>
                      <span className="text-xs font-bold truncate">{tmpl.category}</span>
                    </div>
                    <div className={`text-xs font-semibold truncate ${isSelected ? 'text-gray-200' : 'text-gray-900'}`}>
                      {tmpl.title}
                    </div>
                    <div className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tmpl.message}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Live Preset Autofill */}
            {recentPresets.length > 0 && (
              <div className="pt-3 border-t border-gray-200/60 mt-2">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ImageIcon size={12} />
                  Insert Live Preset &amp; Banner from Library:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePickPreset(preset)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 transition active:scale-95 shadow-2xs"
                      title={`Autofill title & image for "${preset.title}"`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="truncate max-w-[120px]">{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendNotification} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Notification Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={notification.title}
                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                placeholder="e.g. 🌟 New Dark Moody Preset Just Dropped!"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 text-sm font-medium transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notification.message}
                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                rows={3}
                placeholder="e.g. Download the latest cinematic tones preset for free inside the Presetify app."
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 text-sm transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Big Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={notification.image_url}
                  onChange={(e) => setNotification({ ...notification, image_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Launch URL / Deep Link (Optional)
                </label>
                <input
                  type="url"
                  value={notification.launch_url}
                  onChange={(e) => setNotification({ ...notification, launch_url: e.target.value })}
                  placeholder="https://presetify.devkayy.in/"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 text-sm transition"
                />
              </div>
            </div>

            {/* Notification Live Preview */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/60 mt-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Android Notification Preview</div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  .DNG
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-0.5">
                    <span className="font-semibold text-gray-700">Presetify</span>
                    <span>now</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {notification.title || 'Notification Title'}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                    {notification.message || 'Notification message will appear here in device notifications.'}
                  </div>
                  {notification.image_url && (
                    <div className="mt-2.5 rounded-lg overflow-hidden max-h-36 bg-gray-100">
                      <img
                        src={notification.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-98 shadow-lg shadow-gray-900/20 disabled:opacity-50"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Send Push Notification
            </button>
          </form>
        </div>

        {/* Right Column: OneSignal Credentials & Config from DB */}
        <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Key size={18} className="text-gray-800" />
              OneSignal Credentials (Database)
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Fetched from and stored directly in your database settings.
            </p>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                OneSignal App ID
              </label>
              <input
                type="text"
                value={credentials.onesignal_app_id}
                onChange={(e) => setCredentials({ ...credentials, onesignal_app_id: e.target.value })}
                placeholder="2a1dbe99-41cf-4bc3-a8be-c4bcf089ce5b"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 text-xs font-mono transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                OneSignal REST API Key
              </label>
              <input
                type="password"
                value={credentials.onesignal_rest_api_key}
                onChange={(e) => setCredentials({ ...credentials, onesignal_rest_api_key: e.target.value })}
                placeholder={credentials.onesignal_rest_api_key_masked ? `Masked: ${credentials.onesignal_rest_api_key_masked}` : 'Enter OneSignal REST API Key'}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 text-xs font-mono transition"
              />
              <p className="text-xs text-gray-400 mt-1">
                Find this in OneSignal Dashboard &gt; App &gt; Settings &gt; Keys &amp; IDs &gt; REST API Key.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingCreds}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition duration-200 active:scale-95 disabled:opacity-50 text-sm"
            >
              {savingCreds ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              Save OneSignal Keys
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100/80">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              OneSignal Status
            </h4>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">App ID:</span>
                <span className="font-mono text-gray-800 truncate max-w-[170px]" title={credentials.onesignal_app_id}>
                  {credentials.onesignal_app_id || 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">REST API Key:</span>
                <span className="font-mono text-gray-800">
                  {credentials.onesignal_rest_api_key_masked ? 'Configured ✅' : 'Missing ⚠️'}
                </span>
              </div>
              {stats.onesignal_subscribers !== null && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                  <span className="text-gray-500">Active Subscribers:</span>
                  <span className="font-bold text-emerald-600">{stats.onesignal_subscribers}</span>
                </div>
              )}
            </div>

            <a
              href="https://dashboard.onesignal.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Open OneSignal Dashboard <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotifications;
