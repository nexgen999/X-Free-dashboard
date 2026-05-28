/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Menu, Info, HelpCircle, X } from 'lucide-react';
import { Profile, AppSettings, PostDraft, DailyCount, HistoryItem } from './types';
import {
  getLocalStorageSettings,
  getLocalStorageProfile,
  getDrafts,
  deleteDraft,
  saveDraft,
  getDailyCounts,
  saveDailyCount,
  clearAllDailyCounts,
  getHistory,
  addHistoryItem,
  clearHistory
} from './db';

import { getTranslation, LanguageType } from './translations';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Composer from './components/Composer';
import ScheduleCalendar from './components/ScheduleCalendar';
import QuickActionCounter from './components/QuickActionCounter';
import SettingsPanel from './components/SettingsPanel';
import DraftsManager from './components/DraftsManager';
import TemplatesManager from './components/TemplatesManager';

function getBrandColorHover(color: string): string {
  switch (color) {
    case '#1d9bf0': return '#1a8cd8';
    case '#ffd400': return '#e0ba00';
    case '#f91880': return '#da136f';
    case '#7856ff': return '#6648db';
    case '#ff7a00': return '#e06b00';
    case '#00ba7c': return '#00a36c';
    default: return '#1a8cd8';
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('composer');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [dailyCounts, setDailyCounts] = useState<DailyCount | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Mobile / layout states
  const [innerWidth, setInnerWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Incoming draft to load into Composer (from calendar selection)
  const [incomingDraft, setIncomingDraft] = useState<PostDraft | null>(null);

  // Listen to window size to trigger layouts responsively
  useEffect(() => {
    const handleResize = () => setInnerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const welcomed = localStorage.getItem('XFreeDashboard_welcomed');
      if (!welcomed) {
        setShowWelcomeModal(true);
      }
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    localStorage.setItem('XFreeDashboard_welcomed', 'true');
    setShowWelcomeModal(false);
  };

  // Sync HTML root element theme setup and custom options
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dim', 'theme-dark', 'dark');

    if (settings.theme === 'dim') {
      root.classList.add('theme-dim', 'dark');
      root.style.colorScheme = 'dark';
    } else if (settings.theme === 'dark') {
      root.classList.add('theme-dark', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('theme-light');
      root.style.colorScheme = 'light';
    }

    // Apply custom dynamic variables globally on document root
    const activeColor = settings.brandColor || '#1d9bf0';
    root.style.setProperty('--brand-blue', activeColor);
    root.style.setProperty('--brand-blue-hover', getBrandColorHover(activeColor));

    if (settings.fontFamily) {
      root.style.setProperty('--brand-font', settings.fontFamily);
    }
  }, [settings?.theme, settings?.brandColor, settings?.fontFamily]);

  const isMobile = innerWidth < 768;

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const loadedSettings = await getLocalStorageSettings();
        const loadedProfile = await getLocalStorageProfile();
        const loadedDrafts = await getDrafts();
        const todayStr = new Date().toISOString().split('T')[0];
        const loadedCounts = await getDailyCounts(todayStr);
        const loadedHistory = await getHistory();

        setSettings(loadedSettings);
        setProfile(loadedProfile);
        setDrafts(loadedDrafts);
        setDailyCounts(loadedCounts);
        setHistory(loadedHistory);
      } catch (err) {
        console.error('Erreur lors de la charge initiale de la Base IndexedDB', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync state helpers
  const handlePostPublished = async (text: string) => {
    if (!dailyCounts) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = {
      ...dailyCounts,
      posts: dailyCounts.posts + 1
    };
    
    const logging: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      type: 'post',
      text: text.length > 50 ? text.substring(0, 50) + '...' : text,
      timestamp: new Date().toISOString()
    };

    setDailyCounts(updated);
    await saveDailyCount(updated);
    await addHistoryItem(logging);
    
    const newHistory = await getHistory();
    setHistory(newHistory);
  };

  const handleDraftSaved = async (newDraft: PostDraft) => {
    await saveDraft(newDraft);
    const updatedDrafts = await getDrafts();
    setDrafts(updatedDrafts);
  };

  const handleDraftDeleted = async (id: string) => {
    await deleteDraft(id);
    const updatedDrafts = await getDrafts();
    setDrafts(updatedDrafts);
  };

  const handleShareNow = async (draft: PostDraft) => {
    // Open Twitter Web Intent link
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(draft.text)}`;
    window.open(intentUrl, '_blank', 'noreferrer,noopener');

    // Archive / delete if needed, update count + stats
    await handlePostPublished(draft.text);
    await deleteDraft(draft.id);
    const updatedDrafts = await getDrafts();
    setDrafts(updatedDrafts);
  };

  const handleResetCounters = async (type: 'all' | 'posts' | 'reposts' | 'replies' | 'likes') => {
    if (!dailyCounts) return;
    const todayStr = new Date().toISOString().split('T')[0];
    let updated = { ...dailyCounts };

    if (type === 'all') {
      await clearAllDailyCounts();
      updated = {
        date: todayStr,
        posts: 0,
        reposts: 0,
        replies: 0,
        likes: 0
      };
    } else {
      updated[type] = 0;
    }

    setDailyCounts(updated);
    await saveDailyCount(updated);

    const logging: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      type: 'post',
      text: `Réinitialisation de compteur local : ${type}`,
      timestamp: new Date().toISOString()
    };
    await addHistoryItem(logging);
    const newHist = await getHistory();
    setHistory(newHist);
  };

  const handleIncrement = async (type: 'posts' | 'reposts' | 'replies' | 'likes', val: number) => {
    if (!dailyCounts) return;
    const targetVal = Math.max(0, dailyCounts[type] + val);
    const updated = {
      ...dailyCounts,
      [type]: targetVal
    };

    setDailyCounts(updated);
    await saveDailyCount(updated);

    // If incremented, log it in history logs
    if (val > 0) {
      const logging: HistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        type: type === 'posts' ? 'post' : type === 'reposts' ? 'repost' : type === 'replies' ? 'reply' : 'like',
        text: `Incrémentation manuelle de ${type} (+1)`,
        timestamp: new Date().toISOString()
      };
      await addHistoryItem(logging);
      const newHist = await getHistory();
      setHistory(newHist);
    }
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  if (loading || !settings || !profile || !dailyCounts) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-brand-blue border-neutral-800 animate-spin" />
          <div className="text-sm font-mono tracking-widest text-brand-blue uppercase font-bold animate-pulse">
            Lancement de la base de données...
          </div>
        </div>
      </div>
    );
  }

  // Theme variable classes mapped dynamically to our root styles variables
  let themeStyles = `min-h-screen transition-colors duration-300 bg-brand-bg text-brand-text theme-${settings.theme}`;

  const isOptionB = settings.mobileNavStyle === 'bottom';
  const lang: LanguageType = settings.language || 'fr';

  return (
    <div
      className={themeStyles}
      style={{
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
        '--brand-blue': settings.brandColor || '#1d9bf0',
        '--brand-blue-hover': getBrandColorHover(settings.brandColor || '#1d9bf0'),
      } as React.CSSProperties}
    >
      
      {/* Mobile Top Header */}
      {isMobile && (
        <header className="h-14 border-b border-neutral-200 dark:border-neutral-900/80 bg-white/85 dark:bg-black/85 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* If Drawer mode (Option A), show Burger. Else hide and show mini profile avatar */}
            {!isOptionB ? (
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-blue">
                <img src={profile.avatar} alt="Mobile thumb profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            
            <div className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              {currentTab === 'composer' && getTranslation(lang, 'navTitleComposer')}
              {currentTab === 'calendar' && getTranslation(lang, 'navTitleCalendar')}
              {currentTab === 'drafts' && getTranslation(lang, 'navTitleDrafts')}
              {currentTab === 'templates' && getTranslation(lang, 'navTitleTemplates')}
              {currentTab === 'limits' && getTranslation(lang, 'navTitleLimits')}
              {currentTab === 'settings' && getTranslation(lang, 'navTitleSettings')}
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-neutral-905 dark:bg-neutral-100 text-white dark:text-black flex items-center justify-center font-bold text-xs">
            X
          </div>
        </header>
      )}

      {/* Main Grid Wrapper */}
      <div className="flex min-h-screen relative">
        
        {/* Drawers Overlap and Sidebar Container */}
        {isMobile && !isOptionB && drawerOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          profile={profile}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          isMobile={isMobile}
          mobileNavStyle={settings.mobileNavStyle}
          language={lang}
        />

        {/* Central Work Space - uses margin spacing on widescreen view to align correct spacing */}
        <main className={`flex-1 min-w-0 p-4 md:p-8 space-y-6 md:pl-[290px] pb-24 md:pb-8`}>
          
          {/* Central router views switcher */}
          <div className="max-w-7xl">
            {currentTab === 'composer' && (
              <Composer
                profile={profile}
                onPostPublished={handlePostPublished}
                onDraftSaved={handleDraftSaved}
                incomingDraft={incomingDraft}
                onClearIncomingDraft={() => setIncomingDraft(null)}
                language={lang}
              />
            )}

            {currentTab === 'calendar' && (
              <ScheduleCalendar
                drafts={drafts}
                onDraftSelected={(draft) => {
                  setIncomingDraft(draft);
                  setCurrentTab('composer');
                }}
                onDraftDeleted={handleDraftDeleted}
                onShareNow={handleShareNow}
                language={lang}
              />
            )}

            {currentTab === 'drafts' && (
              <DraftsManager
                drafts={drafts}
                onDraftSelected={(draft) => {
                  setIncomingDraft(draft);
                  setCurrentTab('composer');
                }}
                onDraftDeleted={handleDraftDeleted}
                onDraftSaved={handleDraftSaved}
                onShareNow={handleShareNow}
                language={lang}
              />
            )}

            {currentTab === 'templates' && (
              <TemplatesManager
                onUseTemplate={(text) => {
                  setIncomingDraft({
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
                    text,
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    tags: []
                  });
                  setCurrentTab('composer');
                }}
                brandColor={settings.brandColor}
                language={lang}
              />
            )}

            {currentTab === 'limits' && (
              <QuickActionCounter
                counts={dailyCounts}
                history={history}
                onIncrement={handleIncrement}
                onClearHistory={handleClearHistory}
                language={lang}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPanel
                settings={settings}
                profile={profile}
                onSettingsChange={setSettings}
                onProfileChange={setProfile}
                onResetCounters={handleResetCounters}
              />
            )}
          </div>

        </main>
      </div>

      {/* Thumb navigation on mobile Bottom style only */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMobile={isMobile}
        mobileNavStyle={settings.mobileNavStyle}
        language={lang}
      />

      {/* Startup informative Welcome Popup Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl max-w-lg p-6 md:p-8 space-y-6 shadow-2xl relative text-left text-neutral-900 dark:text-brand-text animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <button
                onClick={handleCloseWelcomeModal}
                className="text-neutral-405 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold">{getTranslation(lang, 'welcomeTitle')}</h3>
              <p className="text-xs text-brand-blue font-bold tracking-wide uppercase">{getTranslation(lang, 'welcomeSub')}</p>
            </div>

            <p className="text-xs text-neutral-500 dark:text-brand-text-muted leading-relaxed">
              {getTranslation(lang, 'welcomeDesc1')}
            </p>
            
            <p className="text-xs text-neutral-500 dark:text-brand-text-muted leading-relaxed">
              {getTranslation(lang, 'welcomeDesc2')}
            </p>

            <button
              onClick={handleCloseWelcomeModal}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue-hover text-sm font-bold text-white rounded-xl transition-all cursor-pointer"
            >
              {getTranslation(lang, 'welcomeBtn')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
