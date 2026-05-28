/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, FileText, Calendar, Plus, Hash, X, Smile, MessageCircle, Repeat2, Heart, BarChart2, Share, Check, Sparkles, Scissors } from 'lucide-react';
import { Profile, PostDraft, SavedTag } from '../types';
import { getSavedTags, saveTag, deleteTag } from '../db';
import { getTranslation } from '../translations';

interface ComposerProps {
  profile: Profile;
  onPostPublished: (text: string) => void;
  onDraftSaved: (draft: PostDraft) => void;
  // Trigger draft loading if calendar clicks draft
  incomingDraft: PostDraft | null;
  onClearIncomingDraft: () => void;
  language?: 'fr' | 'en';
}

const POPULAR_EMOJIS = ['😀', '😂', '🔥', '🚀', '👏', '💡', '🧠', '📊', '🎯', '✨', '📅', '👉', '🤔', '👀', '💪', '🙌', '❌', '✅'];

export default function Composer({
  profile,
  onPostPublished,
  onDraftSaved,
  incomingDraft,
  onClearIncomingDraft,
  language
}: ComposerProps) {
  const lang = language || 'fr';
  const [text, setText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savedTags, setSavedTags] = useState<SavedTag[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [splitThreads, setSplitThreads] = useState<string[]>([]);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const textRef = useRef<HTMLTextAreaElement>(null);

  // Load saved tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  // Handle incoming draft selected from calendar
  useEffect(() => {
    if (incomingDraft) {
      setText(incomingDraft.text);
      if (incomingDraft.scheduledTime) {
        const dt = new Date(incomingDraft.scheduledTime);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        const hh = String(dt.getHours()).padStart(2, '0');
        const min = String(dt.getMinutes()).padStart(2, '0');
        setScheduledDate(`${yyyy}-${mm}-${dd}`);
        setScheduledTime(`${hh}:${min}`);
      } else {
        setScheduledDate('');
        setScheduledTime('');
      }
      onClearIncomingDraft();
    }
  }, [incomingDraft, onClearIncomingDraft]);

  const loadTags = async () => {
    try {
      const list = await getSavedTags();
      setSavedTags(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCharCount = () => {
    return text.length;
  };

  const charCount = handleCharCount();
  const isOverLimit = charCount > 280;

  // Determine label coloring for dynamic limits
  const getProgressColor = () => {
    if (charCount < 250) return 'text-emerald-500';
    if (charCount <= 280) return 'text-amber-500 font-bold';
    return 'text-red-500 font-bold animate-pulse';
  };

  const appendTag = (tag: string) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (text.endsWith(' ') || text === '') {
      setText(prev => prev + formattedTag + ' ');
    } else {
      setText(prev => prev + ' ' + formattedTag + ' ');
    }
    if (textRef.current) {
      textRef.current.focus();
    }
  };

  const handleAddTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = newTagInput.trim().replace(/[^a-zA-Z0-9_#]/g, '');
    if (!cleaned) return;
    if (!cleaned.startsWith('#')) cleaned = '#' + cleaned;

    const newTagItem: SavedTag = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9),
      tag: cleaned
    };

    try {
      await saveTag(newTagItem);
      setNewTagInput('');
      setIsAddingTag(false);
      loadTags();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTagItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteTag(id);
      loadTags();
    } catch (err) {
      console.error(err);
    }
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => {
      const start = textRef.current?.selectionStart ?? prev.length;
      const end = textRef.current?.selectionEnd ?? prev.length;
      return prev.substring(0, start) + emoji + prev.substring(end);
    });
    setShowEmojiPicker(false);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  // Advanced automatic Thread Splitter algorithm
  const autoCutThread = () => {
    if (text.length <= 280) {
      setSplitThreads([text]);
      return;
    }

    // Advanced splitting: attempt to cut logically near sentence boundaries (. ! ?) or space
    const words = text.split(/\s+/);
    const drafts: string[] = [];
    let currentPart = '';
    
    // We reserve characters for sequential thread index indicator e.g. " [1/3]" (6 characters)
    // To be perfectly safe we use 260 limit per tweet part
    const maxPartLen = 260; 

    for (let word of words) {
      if ((currentPart + (currentPart ? ' ' : '') + word).length <= maxPartLen) {
        currentPart += (currentPart ? ' ' : '') + word;
      } else {
        if (currentPart) {
          drafts.push(currentPart);
        }
        currentPart = word;
      }
    }
    if (currentPart) {
      drafts.push(currentPart);
    }

    // Prepend/Append indices [X/Total] to help standard readers follow
    const totalParts = drafts.length;
    const resolvedParts = drafts.map((draft, idx) => `[${idx+1}/${totalParts}] ${draft}`);
    setSplitThreads(resolvedParts);
    
    // If threads generated, offer to update the active text to the first element and notify
    if (resolvedParts.length > 0) {
      setText(resolvedParts[0]);
      const threadMsg = lang === 'fr' 
        ? `Texte converti en fil de ${totalParts} tweets. Premier tweet configuré !`
        : `Text split into thread of ${totalParts} tweets. First tweet loaded!`;
      triggerNotification(threadMsg);
    }
  };

  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setIsSuccessNotification(true);
    setTimeout(() => setIsSuccessNotification(false), 3500);
  };

  // Triggers action to Draft in Shadow Calendar
  const handleSaveDraft = (statusType: 'draft' | 'scheduled') => {
    if (!text.trim()) return;

    let targetTime: string | undefined;
    if (statusType === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        alert(lang === 'fr' 
          ? "Veuillez sélectionner une date et une heure valides pour la planification." 
          : "Please select a valid date and time for scheduling.");
        return;
      }
      targetTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    const payload: PostDraft = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      text,
      scheduledTime: targetTime,
      tags: text.match(/#[a-zA-Z0-9_]+/g) || [],
      status: statusType,
      createdAt: new Date().toISOString()
    };

    onDraftSaved(payload);
    setText('');
    setScheduledDate('');
    setScheduledTime('');
    const finishSuccessMsg = statusType === 'scheduled'
      ? (lang === 'fr' ? "Brouillon planifié avec succès dans le Calendrier !" : "Draft successfully scheduled in Calendar!")
      : (lang === 'fr' ? "Brouillon enregistré localement !" : "Draft saved offline successfully!");
    triggerNotification(finishSuccessMsg);
  };

  const triggerXIntent = () => {
    if (!text.trim() || isOverLimit) return;

    // Trigger standard Web Intent with strict format
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, '_blank', 'noreferrer,noopener');

    onPostPublished(text);
    setText('');
    setScheduledDate('');
    setScheduledTime('');
    triggerNotification("Lancement de Twitter Intent ! Statistique incrémentée.");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-neutral-100 dark:text-neutral-200">
      
      {/* LEFT: Core writing tools & composer (7/12 area) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Success Alert Floating Banner */}
        {isSuccessNotification && (
          <div className="p-4 rounded-xl border border-brand-blue/30 bg-brand-blue/15 text-brand-blue absolute top-4 right-4 flex items-center gap-2.5 shadow-2xl z-50 backdrop-blur-xl animate-fade-in font-sans">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-200 dark:border-brand-border">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-neutral-900 dark:text-brand-text">
              <FileText className="w-5 h-5 text-brand-blue" /> {getTranslation(lang, 'compTitle')}
            </h3>
            
            <div className={`text-xs font-mono px-3 py-1 rounded-full bg-neutral-200/50 dark:bg-brand-bg ${getProgressColor()} flex items-center gap-1.5`}>
              <span className={`w-2 h-2 rounded-full ${charCount > 280 ? 'bg-red-500' : charCount >= 250 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {charCount} / 280 {getTranslation(lang, 'compCharacterCount')}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                ref={textRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getTranslation(lang, 'compPlaceholder')}
                className="w-full h-44 px-4 py-3 border border-neutral-300 dark:border-brand-border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue resize-none text-sm placeholder-neutral-500 dark:placeholder-brand-text-muted"
              />
              
              {/* Floating micro-bar */}
              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 rounded-lg border border-neutral-300 dark:border-brand-border hover:bg-neutral-200 dark:hover:bg-brand-bg text-neutral-400 hover:text-brand-blue transition-colors"
                  title="Ajouter un émoji"
                >
                  <Smile className="w-4.5 h-4.5" />
                </button>

                {charCount > 280 && (
                  <button
                    type="button"
                    onClick={autoCutThread}
                    className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Découper en Threads automatiquement"
                  >
                    <Scissors className="w-4 h-4" /> Découper
                  </button>
                )}
              </div>

              {/* Popup Emojis selection bar */}
              {showEmojiPicker && (
                <div className="absolute right-3.5 bottom-12 p-3 bg-neutral-150 dark:bg-brand-card border border-neutral-300 dark:border-brand-border rounded-xl shadow-2xl flex flex-wrap gap-2 max-w-xs z-50 backdrop-blur-md">
                  {POPULAR_EMOJIS.map((emo, i) => (
                    <button
                      key={i}
                      onClick={() => insertEmoji(emo)}
                      className="text-base p-1.5 hover:bg-neutral-200 dark:hover:bg-brand-bg rounded-lg transition-colors cursor-pointer"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Manager panel directly inside composer */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 dark:text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-brand-blue" /> {lang === 'fr' ? 'Balises récurrentes' : 'Recurring Hashtags'}
                </span>
                
                {isAddingTag ? (
                  <form onSubmit={handleAddTagSubmit} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder={lang === 'fr' ? "Nouveau tag" : "New tag"}
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="px-2 py-0.5 text-xs border border-neutral-300 dark:border-brand-border bg-transparent rounded text-neutral-950 dark:text-brand-text focus:outline-none"
                      autoFocus
                    />
                    <button type="submit" className="text-emerald-500" title={lang === 'fr' ? 'Valider' : 'Confirm'}>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setIsAddingTag(false)} className="text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="text-xs text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-0.5 pointer-events-auto cursor-pointer font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> {getTranslation(lang, 'compAddTag')}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                {savedTags.length > 0 ? (
                  savedTags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => appendTag(t.tag)}
                      className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-brand-border bg-neutral-200/20 dark:bg-brand-bg hover:bg-brand-blue/10 hover:border-brand-blue hover:text-brand-blue rounded-full inline-flex items-center gap-1.5 transition-colors group cursor-pointer text-neutral-800 dark:text-brand-text"
                    >
                      <span>{t.tag}</span>
                      <X
                        className="w-3 h-3 text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteTagItem(e, t.id)}
                      />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500 dark:text-brand-text-muted italic mt-0.5">Aucune balise enregistrée. Créez-en une pour accélérer votre publication !</span>
                )}
              </div>
            </div>

            {/* Scheduling zone panel */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-brand-border bg-neutral-100/30 dark:bg-brand-bg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 dark:text-brand-text-muted uppercase tracking-widest">
                <Calendar className="w-4 h-4 text-brand-blue" /> {lang === 'fr' ? 'Organiser la parution (Shadow Calendar)' : 'Organize Publication (Shadow Calendar)'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] text-neutral-500 dark:text-brand-text-muted mb-1">{lang === 'fr' ? 'Date' : 'Date'}</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-transparent border rounded-lg border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 dark:text-brand-text-muted mb-1">{lang === 'fr' ? 'Heure' : 'Time'}</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-transparent border rounded-lg border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
                  />
                </div>
              </div>
            </div>

            {/* Core Action triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSaveDraft('draft')}
                disabled={!text.trim()}
                className="py-2.5 rounded-xl border border-neutral-300 dark:border-brand-border hover:bg-neutral-200 dark:hover:bg-brand-bg text-xs font-bold transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2 cursor-pointer text-neutral-800 dark:text-brand-text"
              >
                <FileText className="w-4 h-4" /> {getTranslation(lang, 'compActionSave')}
              </button>

              <button
                type="button"
                onClick={() => handleSaveDraft('scheduled')}
                disabled={!text.trim() || !scheduledDate || !scheduledTime}
                className="py-2.5 rounded-xl border border-neutral-300 dark:border-brand-border hover:bg-neutral-200 dark:hover:bg-brand-bg text-xs font-bold text-brand-blue transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> {lang === 'fr' ? 'Planifier' : 'Schedule'}
              </button>

              <button
                type="button"
                onClick={triggerXIntent}
                disabled={!text.trim() || isOverLimit}
                className="py-2.5 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-brand-blue/45 text-white rounded-xl text-xs font-bold transition-all disabled:pointer-events-none inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> {lang === 'fr' ? 'Partager (X Intent)' : 'Share (X Intent)'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Cut preview threads displays */}
        {splitThreads.length > 1 && (
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-brand-border bg-neutral-100/50 dark:bg-brand-bg space-y-2">
            <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Structure de fil de discussion généré (Threads)
            </h4>
            <div className="space-y-1.5 py-1">
              {splitThreads.map((part, i) => (
                <div key={i} className="p-2 border-l-2 border-brand-blue/40 bg-white/5 dark:bg-brand-card text-[11.5px] leading-relaxed font-mono">
                  {part}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: WYSIWYG Twitter Mock visual simulator (5/12 area) */}
      <div className="xl:col-span-5">
        <div className="sticky top-6 space-y-4">
          <span className="text-xs font-semibold text-neutral-400 dark:text-brand-text-muted uppercase tracking-widest pl-1 block">
            {lang === 'fr' ? 'Rendu en direct (Simulateur 100% Réaliste X)' : 'Live Preview (100% Realistic X Simulator)'}
          </span>
          
          <div className="rounded-2xl border bg-white dark:bg-brand-bg border-neutral-200 dark:border-brand-border text-neutral-900 dark:text-brand-text overflow-hidden shadow-2xl">
            {/* Simulation Header with official logo option styling */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200 dark:border-brand-border bg-brand-card/45">
              <span className="text-xs font-bold text-neutral-400 dark:text-brand-text-muted uppercase tracking-wider">
                {lang === 'fr' ? 'Tweet officiel parodique' : 'Mock Official Tweet'}
              </span>
              <svg className="w-5.5 h-5.5 text-neutral-900 dark:text-[#f7f9f9]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>

            {/* Inner representation and layout matching X timeline strictly */}
            <div className="p-5 flex gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-200 dark:bg-brand-card shrink-0 border border-neutral-300 dark:border-brand-border">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Sim avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                ) : (
                  <div className="w-full h-full bg-brand-blue" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Meta details */}
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white truncate">
                    {profile.displayName || (lang === 'fr' ? 'Compte démo' : 'Demo Account')}
                  </span>
                  <span className="text-neutral-500 dark:text-brand-text-muted text-xs truncate">
                    @{profile.username || 'DemoUser'}
                  </span>
                  <span className="text-neutral-500 dark:text-brand-text-muted text-xs">•</span>
                  <span className="text-neutral-500 dark:text-brand-text-muted text-xs">{lang === 'fr' ? "À l'instant" : "Just now"}</span>
                </div>

                {/* Structured Text representation containing dynamic coloring tags */}
                <div className="mt-2 text-[14.5px] leading-relaxed break-words whitespace-pre-wrap font-sans">
                  {text ? (
                    text.split(/(\s+)/).map((segment, index) => {
                      if (segment.startsWith('#')) {
                        return <span key={index} className="text-brand-blue hover:underline">{segment}</span>;
                      }
                      if (segment.startsWith('@')) {
                        return <span key={index} className="text-brand-blue hover:underline">{segment}</span>;
                      }
                      return segment;
                    })
                  ) : (
                    <span className="text-neutral-500 dark:text-brand-text-muted italic">
                      {lang === 'fr' ? "Écrivez du contenu dans l'éditeur de texte pour voir s'afficher la carte tweet simulée..." : "Write content in the text editor to see the simulated tweet render here..."}
                    </span>
                  )}
                </div>

                {/* Simulated action icons at standard values */}
                <div className="mt-4 pt-1 flex items-center justify-between text-neutral-500 dark:text-brand-text-muted max-w-md">
                  <button type="button" className="group rounded-full p-2 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors flex items-center gap-1.5 cursor-pointer">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">0</span>
                  </button>

                  <button type="button" className="group rounded-full p-2 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Repeat2 className="w-4.5 h-4.5" />
                    <span className="text-xs">0</span>
                  </button>

                  <button type="button" className="group rounded-full p-2 hover:bg-pink-500/10 hover:text-pink-500 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">0</span>
                  </button>

                  <button type="button" className="group rounded-full p-2 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors flex items-center gap-1.5 cursor-pointer">
                    <BarChart2 className="w-4 h-4" />
                    <span className="text-xs">1</span>
                  </button>

                  <button type="button" className="group rounded-full p-2 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors cursor-pointer">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Intent helper message box */}
            <div className="px-4 py-3 border-t bg-neutral-50 dark:bg-brand-card/35 border-neutral-200 dark:border-brand-border text-[11px] text-neutral-400 dark:text-brand-text-muted flex items-center justify-between gap-1">
              <span>{lang === 'fr' ? "Optimisé pour limiter l'impact API X Premium" : "Optimized to bypass X Premium Dev API limits"}</span>
              <span className="font-semibold text-emerald-500">{lang === 'fr' ? "100% Fonctionnel - Intent Direct" : "100% Functional - Direct Intent"}</span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
