import React, { useState, useEffect } from 'react';
import { Layout, Plus, Trash2, Check, FileText, Send, Sparkles, HelpCircle, X, Edit2 } from 'lucide-react';
import { getTemplates, saveTemplates, PostTemplate } from '../db';
import { getTranslation } from '../translations';

interface TemplatesManagerProps {
  onUseTemplate: (text: string) => void;
  brandColor?: string;
  language?: 'fr' | 'en';
}

const PRESET_TEMPLATES_FR: PostTemplate[] = [
  {
    id: 'preset-thread',
    title: '🧵 Lancement de Thread (Fil)',
    text: "🧵 fil d'actualités : Aujourd'hui, je vous partage le plan étape par étape pour [Insérer un sujet passionnant/votre projet].\n\nVoici ce que nous allons voir :\n1. Le problème principal\n2. Ma méthode unique\n3. Les résultats concrets\n\nDéroulez ci-dessous 👇",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-launch',
    title: '🚀 Annonce de Produit / Projet',
    text: "🚀 C'est ENFIN prêt ! Après des semaines de travail acharné, je vous présente [Nom de votre Projet/Service].\n\nL'objectif ? Résoudre définitivement [Problème principal] en un clic.\n\nAccédez au lien ci-dessous et profitez de l'offre spéciale de lancement :\n👉 [Lien] \n\nQu'en pensez-vous ?",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-quote',
    title: '💡 Partage Inspirant / Citation',
    text: "💡 Leçon du jour en [Votre Domaine/Thématique] :\n\n\"[Votre Citation ou Pensée favorite]\"\n\nPourquoi cette pensée ? Parce qu'on oublie trop souvent que [Bref commentaire ou explication pertinente].\n\nVous êtes d'accord avec ça ? Partagez votre avis en réponse !",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-event',
    title: '📅 Invitation Événement / Live',
    text: "📅 Bloquez votre calendrier !\n\nJe serai en direct ce [Jour] à [Heure] pour une session exceptionnelle en compagnie de [Intervenant].\n\nAu programme :\n- [Sujet 1]\n- [Sujet 2]\n- Session Q&A libre\n\nInscrivez-vous gratuitement ici :\n👉 [Lien de l'événement]",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-question',
    title: '🤔 Question Ouverte / Engagement',
    text: "🤔 Question pour tous les créateurs / tech du fil :\n\nQuel est votre outil fétiche en 2026 pour [Insérer une tâche, ex: organiser vos brouillons de contenu] ?\n\n1. [Option A]\n2. [Option B]\n3. [Option C]\n\nDites-moi pourquoi en commentaire 👇 !",
    createdAt: new Date().toISOString()
  }
];

const PRESET_TEMPLATES_EN: PostTemplate[] = [
  {
    id: 'preset-thread',
    title: '🧵 Thread Kickoff',
    text: "🧵 thread: Today, I'm sharing the step-by-step blueprint on how to [Insert brilliant topic/project].\n\nHere is what we'll discuss:\n1. The core challenge\n2. My unique framework\n3. Concrete actionable takeaways\n\nDive inside 👇",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-launch',
    title: '🚀 Product / Project Launch',
    text: "🚀 It is FINALLY live! After weeks of intense work, here is [Name of your Project/Service].\n\nThe goal? Solve [Main pain point] permanently in just one tap.\n\nGrab early access or checkout the special details here:\n👉 [Link]\n\nLet me know your thoughts!",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-quote',
    title: '💡 Inspiring Insight / Quote',
    text: "💡 Today's key insight in [Your Subject/Niche]:\n\n\"[Your Favorite Quote or Insight]\"\n\nWhy does this matter? Because we often overlook the fact that [Brief explanation/takeaway].\n\nDo you resonate with this? Let me know in the comments!",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-event',
    title: '📅 Event Invitation / Live Show',
    text: "📅 Block your calendars!\n\nI will be hosting a live session on [Day] at [Time] with [Guest speaker].\n\nWe will explore:\n- [Topic 1]\n- [Topic 2]\n- Free open Q&A session\n\nSecure your free spot now:\n👉 [Event Link]",
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-question',
    title: '🤔 Open Question / Engagement',
    text: "🤔 Quick question for all creators/builders:\n\nWhat is your go-to companion tool in 2026 to [Insert task, e.g. organize content ideas]?\n\n1. [Option A]\n2. [Option B]\n3. [Option C]\n\nLet me know why below 👇!",
    createdAt: new Date().toISOString()
  }
];

export default function TemplatesManager({
  onUseTemplate,
  brandColor,
  language
}: TemplatesManagerProps) {
  const lang = language || 'fr';
  const presetList = lang === 'fr' ? PRESET_TEMPLATES_FR : PRESET_TEMPLATES_EN;
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load custom templates on mount
  useEffect(() => {
    const loaded = getTemplates();
    setTemplates(loaded);
  }, []);

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newTpl: PostTemplate = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      text: newText.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [...templates, newTpl];
    setTemplates(updated);
    saveTemplates(updated);

    // Reset fields
    setNewTitle('');
    setNewText('');
    setShowAddForm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="templates-manager-view">
      
      {/* Header Panel */}
      <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-neutral-200 dark:border-neutral-850">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{lang === 'fr' ? 'Modèles Prédéfinis de Post' : 'Predefined Post Templates'}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {lang === 'fr' 
              ? "Gagnez du temps en enregistrant vos structures de posts ou utilisez nos modèles optimisés pour l'engagement."
              : "Save time by preparing reusable layouts or loading our engagement-optimized post structures."}
          </p>
        </div>
        
        {/* Trigger to show create form overlay or block */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-hover text-xs font-bold text-white rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer self-start md:self-auto"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" /> {lang === 'fr' ? 'Fermer le formulaire' : 'Close Form'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> {lang === 'fr' ? 'Créer un modèle' : 'Create Template'}
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-pulse">
          <Check className="w-4 h-4" /> {lang === 'fr' ? 'Modèle personnalisé sauvegardé avec succès !' : 'Custom template saved successfully!'}
        </div>
      )}

      {/* Creation form sub-block */}
      {showAddForm && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-brand-text mb-4">{lang === 'fr' ? 'Ajouter un nouveau modèle personnalisé' : 'Add a New Custom Template'}</h3>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-1.5">{lang === 'fr' ? 'Titre du modèle' : 'Template Title'}</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={lang === 'fr' ? "ex: Fil de veille techno du vendredi" : "e.g., Weekly Friday tech digest"}
                className="w-full px-3,5 py-2 text-xs border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 dark:text-brand-text-muted mb-1.5">{lang === 'fr' ? 'Texte prédéfini (Corps du post)' : 'Predefined Post Body'}</label>
              <textarea
                required
                rows={5}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={lang === 'fr' ? "Rédigez le contenu par défaut de votre modèle..." : "Write your default template body contents..."}
                className="w-full p-3.5 text-xs border rounded-xl bg-transparent focus:ring-1 focus:ring-brand-blue border-neutral-300 dark:border-brand-border text-neutral-900 dark:text-brand-text font-sans resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-brand-border hover:bg-neutral-100 dark:hover:bg-brand-bg text-xs font-semibold text-neutral-700 dark:text-brand-text"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all cursor-pointer"
              >
                {lang === 'fr' ? 'Sauvegarder le modèle' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid displays : User Custom templates & Built-in starting templates */}
      <div className="space-y-8">
        
        {/* User Custom Templates */}
        <div>
          <h3 className="text-sm font-bold text-neutral-400 dark:text-brand-text-muted uppercase tracking-wider mb-4">{lang === 'fr' ? 'Vos Modèles Customisés' : 'Your Custom Templates'}</h3>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-950 dark:text-brand-text">
                        {tpl.title}
                      </span>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-1 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 rounded transition-all cursor-pointer"
                        title={lang === 'fr' ? "Supprimer ce modèle" : "Delete this template"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans line-clamp-4 whitespace-pre-wrap">
                      {tpl.text}
                    </p>
                  </div>

                  <button
                    onClick={() => onUseTemplate(tpl.text)}
                    className="w-full py-2 mt-4 border border-brand-blue/30 hover:border-brand-blue bg-brand-blue/5 hover:bg-brand-blue text-brand-blue hover:text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Utiliser ce modèle' : 'Use this Template'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-neutral-200 dark:border-brand-border rounded-2xl bg-white/10 dark:bg-brand-card/5">
              <Layout className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
              <p className="text-xs font-semibold text-neutral-500 dark:text-brand-text-muted">{lang === 'fr' ? 'Aucun modèle personnalisé créé.' : 'No custom templates found.'}</p>
              <p className="text-[10px] text-neutral-400 mt-1">{lang === 'fr' ? 'Cliquez sur "Créer un modèle" pour ajouter vos propres structures.' : 'Click "Create Template" to save your own structures here.'}</p>
            </div>
          )}
        </div>

        {/* Official preset templates */}
        <div>
          <h3 className="text-sm font-bold text-neutral-400 dark:text-brand-text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500" /> {lang === 'fr' ? "Structures d'engagement Officielles" : "Official Blueprints for High Engagement"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presetList.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-brand-border bg-white/50 dark:bg-brand-card backdrop-blur-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="font-bold text-xs text-neutral-950 dark:text-brand-text flex items-center gap-1">
                    {tpl.title}
                  </span>
                  
                  <p className="text-xs text-neutral-400 dark:text-neutral-450 leading-relaxed font-sans line-clamp-5 whitespace-pre-wrap">
                    {tpl.text}
                  </p>
                </div>

                <button
                  onClick={() => onUseTemplate(tpl.text)}
                  className="w-full py-2 mt-4 border border-violet-500/30 hover:border-violet-500 bg-violet-500/5 hover:bg-violet-500 text-violet-500 hover:text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Charger le modèle' : 'Load Template'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
