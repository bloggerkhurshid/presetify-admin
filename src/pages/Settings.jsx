import { useState, useEffect } from 'react';
import { Save, Loader2, Edit2, X, Check } from 'lucide-react';
import api from '../api';

const Settings = () => {
  const [settings, setSettings] = useState({
    app_name: '',
    app_icon: '',
    website: '',
    more_apps: '',
    tutorial: '',
    privacy_policy: '',
    terms_conditions: '',
    contact_email: '',
    onesignal_app_id: '',
    onesignal_rest_api_key: '',
    onesignal_rest_api_key_masked: '',
    social_links: { facebook: '', twitter: '', instagram: '' }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('get_settings.php');
      if (res.data.status && res.data.data) {
        let data = res.data.data;
        if (typeof data.social_links === 'string') {
          try { data.social_links = JSON.parse(data.social_links); } catch(e) {}
        }
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartialSave = async (payload) => {
    try {
      const isFormData = payload instanceof FormData;
      const res = await api.post('update_settings.php', payload, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      if (res.data.status) {
        fetchSettings(); // Refresh settings
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Generic Inline Edit Component
  const InlineEdit = ({ label, name, value, type = 'text', isSocial = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || '');
    const [isSaving, setIsSaving] = useState(false);

    const onSave = async () => {
      setIsSaving(true);
      let payload = {};
      
      if (isSocial) {
        payload.social_links = JSON.stringify({
          ...settings.social_links,
          [name]: tempValue
        });
      } else {
        payload[name] = tempValue;
      }

      const success = await handlePartialSave(payload);
      if (success) setIsEditing(false);
      setIsSaving(false);
    };

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-400 mb-1.5 tracking-wide uppercase">{label}</p>
          {isEditing ? (
            type === 'textarea' ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
              />
            ) : (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900/30 transition-all text-sm"
              />
            )
          ) : (
            <p className="text-gray-900 font-medium whitespace-pre-wrap break-words text-lg">
              {value ? (type === 'password' ? '••••••••••••••••' : value) : <span className="text-gray-300 italic">Not set</span>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:self-start mt-2 sm:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center justify-center bg-gray-900 hover:bg-black text-white p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
                title="Save"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button
                onClick={() => {
                  setTempValue(value || '');
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-900 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Image Inline Edit Component
  const InlineEditImage = ({ label, name, value }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const onSave = async () => {
      if (!file) {
        setIsEditing(false);
        return;
      }
      setIsSaving(true);
      const formData = new FormData();
      formData.append(name, file);

      const success = await handlePartialSave(formData);
      if (success) {
        setIsEditing(false);
        setFile(null);
      }
      setIsSaving(false);
    };

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-400 mb-2 tracking-wide uppercase">{label}</p>
          {isEditing ? (
            <input
              type="file"
              accept="*/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer"
            />
          ) : (
            <div className="flex items-center gap-3 mt-1">
              {value ? (
                <img src={`https://api.devkayy.in/${value}`} alt="App Icon" className="w-16 h-16 rounded-2xl object-cover shadow-md border border-gray-100/50" />
              ) : (
                <span className="text-gray-300 italic text-lg">No icon uploaded</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:self-start mt-2 sm:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center justify-center bg-gray-900 hover:bg-black text-white p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
                title="Save"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-900 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">App Settings</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage individual settings. Click edit to modify.</p>
        </div>
      </div>

      <div className="space-y-4">
        <InlineEdit label="App Name" name="app_name" value={settings.app_name} />
        <InlineEditImage label="App Icon" name="app_icon" value={settings.app_icon} />
        <InlineEdit label="Contact Email" name="contact_email" type="email" value={settings.contact_email} />
        <InlineEdit label="Website URL" name="website" type="url" value={settings.website} />
        <InlineEdit label="More Apps URL" name="more_apps" type="url" value={settings.more_apps} />
        <InlineEdit label="Tutorial URL" name="tutorial" type="url" value={settings.tutorial} />
        <InlineEdit label="OpenAI API Key" name="openai_api_key" type="password" value={settings.openai_api_key} />
        <InlineEdit label="OneSignal App ID" name="onesignal_app_id" value={settings.onesignal_app_id} />
        <InlineEdit label="OneSignal REST API Key" name="onesignal_rest_api_key" type="password" value={settings.onesignal_rest_api_key_masked} />
        <InlineEdit label="Privacy Policy" name="privacy_policy" type="textarea" value={settings.privacy_policy} />
        <InlineEdit label="Terms & Conditions" name="terms_conditions" type="textarea" value={settings.terms_conditions} />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Social Links</h3>
        <div className="space-y-4">
          <InlineEdit label="Facebook URL" name="facebook" value={settings.social_links?.facebook} isSocial={true} />
          <InlineEdit label="Twitter URL" name="twitter" value={settings.social_links?.twitter} isSocial={true} />
          <InlineEdit label="Instagram URL" name="instagram" value={settings.social_links?.instagram} isSocial={true} />
        </div>
      </div>

    </div>
  );
};

export default Settings;
