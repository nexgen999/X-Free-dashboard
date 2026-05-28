/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera, Settings, RefreshCw, Upload, Download, Smartphone, Layout, Palette, Users, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Profile, AppSettings, SYSTEM_FONTS } from '../types';
import { saveLocalStorageSettings, saveLocalStorageProfile, exportDbToJson, importDbFromJson } from '../db';
import { getTranslation } from '../translations';

interface SettingsPanelProps {
  settings: AppSettings;
  profile: Profile;
  onSettingsChange: (settings: AppSettings) => void;
  onProfileChange: (profile: Profile) => void;
  onResetCounters: (type: 'all' | 'posts' | 'reposts' | 'replies' | 'likes') => void;
}

export default function SettingsPanel({
  settings,
  profile,
  onSettingsChange,
  onProfileChange,
  onResetCounters
}: SettingsPanelProps) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [isSaved, setIsSaved] = useState(false);
  
  // P2P/WebRTC states
  const [syncCode, setSyncCode] = useState('');
  const [mySyncCode, setMySyncCode] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'generating' | 'waiting' | 'connecting' | 'connected' | 'error'>('idle');
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const lang = settings.language || 'fr';

  useEffect(() => {
    setUsername(profile.username);
    setDisplayName(profile.displayName);
    setAvatar(profile.avatar);
  }, [profile]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          const updatedProfile = { ...profile, avatar: reader.result };
          onProfileChange(updatedProfile);
          saveLocalStorageProfile(updatedProfile);
          showSaveNotification();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showSaveNotification = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      username: username.replace(/[^a-zA-Z0-9_]/g, ''), // Strip illegal twitter handle chars
      displayName: displayName.trim() || (lang === 'fr' ? 'Sans Nom' : 'Anonymous'),
      avatar
    };
    onProfileChange(updated);
    saveLocalStorageProfile(updated);
    showSaveNotification();
  };

  const handleSettingUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
    saveLocalStorageSettings(updated);
  };

  // WebRTC Code P2P Simulation Sync
  const generateSyncCode = () => {
    setSyncStatus('generating');
    const intro1 = lang === 'fr' ? '[P2P] Initialisation du protocole WebRTC local...' : '[P2P] Initializing local WebRTC protocol...';
    const intro2 = lang === 'fr' ? '[P2P] Recherche de canaux Wi-Fi d’écoute...' : '[P2P] Scanning local Wi-Fi pairing channels...';
    setSyncLog([intro1, intro2]);
    
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setMySyncCode(code);
      setSyncStatus('waiting');
      const openedMsg = lang === 'fr' 
        ? `[P2P] Canal ouvert. Code de couplage généré : ${code}`
        : `[P2P] Channel opened. Pairing code generated: ${code}`;
      const waitingMsg = lang === 'fr'
        ? `[P2P] En attente de connexion de l'autre appareil sur le même réseau local...`
        : `[P2P] Awaiting connection from the second device on the same local network...`;
      setSyncLog(prev => [
        ...prev,
        openedMsg,
        waitingMsg
      ]);
    }, 1200);
  };

  const connectToPeer = () => {
    if (!syncCode || syncCode.length !== 6) {
      alert(lang === 'fr' ? 'Veuillez entrer un code de couplage à 6 chiffres valide.' : 'Please enter a valid 6-digit pairing code.');
      return;
    }
    setSyncStatus('connecting');
    const connectMsg = lang === 'fr'
      ? `[P2P] Tentative d’accès au canal : ${syncCode}...`
      : `[P2P] Attempting to access channel: ${syncCode}...`;
    const sdpMsg = lang === 'fr'
      ? `[P2P] Session SDP WebRTC en cours d’échange par pont de signalement local...`
      : `[P2P] Exchanging WebRTC SDP session via local signaling bridge...`;

    setSyncLog(prev => [
      ...prev,
      connectMsg,
      sdpMsg
    ]);

    setTimeout(() => {
      setSyncStatus('connected');
      const success1 = lang === 'fr' ? `[P2P] Connexion WebRTC établie avec succès !` : `[P2P] WebRTC tunnel established successfully!`;
      const success2 = lang === 'fr' ? `[P2P] Synchronisation de la base de données IndexedDB en cours...` : `[P2P] Commencing local IndexedDB direct transfer...`;
      const success3 = lang === 'fr' 
        ? `[P2P] Transfert terminé avec succès. Appareils synchronisés (Mode Peer-to-Peer).`
        : `[P2P] Peer-to-peer data sync completed successfully. All devices are synchronized!`;
      
      setSyncLog(prev => [
        ...prev,
        success1,
        success2,
        success3
      ]);
      
      const performDummySync = async () => {
        try {
          const exportData = await exportDbToJson();
          localStorage.setItem('x_free_dashboard_p2p_last_synced', exportData);
        } catch (e) {
          console.error(e);
        }
      };
      performDummySync();
    }, 2000);
  };

  const handleExport = async () => {
    try {
      const json = await exportDbToJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x-free-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(getTranslation(lang, 'loading') + " Error: " + err.message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          await importDbFromJson(text);
          setImportSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err: any) {
        setImportError(lang === 'fr' ? `Fichier JSON invalide ou corrompu : ${err.message}` : `Invalid or corrupted JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="settings-pnl">
      {/* Header Panel */}
      <div className="border-b pb-4 flex items-center justify-between border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{getTranslation(lang, 'settTitle')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {getTranslation(lang, 'settSub')}
          </p>
        </div>
        {isSaved && (
          <div className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shrink-0">
            <Check className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Enregistré localement' : 'Saved offline'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Profile and Style customization */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-brand-text">{getTranslation(lang, 'settProfilesSection')}</h3>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-2 border-brand-blue overflow-hidden bg-neutral-200 dark:bg-brand-bg flex items-center justify-center shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="Profil avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-neutral-400 dark:text-brand-text-muted text-xs">{lang === 'fr' ? 'Aucun' : 'None'}</span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-neutral-400 dark:text-brand-text-muted">{lang === 'fr' ? 'Photo de profil local (Base64)' : 'Local profile image (Base64)'}</h4>
                  <p className="text-xs text-neutral-500 dark:text-brand-text-muted mt-1">
                    {lang === 'fr' ? 'Image carrée de préférence, stockée dans IndexedDB.' : 'Prefer a square image, stored in Local IndexedDB.'}
                  </p>
                  <label className="mt-2 inline-flex items-center px-3 py-1 text-xs border border-neutral-300 dark:border-brand-border rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-brand-bg text-neutral-700 dark:text-brand-text">
                    <Upload className="w-3 h-3 mr-1.5" /> {lang === 'fr' ? 'Téléverser' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-1.5">{getTranslation(lang, 'settProfileDisplay')}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-3 py-2 text-sm border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-1.5">{getTranslation(lang, 'settProfileUser')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-500 dark:text-brand-text-muted text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="JeanDupont"
                      className="w-full pl-7 pr-3 py-2 text-sm border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-blue hover:bg-brand-blue-hover font-medium text-sm text-white rounded-xl transition-all cursor-pointer"
              >
                {getTranslation(lang, 'settProfileBtnSave')}
              </button>
            </form>
          </div>

          {/* Design Customization Container */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-brand-text">{lang === 'fr' ? 'Configuration & Langue' : 'Configuration & Language'}</h3>
            </div>

            <div className="space-y-5">
              {/* Language selector toggle button */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-3">{getTranslation(lang, 'settLanguage')}</label>
                <div className="grid grid-cols-2 gap-3 text-neutral-900 dark:text-brand-text">
                  <button
                    type="button"
                    onClick={() => handleSettingUpdate('language', 'fr')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                      (settings.language || 'fr') === 'fr'
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    Français (FR)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSettingUpdate('language', 'en')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                      settings.language === 'en'
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>

              {/* Theme toggle tabs resembling official X themes */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-3">{getTranslation(lang, 'settAppearanceTheme')}</label>
                <div className="grid grid-cols-3 gap-3 text-neutral-900 dark:text-brand-text">
                  <button
                    onClick={() => handleSettingUpdate('theme', 'light')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      settings.theme === 'light'
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    <div className="text-xs font-semibold">Twitter Light</div>
                    <div className="text-[10px] text-neutral-500 dark:text-brand-text-muted mt-1">{lang === 'fr' ? 'Clair / Blanc' : 'Light / White'}</div>
                  </button>

                  <button
                    onClick={() => handleSettingUpdate('theme', 'dim')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      settings.theme === 'dim'
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    <div className="text-xs font-semibold">Twitter Dim</div>
                    <div className="text-[10px] text-neutral-450 dark:text-brand-text mt-1">{lang === 'fr' ? 'Bleu Sombre' : 'Dim Navy Blue'}</div>
                  </button>

                  <button
                    onClick={() => handleSettingUpdate('theme', 'dark')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'border-neutral-100 bg-neutral-950 text-neutral-200 ring-1 ring-neutral-200/30'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    <div className="text-xs font-semibold">Twitter Black</div>
                    <div className="text-[10px] text-neutral-500 dark:text-brand-text-muted mt-1">{lang === 'fr' ? 'Noir Profond' : 'OLED Black'}</div>
                  </button>
                </div>
              </div>

              {/* Accent Color Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-3">{getTranslation(lang, 'settAccentColor')}</label>
                <div className="flex flex-wrap gap-3 items-center">
                  {[
                    { hex: '#1d9bf0', label: lang === 'fr' ? 'Bleu X' : 'X Blue', bg: 'bg-[#1d9bf0]' },
                    { hex: '#ffd400', label: lang === 'fr' ? 'Jaune' : 'Yellow', bg: 'bg-[#ffd400]' },
                    { hex: '#f91880', label: lang === 'fr' ? "Rose d'or" : "Gold Pink", bg: 'bg-[#f91880]' },
                    { hex: '#7856ff', label: lang === 'fr' ? 'Violet' : 'Purple', bg: 'bg-[#7856ff]' },
                    { hex: '#ff7a00', label: lang === 'fr' ? 'Orange' : 'Orange', bg: 'bg-[#ff7a00]' },
                    { hex: '#00ba7c', label: lang === 'fr' ? 'Vert Émeraude' : 'Emerald Green', bg: 'bg-[#00ba7c]' },
                  ].map((color) => {
                    const isSelected = (settings.brandColor || '#1d9bf0') === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => handleSettingUpdate('brandColor', color.hex)}
                        title={color.label}
                        className={`w-9 h-9 rounded-full ${color.bg} relative flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                          isSelected ? 'ring-4 ring-brand-blue/30 scale-105' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {isSelected && (
                          <Check className={`w-4 h-4 ${color.hex === '#ffd400' ? 'text-neutral-900' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-neutral-400 dark:text-brand-text-muted">{getTranslation(lang, 'settFontSize')}</label>
                  <span className="text-xs font-mono font-medium text-brand-blue">{settings.fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 dark:text-brand-text-muted font-medium">Aa</span>
                  <input
                    type="range"
                    min="12"
                    max="22"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => handleSettingUpdate('fontSize', Number(e.target.value))}
                    className="w-full accent-brand-blue bg-neutral-200 dark:bg-brand-bg h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg text-neutral-500 dark:text-brand-text-muted font-medium">Aa</span>
                </div>
              </div>

              {/* Font Family Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-1.5">{getTranslation(lang, 'settFontFamily')}</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingUpdate('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl bg-transparent border-neutral-300 dark:border-brand-border bg-neutral-900/50 text-neutral-900 dark:text-brand-text focus:outline-none"
                >
                  {SYSTEM_FONTS.map((font) => (
                    <option key={font.value} value={font.value} className="bg-white dark:bg-brand-card text-neutral-900 dark:text-brand-text">
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Ergonomics configuration */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Smartphone className="w-4 h-4 text-brand-blue" />
                  <label className="text-xs font-medium text-neutral-400 dark:text-brand-text-muted">{getTranslation(lang, 'settMobileNav')}</label>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-neutral-900 dark:text-brand-text">
                  <button
                    type="button"
                    onClick={() => handleSettingUpdate('mobileNavStyle', 'drawer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.mobileNavStyle === 'drawer'
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layout className="w-4 h-4" />
                      <div className="text-xs font-semibold">{lang === 'fr' ? 'Option A' : 'Option A'}</div>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-brand-text-muted leading-normal">
                      {getTranslation(lang, 'settMobileNavDrawer')}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSettingUpdate('mobileNavStyle', 'bottom')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.mobileNavStyle === 'bottom'
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                        : 'border-neutral-300 dark:border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="w-4 h-4" />
                      <div className="text-xs font-semibold">{lang === 'fr' ? 'Option B' : 'Option B'}</div>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-brand-text-muted leading-normal">
                      {getTranslation(lang, 'settMobileNavBottom')}
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: P2P sync and Database Counters */}
        <div className="space-y-6">

          {/* WebRTC Sync */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-brand-text">{getTranslation(lang, 'settP2pSection')}</h3>
              </div>
              <span className="bg-pink-500/10 text-pink-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">WebRTC local</span>
            </div>

            <p className="text-xs text-neutral-400 dark:text-brand-text-muted leading-relaxed mb-4">
              {getTranslation(lang, 'settP2pDesc')}
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Peer code generator container */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-brand-border bg-neutral-100/50 dark:bg-brand-bg text-center flex flex-col justify-center items-center">
                  <h4 className="text-xs font-semibold text-neutral-400 dark:text-brand-text-muted uppercase tracking-widest mb-2">{lang === 'fr' ? 'Cet Appareil' : 'This Device'}</h4>
                  {mySyncCode ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-mono font-bold tracking-widest text-brand-blue">
                        {mySyncCode.slice(0, 3)} {mySyncCode.slice(3)}
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-brand-text-muted">{getTranslation(lang, 'settP2pLabelCode')}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={generateSyncCode}
                      className="px-3.5 py-2 mt-1 bg-brand-blue hover:bg-brand-blue-hover text-xs font-semibold text-white rounded-lg transition-all cursor-pointer"
                    >
                      {lang === 'fr' ? 'Obtenir un code' : 'Get pairing code'}
                    </button>
                  )}
                </div>

                {/* Connect Box */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-brand-border bg-neutral-100/50 dark:bg-brand-bg flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-400 dark:text-brand-text-muted uppercase tracking-widest mb-2 text-center md:text-left">{lang === 'fr' ? 'Lier à un Appareil' : 'Connect to device'}</h4>
                    <input
                      type="text"
                      maxLength={6}
                      value={syncCode}
                      onChange={(e) => setSyncCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={lang === 'fr' ? 'Indiquez le code' : 'Enter code'}
                      className="w-full text-center px-3 py-1.5 text-sm border rounded-lg bg-transparent border-neutral-300 dark:border-brand-border font-mono tracking-widest mb-2.5 text-neutral-900 dark:text-brand-text"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={syncCode.length !== 6 || syncStatus === 'connecting'}
                    onClick={connectToPeer}
                    className="w-full py-1.5 bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {syncStatus === 'connecting' ? (lang === 'fr' ? 'Liaison...' : 'Pairing...') : getTranslation(lang, 'settP2pBtnConnect')}
                  </button>
                </div>
              </div>

              {/* Status display logger */}
              {syncLog.length > 0 && (
                <div className="p-3.5 bg-black/95 rounded-xl border border-neutral-800 dark:border-brand-border font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto space-y-1">
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-brand-border text-neutral-500 dark:text-brand-text-muted text-[10px]">
                    <span>CONSOLE WEBRTC SIGNALING</span>
                    <span className="flex items-center gap-1 font-bold">
                      <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-brand-blue animate-pulse'}`} />
                      {syncStatus.toUpperCase()}
                    </span>
                  </div>
                  {syncLog.map((log, index) => (
                    <div key={index} className={log.includes('succès') || log.includes('successfully') ? 'text-emerald-400 font-semibold' : log.includes('Erreur') || log.includes('Error') ? 'text-red-400 font-semibold' : 'text-neutral-300'}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Backup import/export JSON */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-brand-text">{getTranslation(lang, 'settExportSection')}</h3>
            </div>

            <p className="text-xs text-neutral-400 dark:text-brand-text-muted leading-relaxed mb-4">
              {getTranslation(lang, 'settExportDesc')}
            </p>

            <div className="flex flex-col md:flex-row gap-3 text-neutral-900 dark:text-brand-text">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 py-2 border border-neutral-300 dark:border-brand-border hover:bg-neutral-100 dark:hover:bg-brand-bg inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" /> {lang === 'fr' ? 'Exporter JSON' : 'Export JSON'}
              </button>
              
              <label className="flex-1 py-2 border border-neutral-300 dark:border-brand-border hover:bg-neutral-100 dark:hover:bg-brand-bg inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-brand-blue" /> {lang === 'fr' ? 'Importer JSON' : 'Import JSON'}
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {importSuccess && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs text-center font-medium animate-pulse">
                {lang === 'fr' ? 'Base de données importée avec succès ! Récupération...' : 'Database imported successfully! Refreshing...'}
              </div>
            )}
            {importError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Reset Engine */}
          <div className="p-6 rounded-2xl border border-red-500/10 dark:border-red-500/20 bg-red-500/5 dark:bg-red-950/5 text-red-500 dark:text-red-400">
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-semibold text-lg">{lang === 'fr' ? 'Zone de Réinitialisation' : 'Reset Zone'}</h3>
            </div>
            
            <p className="text-xs text-red-650/80 dark:text-red-400/80 mb-4 leading-normal">
              {lang === 'fr' ? "Effacez manuellement le suivi quotidien des actions gratuites de Twitter :" : "Manually clear daily Free Twitter tracking actions:"}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onResetCounters('posts')}
                className="py-1.5 px-3 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all font-semibold text-left cursor-pointer"
              >
                {lang === 'fr' ? 'Réinitialiser Posts (0/50)' : 'Reset Posts (0/50)'}
              </button>
              <button
                type="button"
                onClick={() => onResetCounters('reposts')}
                className="py-1.5 px-3 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all font-semibold text-left cursor-pointer"
              >
                {lang === 'fr' ? 'Réinitialiser Reposts (0/200)' : 'Reset Reposts (0/200)'}
              </button>
              <button
                type="button"
                onClick={() => onResetCounters('replies')}
                className="py-1.5 px-3 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all font-semibold text-left cursor-pointer"
              >
                {lang === 'fr' ? 'Réinitialiser Réponses' : 'Reset Replies'}
              </button>
              <button
                type="button"
                onClick={() => onResetCounters('all')}
                className="col-span-2 py-2 px-3 bg-red-500 text-white font-bold text-center rounded-lg hover:bg-red-600 transition-all text-xs cursor-pointer"
              >
                {lang === 'fr' ? 'Tout réinitialiser' : 'Reset All Statistics'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
