/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit2, Play, Trash2, Bell, Check, Sparkles } from 'lucide-react';
import { PostDraft, OPTIMAL_TIMES } from '../types';
import { getTranslation } from '../translations';

interface ScheduleCalendarProps {
  drafts: PostDraft[];
  onDraftSelected: (draft: PostDraft) => void;
  onDraftDeleted: (id: string) => void;
  onShareNow: (draft: PostDraft) => void;
  language?: 'fr' | 'en';
}

export default function ScheduleCalendar({
  drafts,
  onDraftSelected,
  onDraftDeleted,
  onShareNow,
  language
}: ScheduleCalendarProps) {
  const lang = language || 'fr';
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [notificationsLogs, setNotificationsLogs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Set up a standard background check loop to simulate Service Worker notifications
    const checkInterval = setInterval(() => {
      checkScheduledAlerts();
    }, 15000); // Check every 15 seconds for reminders

    return () => clearInterval(checkInterval);
  }, [drafts]);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === 'granted') {
        new Notification("X-Free Dashboard", {
          body: lang === 'fr' ? "Notifications de parution Web activées avec succès !" : "Web publication reminders enabled successfully!",
          icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231DA1F2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'
        });
      }
    } else {
      alert(lang === 'fr' ? "Ce navigateur ne prend pas en charge la Push API native." : "This browser does not support the native Push API.");
    }
  };

  const checkScheduledAlerts = () => {
    const now = new Date();
    const scheduled = drafts.filter(d => d.status === 'scheduled' && d.scheduledTime);

    scheduled.forEach(item => {
      if (item.scheduledTime) {
        const itemTime = new Date(item.scheduledTime);
        const diffMs = now.getTime() - itemTime.getTime();

        // If the scheduled post is within a 2-minute margin and has not been notified
        if (diffMs >= 0 && diffMs < 120000) {
          const notifiedKey = `notified_draft_${item.id}`;
          if (!localStorage.getItem(notifiedKey)) {
            localStorage.setItem(notifiedKey, 'true');
            
            // Trigger local push
            triggerPushNotification(item);
          }
        }
      }
    });
  };

  const triggerPushNotification = (draft: PostDraft) => {
    const formattedText = draft.text.length > 60 ? draft.text.slice(0, 60) + '...' : draft.text;
    const bodyText = lang === 'fr'
      ? `C'est l'heure optimale ! Votre post "${formattedText}" est prêt à partir. Cliquez pour publier.`
      : `Optimal time reached! Your post "${formattedText}" is ready. Click to publish.`;

    if (notificationPermission === 'granted') {
      const titleText = lang === 'fr' ? "⌚ Rappel de parution X-Free !" : "⌚ X-Free Publication Reminder!";
      const notif = new Notification(titleText, {
        body: bodyText,
        requireInteraction: true
      });
      notif.onclick = () => {
        window.focus();
        onDraftSelected(draft);
      };
    } else {
      // In-app alert fallback
      const labelText = lang === 'fr'
        ? `[⌚ RAPPEL] ${new Date().toLocaleTimeString()} : C'est l'heure optimale pour publier : "${formattedText}"`
        : `[⌚ REMINDER] ${new Date().toLocaleTimeString()} : Optimal time to publish: "${formattedText}"`;
      setNotificationsLogs(prev => [
        ...prev,
        labelText
      ]);
    }
  };

  // Filter scheduled drafts
  const scheduledDrafts = drafts.filter(d => d.status === 'scheduled');
  const normalDrafts = drafts.filter(d => d.status === 'draft');

  // Days of the week helper for interactive scheduler view
  const getNext7Days = () => {
    const days = [];
    const weekdaysFren = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const weekdaysEngl = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        name: lang === 'fr' ? weekdaysFren[d.getDay()] : weekdaysEngl[d.getDay()],
        dateStr: d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' }),
        isoDate: d.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const upcomingDays = getNext7Days();

  return (
    <div className="space-y-6 animate-fade-in" id="scheduler-calendar">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-blue" /> {lang === 'fr' ? "Calendrier de l'Ombre (Shadow Scheduler)" : "Shadow Scheduler Calendar"}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {lang === 'fr' 
              ? "Visualisez et planifiez vos drafts sur des plages d'audiences hautement réceptives pour maximiser la visibilité." 
              : "Visualize and plan your drafts across high-impact audience hours to maximize outreach."}
          </p>
        </div>
        
        {/* Permission triggers */}
        <div className="shrink-0">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={requestPermission}
              className="px-3.5 py-1.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/30 text-xs font-semibold rounded-xl hover:bg-brand-blue hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-4 h-4 animate-bounce" /> {lang === 'fr' ? 'Activer Rappels PWA' : 'Enable PWA Reminders'}
            </button>
          ) : (
            <div className="text-xs font-medium text-emerald-500 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Check className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Notifications Navigateur Activées' : 'Browser Notifications Enabled'}
            </div>
          )}
        </div>
      </div>

      {notificationsLogs.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4" /> {lang === 'fr' ? 'Notifications de parution en attente (Rappels PWA de secours)' : 'Pending publications (Fallback PWA reminders)'}
          </div>
          {notificationsLogs.map((log, i) => (
            <div key={i} className="text-xs p-2 bg-black/10 rounded border border-amber-500/10">
              {log}
            </div>
          ))}
          <button
            onClick={() => setNotificationsLogs([])}
            className="text-[10px] uppercase font-bold hover:underline"
          >
            {lang === 'fr' ? 'Effacer les alertes' : 'Clear alerts'}
          </button>
        </div>
      )}

      {/* Grid of Future Days in calendar showing slots */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
        <h4 className="text-xs font-bold text-neutral-400 dark:text-brand-text-muted uppercase tracking-widest mb-4 flex items-center gap-1">
          <Clock className="w-4 h-4 text-brand-blue" /> {lang === 'fr' ? 'Vos créneaux horaires optimaux pour les 7 prochains jours' : 'Your optimal time slots for the next 7 days'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {upcomingDays.map((day) => {
            // Find drafts matching this date
            const dayDrafts = drafts.filter(d => {
              if (!d.scheduledTime) return false;
              return d.scheduledTime.startsWith(day.isoDate);
            });

            return (
              <div
                key={day.isoDate}
                className="p-3 rounded-xl border border-neutral-200 dark:border-brand-border bg-neutral-100/20 dark:bg-brand-bg flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold truncate text-neutral-900 dark:text-brand-text">{day.name}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-brand-text-muted mt-0.5">{day.dateStr}</div>
                </div>

                {/* Listing slots or count */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[9px] text-neutral-400 dark:text-brand-text-muted uppercase tracking-wider font-semibold border-b pb-0.5 border-neutral-200 dark:border-brand-border">Optimal slots</div>
                  <div className="flex flex-wrap gap-1">
                    {OPTIMAL_TIMES.map((slot) => {
                      // Check if a draft matches this slot approx (hour/minute)
                      const isOccupied = dayDrafts.some(d => {
                        if (!d.scheduledTime) return false;
                        const dt = new Date(d.scheduledTime);
                        const draftTimeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
                        return draftTimeStr === slot.time;
                      });

                      return (
                        <span
                          key={slot.time}
                          className={`text-[9px] px-1 py-0.5 font-bold rounded ${
                            isOccupied
                              ? 'bg-brand-blue text-white'
                              : 'bg-neutral-200 dark:bg-brand-card text-neutral-400 dark:text-brand-text-muted'
                          }`}
                          title={`${slot.label} @ ${slot.time}`}
                        >
                          {slot.time}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Day drafts summary */}
                {dayDrafts.length > 0 && (
                  <div className="mt-3 p-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded text-[10px] text-brand-blue font-semibold text-center">
                    {lang === 'fr'
                      ? `${dayDrafts.length} post${dayDrafts.length > 1 ? 's' : ''} planifié${dayDrafts.length > 1 ? 's' : ''}`
                      : `${dayDrafts.length} scheduled post${dayDrafts.length > 1 ? 's' : ''}`
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabular Lists block representing active drafts in list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column Left: Scheduled Items List */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
          <h4 className="font-semibold text-base mb-4 flex items-center justify-between text-neutral-900 dark:text-brand-text">
            <span>{lang === 'fr' ? 'Posts Planifiés' : 'Scheduled Posts'} ({scheduledDrafts.length})</span>
            <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-bold">{lang === 'fr' ? 'Horizon temporel' : 'Time horizon'}</span>
          </h4>

          {scheduledDrafts.length > 0 ? (
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {scheduledDrafts.map((draft) => {
                const dateDisplay = draft.scheduledTime
                  ? new Date(draft.scheduledTime).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '';

                return (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-xl border border-neutral-200 dark:border-brand-border bg-black/5 dark:bg-brand-bg flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="text-xs text-brand-blue font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {lang === 'fr' ? `Prévu le ${dateDisplay}` : `Scheduled on ${dateDisplay}`}
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-800 dark:text-brand-text break-words whitespace-pre-wrap">
                        {draft.text}
                      </p>
                    </div>

                    <div className="flex justify-end gap-1.5 border-t border-neutral-250 dark:border-brand-border pt-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDraftSelected(draft)}
                        className="p-1 px-2 hover:bg-neutral-200 dark:hover:bg-brand-card text-[10px] rounded inline-flex items-center gap-1 text-neutral-400 dark:text-brand-text-muted hover:text-white font-semibold transition-all cursor-pointer"
                        title={lang === 'fr' ? "Éditer le post" : "Edit post"}
                      >
                        <Edit2 className="w-3 h-3" /> {lang === 'fr' ? 'Éditer' : 'Edit'}
                      </button>
                      <button
                        onClick={() => onShareNow(draft)}
                        className="p-1 px-2 bg-brand-blue text-white hover:bg-brand-blue-hover text-[10px] font-bold rounded inline-flex items-center gap-1 transition-all cursor-pointer"
                        title={lang === 'fr' ? "Envoyer maintenant" : "Publish now"}
                      >
                        <Play className="w-3 h-3" /> {lang === 'fr' ? 'Partager' : 'Share'}
                      </button>
                      <button
                        onClick={() => onDraftDeleted(draft.id)}
                        className="p-1 px-2 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 text-[10px] rounded inline-flex items-center gap-1 transition-all cursor-pointer"
                        title={lang === 'fr' ? "Supprimer" : "Delete"}
                      >
                        <Trash2 className="w-3 h-3" /> {lang === 'fr' ? 'Supprimer' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-neutral-200 dark:border-brand-border rounded-xl">
              <span className="text-xs text-neutral-500 dark:text-brand-text-muted italic">
                {lang === 'fr' 
                  ? "Aucun post planifié. Utilisez le planificateur du compositeur pour en programmer." 
                  : "No scheduled posts found. Use the scheduling options in the Editor to queue posts."}
              </span>
            </div>
          )}
        </div>

        {/* Column Right: Ordinary Drafts list (Not scheduled) */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
          <h4 className="font-semibold text-base mb-4 flex items-center justify-between text-neutral-900 dark:text-brand-text">
            <span>{lang === 'fr' ? 'Boîte à Brouillons' : 'Draft Box'} ({normalDrafts.length})</span>
            <span className="text-xs bg-neutral-200 dark:bg-brand-bg text-neutral-400 dark:text-brand-text-muted px-2 py-0.5 rounded-full font-bold">{lang === 'fr' ? 'Sans heure fixe' : 'No set time'}</span>
          </h4>

          {normalDrafts.length > 0 ? (
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {normalDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-brand-border bg-black/5 dark:bg-brand-bg flex flex-col justify-between gap-3 group"
                >
                  <p className="text-xs leading-relaxed text-neutral-800 dark:text-brand-text break-words whitespace-pre-wrap">
                    {draft.text}
                  </p>

                  <div className="flex justify-end gap-1.5 border-t border-neutral-250 dark:border-brand-border pt-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onDraftSelected(draft)}
                      className="p-1 px-2 hover:bg-neutral-200 dark:hover:bg-brand-card text-[10px] rounded inline-flex items-center gap-1 text-neutral-400 dark:text-brand-text-muted hover:text-white font-semibold transition-all cursor-pointer"
                      title="Éditer le post"
                    >
                      <Edit2 className="w-3 h-3" /> Éditer
                    </button>
                    <button
                      onClick={() => onShareNow(draft)}
                      className="p-1 px-2 bg-brand-blue text-white hover:bg-brand-blue-hover text-[10px] font-bold rounded inline-flex items-center gap-1 transition-all cursor-pointer"
                      title="Envoyer maintenant"
                    >
                      <Play className="w-3 h-3" /> Partager
                    </button>
                    <button
                      onClick={() => onDraftDeleted(draft.id)}
                      className="p-1 px-2 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 text-[10px] rounded inline-flex items-center gap-1 transition-all cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-neutral-200 dark:border-brand-border rounded-xl">
              <span className="text-xs text-neutral-500 dark:text-brand-text-muted italic">
                {lang === 'fr' 
                  ? "Votre boîte à brouillons est vide. Enregistrez des idées rapides depuis l'éditeur." 
                  : "Your draft box is empty. Save quick ideas directly from the Editor."}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
