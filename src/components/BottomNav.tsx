/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PenTool, Calendar, ShieldCheck, Settings, Bookmark, Layout } from 'lucide-react';
import { getTranslation } from '../translations';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isMobile: boolean;
  mobileNavStyle: 'drawer' | 'bottom';
  language?: 'fr' | 'en';
}

export default function BottomNav({
  currentTab,
  onTabChange,
  isMobile,
  mobileNavStyle,
  language
}: BottomNavProps) {
  
  if (!isMobile || mobileNavStyle !== 'bottom') {
    return null;
  }

  const lang = language || 'fr';

  const items = [
    { id: 'composer', label: getTranslation(lang, 'navComposer'), icon: PenTool },
    { id: 'calendar', label: getTranslation(lang, 'navCalendar'), icon: Calendar },
    { id: 'drafts', label: getTranslation(lang, 'navDrafts'), icon: Bookmark },
    { id: 'templates', label: getTranslation(lang, 'navTemplates'), icon: Layout },
    { id: 'limits', label: getTranslation(lang, 'navLimits'), icon: ShieldCheck },
    { id: 'settings', label: getTranslation(lang, 'navSettings'), icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-1.5 z-40 shadow-xl backdrop-blur-md">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors ${
              isActive
                ? 'text-brand-blue font-bold'
                : 'text-neutral-500 hover:text-neutral-400'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-brand-blue' : 'text-neutral-500'}`} />
            <span className="text-[8.5px] mt-1 tracking-tighter truncate max-w-full">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
