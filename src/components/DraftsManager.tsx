import React, { useState } from 'react';
import { Search, Trash2, Edit2, Play, Calendar, Bookmark, Clock, Check, X, Save, FileText, Sparkles } from 'lucide-react';
import { PostDraft } from '../types';
import { getTranslation } from '../translations';

interface DraftsManagerProps {
  drafts: PostDraft[];
  onDraftSelected: (draft: PostDraft) => void;
  onDraftDeleted: (id: string) => void;
  onDraftSaved: (draft: PostDraft) => void;
  onShareNow: (draft: PostDraft) => void;
  language?: 'fr' | 'en';
}

export default function DraftsManager({
  drafts,
  onDraftSelected,
  onDraftDeleted,
  onDraftSaved,
  onShareNow,
  language
}: DraftsManagerProps) {
  const lang = language || 'fr';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'simple' | 'scheduled'>('all');
  
  // Direct editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTime, setEditingTime] = useState('');
  const [editingDate, setEditingDate] = useState('');

  // Handle saving direct edits inside the drafts manager list
  const handleSaveEdit = (draft: PostDraft) => {
    let finalScheduledTime: string | undefined = undefined;
    if (editingDate && editingTime) {
      const parsedDate = new Date(`${editingDate}T${editingTime}`);
      if (!isNaN(parsedDate.getTime())) {
        finalScheduledTime = parsedDate.toISOString();
      }
    }

    const updated: PostDraft = {
      ...draft,
      text: editingText,
      scheduledTime: finalScheduledTime,
      status: finalScheduledTime ? 'scheduled' : 'draft',
    };

    onDraftSaved(updated);
    setEditingId(null);
  };

  const handleStartEdit = (draft: PostDraft) => {
    setEditingId(draft.id);
    setEditingText(draft.text);
    if (draft.scheduledTime) {
      const dt = new Date(draft.scheduledTime);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      setEditingDate(`${yyyy}-${mm}-${dd}`);
      setEditingTime(`${hh}:${min}`);
    } else {
      setEditingDate('');
      setEditingTime('');
    }
  };

  const getFilteredDrafts = () => {
    return drafts.filter((draft) => {
      // Search text match
      const textMatches = draft.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter tab match
      if (selectedFilter === 'simple') {
        return textMatches && !draft.scheduledTime;
      }
      if (selectedFilter === 'scheduled') {
        return textMatches && !!draft.scheduledTime;
      }
      return textMatches;
    });
  };

  const filtered = getFilteredDrafts();

  return (
    <div className="space-y-6 animate-fade-in" id="drafts-manager-view">
      
      {/* Header Container */}
      <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-neutral-200 dark:border-neutral-850">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{getTranslation(lang, 'draftsTitle')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {lang === 'fr' 
              ? "Consultez, éditez directement, supprimez ou publiez l'ensemble de vos idées de posts X enregistrés."
              : "Review, edit directly, delete or publish all your saved X posts online."}
          </p>
        </div>
        
        {/* Statistics badge counters */}
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-brand-card border border-neutral-200 dark:border-brand-border rounded-xl text-xs font-semibold">
            📂 {lang === 'fr' ? 'Brouillons' : 'Drafts'}: <span className="text-brand-blue font-bold">{drafts.filter(d => !d.scheduledTime).length}</span>
          </div>
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-brand-card border border-neutral-200 dark:border-brand-border rounded-xl text-xs font-semibold">
            ⏰ {lang === 'fr' ? 'Planifiés' : 'Scheduled'}: <span className="text-brand-blue font-bold">{drafts.filter(d => d.scheduledTime).length}</span>
          </div>
        </div>
      </div>

      {/* Control bars: tab selectors & search filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Buttons filters */}
        <div className="md:col-span-2 flex p-1 bg-neutral-100/70 dark:bg-brand-bg rounded-xl border border-neutral-200 dark:border-brand-border text-neutral-900 dark:text-brand-text">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white dark:bg-brand-card text-brand-blue shadow-sm border border-neutral-200/50 dark:border-brand-border/40'
                : 'text-neutral-500 dark:text-brand-text-muted hover:text-brand-text'
            }`}
          >
            {lang === 'fr' ? 'Tout voir' : 'Show All'} ({drafts.length})
          </button>
          <button
            onClick={() => setSelectedFilter('simple')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedFilter === 'simple'
                ? 'bg-white dark:bg-brand-card text-brand-blue shadow-sm border border-neutral-200/50 dark:border-brand-border/40'
                : 'text-neutral-500 dark:text-brand-text-muted hover:text-brand-text'
            }`}
          >
            {lang === 'fr' ? 'Simples' : 'Regular'} ({drafts.filter(d => !d.scheduledTime).length})
          </button>
          <button
            onClick={() => setSelectedFilter('scheduled')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedFilter === 'scheduled'
                ? 'bg-white dark:bg-brand-card text-brand-blue shadow-sm border border-neutral-200/50 dark:border-brand-border/40'
                : 'text-neutral-500 dark:text-brand-text-muted hover:text-brand-text'
            }`}
          >
            {lang === 'fr' ? 'Heure Fixe' : 'Scheduled'} ({drafts.filter(d => d.scheduledTime).length})
          </button>
        </div>

        {/* Dynamic search input field */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'fr' ? "Rechercher des mots clés..." : "Search keywords..."}
            className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
          />
        </div>
      </div>

      {/* Drafts Listing area */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((draft) => {
            const isEditing = editingId === draft.id;
            const dateDisplay = draft.scheduledTime
              ? new Date(draft.scheduledTime).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : (lang === 'fr' ? 'Sans heure fixe' : 'No set time');

            return (
              <div
                key={draft.id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md transition-all group"
              >
                {isEditing ? (
                  /* Live Direct Inline Edit Form block list inside manager */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 border-neutral-100 dark:border-brand-border">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                        <Edit2 className="w-4 h-4 text-brand-blue" /> {lang === 'fr' ? 'Édition directe' : 'Direct Edit'}
                      </span>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-brand-bg rounded text-neutral-400 hover:text-red-500"
                        title="Annuler les modifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={4}
                      maxLength={280}
                      className="w-full p-3 text-xs border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text font-sans resize-none"
                    />

                    {/* Character limit progress count */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400">
                      <span>{editingText.length}/280 {lang === 'fr' ? 'caractères maximum' : 'max characters'}</span>
                      <span className={editingText.length > 250 ? 'text-amber-500 font-bold' : ''}>
                        {280 - editingText.length} {lang === 'fr' ? 'restants' : 'remaining'}
                      </span>
                    </div>

                    {/* Dynamic Scheduler date controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">{lang === 'fr' ? 'Date de parution' : 'Publish Date'}</label>
                        <input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border rounded-lg bg-transparent border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">{lang === 'fr' ? 'Heure de parution' : 'Publish Time'}</label>
                        <input
                          type="time"
                          value={editingTime}
                          onChange={(e) => setEditingTime(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border rounded-lg bg-transparent border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-brand-border hover:bg-neutral-100 dark:hover:bg-brand-bg text-xs font-semibold"
                      >
                        {lang === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                      <button
                        onClick={() => handleSaveEdit(draft)}
                        disabled={!editingText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Enregistrer' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard render block */
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      {draft.scheduledTime ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold tracking-wide flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Planifié pour :' : 'Scheduled for:'} {dateDisplay}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-neutral-200/50 dark:bg-brand-bg text-neutral-500 dark:text-brand-text-muted font-bold tracking-wide flex items-center gap-1 shrink-0">
                          <Bookmark className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Simple Brouillon' : 'Simple Draft'}
                        </span>
                      )}

                      <span className="text-[10px] text-neutral-400 font-mono font-semibold">
                        {lang === 'fr' ? 'Créé le' : 'Created on'} {new Date(draft.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </div>

                    {/* Rich text draft contents representation */}
                    <p className="text-xs leading-relaxed text-neutral-800 dark:text-brand-text whitespace-pre-wrap break-words">
                      {draft.text}
                    </p>

                    {/* Tag display list if tags are present */}
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {draft.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-brand-blue/5 text-brand-blue border border-brand-blue/10 text-[9px] font-bold px-2 py-0.5 rounded-lg"
                          >
                            #{tag.startsWith('#') ? tag.substring(1) : tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Control manager menu items footer */}
                    <div className="flex justify-between items-center border-t border-neutral-100 dark:border-brand-border pt-3">
                      <div>
                        {/* Quick actions direct editing */}
                        <button
                          onClick={() => onDraftSelected(draft)}
                          className="p-1 px-2.5 hover:bg-neutral-100 dark:hover:bg-brand-bg text-[10px] rounded-lg text-neutral-400 hover:text-brand-blue font-bold transition-all cursor-pointer"
                          title={lang === 'fr' ? "Ouvrir dans le compositeur principal" : "Open in main composer"}
                        >
                          {lang === 'fr' ? 'Éditer dans compositeur' : 'Edit in Composer'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Direct edit option here */}
                        <button
                          onClick={() => handleStartEdit(draft)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-bg text-neutral-400 hover:text-brand-blue rounded-lg transition-all cursor-pointer"
                          title={lang === 'fr' ? "Éditer directement ici" : "Direct edit here"}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onShareNow(draft)}
                          className="p-1.5 bg-brand-blue text-white hover:bg-brand-blue-hover rounded-lg transition-all cursor-pointer"
                          title={lang === 'fr' ? "Publier sur X maintenant" : "Publish on X now"}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDraftDeleted(draft.id)}
                          className="p-1.5 hover:bg-red-500/10 text-neutral-450 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          title={lang === 'fr' ? "Supprimer définitivement" : "Delete permanently"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-neutral-200 dark:border-brand-border rounded-2xl bg-white/20 dark:bg-brand-card/10">
          <Bookmark className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-xs font-semibold text-neutral-500 dark:text-brand-text-muted">
            {lang === 'fr' ? "Aucun brouillon ne correspond à votre recherche ou filtre." : "No drafts matched your keyword search or active filter."}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">
            {lang === 'fr' ? "Créez votre premier post dans le Compositeur pour l'enregistrer ici." : "Compose your first post in the Editor to save it here."}
          </p>
        </div>
      )}
    </div>
  );
}
