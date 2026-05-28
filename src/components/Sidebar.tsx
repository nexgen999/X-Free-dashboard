/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PenTool, Calendar, ShieldCheck, Settings, X, LogOut, CheckCircle2, Bookmark, Layout } from 'lucide-react';
import { Profile } from '../types';
import { getTranslation } from '../translations';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  mobileNavStyle: 'drawer' | 'bottom';
  language?: 'fr' | 'en';
}

export default function Sidebar({
  currentTab,
  onTabChange,
  profile,
  isOpen,
  onClose,
  isMobile,
  mobileNavStyle,
  language
}: SidebarProps) {
  
  const lang = language || 'fr';

  // Tabs config
  const navItems = [
    { id: 'composer', label: getTranslation(lang, 'navComposer'), icon: PenTool },
    { id: 'calendar', label: getTranslation(lang, 'navCalendar'), icon: Calendar },
    { id: 'drafts', label: getTranslation(lang, 'navDrafts'), icon: Bookmark },
    { id: 'templates', label: getTranslation(lang, 'navTemplates'), icon: Layout },
    { id: 'limits', label: getTranslation(lang, 'navLimits'), icon: ShieldCheck },
    { id: 'settings', label: getTranslation(lang, 'navSettings'), icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (isMobile) {
      onClose();
    }
  };

  // Render logic for Option B (Bottom nav style):
  // If it's mobile and option B is selected, sidebar must hide completely!
  if (isMobile && mobileNavStyle === 'bottom') {
    return null;
  }
  // Common side bar classes
  const baseClasses = `h-full flex flex-col justify-between border-neutral-200 dark:border-brand-border bg-white dark:bg-brand-bg transition-transform duration-350 z-40 p-4 shrink-0`;
  const PC_classes = `hidden md:flex w-[260px] border-r fixed left-0 top-0 bottom-0`;
  const mobileDrawerClasses = `fixed left-0 top-0 bottom-0 w-[260px] border-r shadow-2xl ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <div className={isMobile ? mobileDrawerClasses + ' ' + baseClasses : PC_classes + ' ' + baseClasses}>
      
      {/* Top half: branding and profile card */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-brand-border">
          <div className="flex items-center gap-2.5">
            {/* Custom stylized mini X logo */}
            <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-brand-blue text-white dark:text-black flex items-center justify-center font-bold">
              X
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-brand-text">X-Free Dashboard</span>
              <span className="block text-[9px] text-neutral-500 dark:text-brand-text-muted font-bold tracking-wider uppercase">Mode Non-Premium</span>
            </div>
          </div>

          {/* Close button for drawer overlay on mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-brand-card rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile metadata display card */}
        <div className="p-3 bg-neutral-100/50 dark:bg-brand-card hover:bg-neutral-100 dark:hover:bg-brand-card/80 rounded-2xl flex items-center gap-3 border border-neutral-200/50 dark:border-brand-border transition-colors">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-neutral-250 dark:border-brand-border bg-neutral-200 dark:bg-brand-bg">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Core user profile base64" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-brand-blue" />
            )}
          </div>
          <div className="min-w-0 pr-1.5">
            <div className="font-bold text-xs truncate flex items-center gap-1 text-neutral-850 dark:text-brand-text">
              {profile.displayName || 'Sans Nom'}
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue shrink-0" fill="currentColor" />
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-brand-text-muted truncate">@{profile.username || 'DemoUser'}</div>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20 shadow-sm'
                    : 'text-neutral-550 dark:text-brand-text-muted hover:bg-neutral-100 dark:hover:bg-brand-card'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-brand-blue' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer half info tags */}
      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-brand-border">
        <div className="text-[9px] font-mono leading-normal text-neutral-500 dark:text-brand-text-muted space-y-0.5">
          <div>DATABASE: INDEXEDDB LOCAL</div>
          <div>STATUS: COMPATIBLE OPERA</div>
          <div>PAIRING: WEBRTC P2P</div>
        </div>
      </div>

    </div>
  );
}
