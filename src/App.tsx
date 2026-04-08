import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Settings2, 
  Layout, 
  Copy, 
  Download, 
  CheckCircle2, 
  ChevronRight,
  BrainCircuit,
  Eye,
  Volume2,
  Zap,
  Target,
  Clock,
  Briefcase,
  Loader2,
  Youtube,
  Play,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { generateLesson } from "./services/geminiService";
import { cn } from "./lib/utils";

export default function App() {
  const [topic, setTopic] = useState("Compound Interest");
  const [subject, setSubject] = useState("Finance");
  const [level, setLevel] = useState("intermediate");
  const [learningStyle, setLearningStyle] = useState("visual");
  const [engagement, setEngagement] = useState("medium");
  const [ytSettings, setYtSettings] = useState({
    preference: "tutorial",
    queueSize: 3,
    autoplay: true,
    includeInPrompt: true,
  });

  const SECTIONS = [
    { id: "intro", title: "Introduction", querySuffix: "introduction overview" },
    { id: "explanation", title: "Explanation", querySuffix: "concept explained simply" },
    { id: "visual", title: "Visual Learning", querySuffix: "animation visual guide" },
    { id: "examples", title: "Real Examples", querySuffix: "real world examples applications" },
    { id: "quiz", title: "Quiz & Practice", querySuffix: "quiz questions practice" },
    { id: "memory", title: "Memory Aids", querySuffix: "mnemonics memory tricks" },
    { id: "summary", title: "Summary", querySuffix: "summary key takeaways" },
    { id: "next", title: "What's Next", querySuffix: "advanced topics next steps" },
  ];

  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [sectionData, setSectionData] = useState<Record<string, { 
    customQuery: string,
  }>>(
    SECTIONS.reduce((acc, s) => ({ 
      ...acc, 
      [s.id]: { customQuery: "" } 
    }), {})
  );

  const [features, setFeatures] = useState({
    blooms: true,
    analogy: true,
    spacedRepetition: true,
    career: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [lesson, setLesson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const handleManualSearch = (sectionId: string) => {
    // Force re-render of the iframe by updating a local state if needed, 
    // but React handles it via the 'key' prop on the iframe.
    const currentQuery = sectionData[sectionId].customQuery;
    if (!currentQuery) return;
    
    // We can just trigger a state update to ensure the key changes if they hit search again with same text
    setSectionData(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], customQuery: currentQuery + " " }
    }));
    setTimeout(() => {
      setSectionData(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], customQuery: currentQuery }
      }));
    }, 10);
  };

  const openYouTubeSearch = (query: string) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
  };

  const getSystemPrompt = () => {
    return `Generate a comprehensive, interactive lesson based on the following parameters:
- **Topic**: ${topic}
- **Subject**: ${subject}
- **Level**: ${level}
- **Learning Style**: ${learningStyle}
- **Engagement Level**: ${engagement}

Follow this exact structure and formatting:
[... rest of the structure ...]`;
  };

  const handleCopyPrompt = () => {
    const youtubeSpec = ytSettings.includeInPrompt ? `
### 📺 Zero-API YouTube Integration Spec
- **Architecture**: No API Key required for embedding or thumbnails.
- **Embed URL Pattern**: \`https://www.youtube-nocookie.com/embed/[VIDEO_ID]\`
- **Thumbnail URL Pattern**: \`https://img.youtube.com/vi/[VIDEO_ID]/mqdefault.jpg\`
- **Per-Section Smart Queries**:
${SECTIONS.map(s => `  - **${s.title}**: \`[Topic] [Subject] ${s.querySuffix}\``).join("\n")}
- **Autoplay Behavior**: The first video in each section autoplays upon section activation.
- **Fallback Strategy**: 
  1. If embed fails, provide a direct link to YouTube search results: \`https://www.youtube.com/results?search_query=[Query]\`.
  2. Allow manual query override per section.
- **UI Requirements**: 
  - 8-tabbed interface for learning sections.
  - Dedicated video panel per tab with a queue of 3 alternatives.
  - Editable search box in each section for manual overrides.
` : "";

    const p = `Generate a comprehensive, interactive lesson based on the following parameters:
- **Topic**: ${topic}
- **Subject**: ${subject}
- **Level**: ${level}
- **Learning Style**: ${learningStyle}
- **Engagement Level**: ${engagement}

Follow this exact structure and formatting:

## 🎯 Lesson: [TOPIC] — [SUBJECT]
${youtubeSpec}
## 🧠 Personalised Explanation
Adapt your explanation precisely to the parameters. Use structured explanations with clear signposting. Connect to prior knowledge.
If learning style is visual, prioritise spatial diagrams, labelled mental imagery, and step-by-step visual walkthroughs.

## 🌍 Real-World Relevance
Open with a compelling real-world hook — a question, scenario, or surprising fact.

## 🎨 Visual Learning Section
Describe at least 2 imaginary diagrams in precise spatial language. Label all components. End each diagram with: "What do you notice about [element]?"

## 🎧 Audio Explanation Script
Write a full voiceover script (300–400 words). Use natural pauses: [pause], [breathe], [emphasis]. End with: "Before we move on, say this back to yourself: [one-sentence summary]"

## ⚡ Interactive Checkpoints
Insert 3 "Pause & Think" moments inside the lesson.
Each checkpoint must:
1. Pose a question.
2. Give a 10-second thinking prompt.
3. Reveal the answer with a short explanation.

### Adaptive Quiz
Generate exactly 8 questions tiered as: 3 easy → 3 medium → 2 hard.
${features.blooms ? "Tag each question with [Bloom's level: Remember / Understand / Apply / Analyse / Evaluate / Create]" : ""}
For each question provide: correct answer + why it's correct + 2 common wrong answers + diagnostic hint.

### Memory Architecture
- Primary mnemonic (acronym or rhyme)
- Story-based encoding
${features.spacedRepetition ? "- Spaced repetition schedule: Day 1 → Day 3 → Day 7 → Day 21" : ""}
- One "hook" image description.

### Real-World Bridge
- 2 concrete examples from everyday life.
${features.career ? "- Connect the topic to a current event, technology, or career path." : ""}
- "So what?" statement.

## ✅ Instant Feedback Engine
For every quiz question, provide:
- ✓ Correct answer with explanation.
- ✗ Common wrong answer and cognitive error.
- 💡 A retrieval hint.

## 📌 Summary Notes
5-bullet "exam-ready" summary. Highlight the most commonly examined point. Include one "danger zone" warning.

## 🚀 Adaptive Recommendation
1. Sub-topic to revisit.
2. Logical next topic.
3. 3-day micro practice plan.
4. Recommended resource type.

**Output language**: English
**Format rule**: Use Markdown headers, bold text, and clear sections. Avoid walls of text.`;
    navigator.clipboard.writeText(p);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };
  const handleGenerate = async () => {
    if (!topic || !subject) return;
    setIsGenerating(true);
    try {
      const result = await generateLesson({
        topic,
        subject,
        level,
        learningStyle,
        engagement,
        videos: [], // No specific videos passed in Zero-API mode
        features,
      });
      setLesson(result);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (lesson) {
      navigator.clipboard.writeText(lesson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const FeatureToggle = ({ 
    label, 
    active, 
    onClick, 
    icon: Icon 
  }: { 
    label: string; 
    active: boolean; 
    onClick: () => void; 
    icon: any 
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left",
        active 
          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        active ? "bg-indigo-100" : "bg-slate-100"
      )}>
        <Icon size={18} />
      </div>
      <span className="font-medium text-sm">{label}</span>
      {active && <CheckCircle2 size={16} className="ml-auto text-indigo-500" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">LessonCraft AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {promptCopied ? <CheckCircle2 size={18} className="text-green-500" /> : <Settings2 size={18} />}
              {promptCopied ? "Prompt Copied!" : "Copy Prompt"}
            </button>
            <button 
              onClick={handleCopy}
              disabled={!lesson}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-colors"
            >
              {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy Lesson"}
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic || !subject}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isGenerating ? "Crafting..." : "Generate Lesson"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Configuration */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Layout size={20} className="text-indigo-600" />
              <h2>Core Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Mechanics"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Level</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Style</label>
                <select 
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                  <option value="reading">Reading</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Youtube size={20} className="text-red-600" />
              <h2>YouTube Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Video Preference</label>
                <select 
                  value={ytSettings.preference}
                  onChange={(e) => setYtSettings(s => ({ ...s, preference: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="animated">Animated</option>
                  <option value="lecture">Lecture</option>
                  <option value="short explainer">Short Explainer</option>
                  <option value="documentary">Documentary</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Queue Size</label>
                  <select 
                    value={ytSettings.queueSize}
                    onChange={(e) => setYtSettings(s => ({ ...s, queueSize: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value={3}>3 Videos</option>
                    <option value={5}>5 Videos</option>
                    <option value={8}>8 Videos</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => setYtSettings(s => ({ ...s, autoplay: !s.autoplay }))}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium",
                      ytSettings.autoplay ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-slate-200 text-slate-600"
                    )}
                  >
                    {ytSettings.autoplay ? <Play size={16} fill="currentColor" /> : <Play size={16} />}
                    Autoplay
                  </button>
                </div>
              </div>

              <button
                onClick={() => setYtSettings(s => ({ ...s, includeInPrompt: !s.includeInPrompt }))}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                  ytSettings.includeInPrompt ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600"
                )}
              >
                <div className={cn("p-2 rounded-lg", ytSettings.includeInPrompt ? "bg-indigo-100" : "bg-slate-100")}>
                  <Settings2 size={18} />
                </div>
                <span className="font-medium text-sm">Include in Prompt</span>
                {ytSettings.includeInPrompt && <CheckCircle2 size={16} className="ml-auto text-indigo-500" />}
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Settings2 size={20} className="text-indigo-600" />
              <h2>Advanced Features</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <FeatureToggle 
                label="Bloom's Taxonomy" 
                active={features.blooms} 
                icon={BrainCircuit}
                onClick={() => setFeatures(f => ({ ...f, blooms: !f.blooms }))} 
              />
              <FeatureToggle 
                label="Analogy Engine" 
                active={features.analogy} 
                icon={Zap}
                onClick={() => setFeatures(f => ({ ...f, analogy: !f.analogy }))} 
              />
              <FeatureToggle 
                label="Spaced Repetition" 
                active={features.spacedRepetition} 
                icon={Clock}
                onClick={() => setFeatures(f => ({ ...f, spacedRepetition: !f.spacedRepetition }))} 
              />
              <FeatureToggle 
                label="Career Connections" 
                active={features.career} 
                icon={Briefcase}
                onClick={() => setFeatures(f => ({ ...f, career: !f.career }))} 
              />
            </div>
          </section>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Video Lab Panel */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-8 py-4 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Youtube size={16} className="text-red-600" />
                <span>Video Lab — Zero API Mode</span>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-100 bg-white custom-scrollbar">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "px-6 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2",
                    activeSection === section.id 
                      ? "text-indigo-600 border-indigo-600 bg-indigo-50/30" 
                      : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {section.title}
                </button>
              ))}
            </div>
            
            <div className="p-6 space-y-6">
              {(topic && subject) ? (
                <div className="grid grid-cols-1 gap-6">
                  {/* Player */}
                  <div className="space-y-4">
                    <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative group">
                      <iframe
                        key={`${activeSection}-${sectionData[activeSection].customQuery}-${topic}-${subject}`}
                        src={`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(sectionData[activeSection].customQuery || `${topic} ${subject} ${SECTIONS.find(s => s.id === activeSection)?.querySuffix}`)}&autoplay=${ytSettings.autoplay ? 1 : 0}`}
                        title="YouTube Search Results"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    
                    {/* Manual Search Box */}
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <input 
                          type="text"
                          placeholder="Refine search for this section..."
                          value={sectionData[activeSection].customQuery}
                          onChange={(e) => setSectionData(prev => ({
                            ...prev,
                            [activeSection]: { ...prev[activeSection], customQuery: e.target.value }
                          }))}
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <button 
                        onClick={() => handleManualSearch(activeSection)}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
                      >
                        Reload Video
                      </button>
                      <button 
                        onClick={() => openYouTubeSearch(sectionData[activeSection].customQuery || `${topic} ${subject} ${SECTIONS.find(s => s.id === activeSection)?.querySuffix}`)}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
                        title="Open on YouTube"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                  <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4">
                    <Youtube size={32} />
                  </div>
                  <h4 className="text-slate-900 font-bold">No videos for this section</h4>
                  <p className="text-slate-500 text-sm max-w-xs mt-1">
                    Type a topic or subject in the sidebar to automatically fetch relevant educational videos for each section.
                  </p>
                </div>
              )}
            </div>
          </section>

          <AnimatePresence mode="wait">
            {!lesson && !isGenerating ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="bg-indigo-50 p-6 rounded-full text-indigo-600 mb-6">
                  <BookOpen size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Craft?</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Configure your lesson parameters on the left and click "Generate Lesson" to create a structured, AI-powered educational experience.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-sm text-slate-600 border border-slate-100">
                    <BrainCircuit size={16} />
                    <span>Bloom's Tagging</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-sm text-slate-600 border border-slate-100">
                    <Zap size={16} />
                    <span>Analogy Engine</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-sm text-slate-600 border border-slate-100">
                    <Target size={16} />
                    <span>Adaptive Quiz</span>
                  </div>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <Loader2 className="animate-spin text-indigo-600 relative" size={64} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-2">Crafting Your Lesson</h3>
                <p className="text-slate-500 animate-pulse">Gemini is structuring knowledge, generating diagrams, and building quizzes...</p>
                
                <div className="mt-12 w-full max-w-xs space-y-4">
                  {[
                    "Analyzing topic complexity...",
                    "Applying learning style filters...",
                    "Generating visual descriptions...",
                    "Designing adaptive quiz questions..."
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-100 px-8 py-4 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Eye size={16} />
                    <span>Preview Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                      {level}
                    </div>
                    <div className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      {learningStyle}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 lg:p-12 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-indigo-600">
                  <ReactMarkdown
                    components={{
                      h2: ({node, ...props}) => (
                        <h2 className="flex items-center gap-3 mt-12 first:mt-0 border-b border-slate-100 pb-4" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="text-indigo-600 font-semibold mt-8" {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl my-8 italic text-indigo-900" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none pl-0" {...props} />
                      ),
                      li: ({node, ...props}) => (
                        <li className="flex items-start gap-2 before:content-['•'] before:text-indigo-500 before:font-bold" {...props} />
                      )
                    }}
                  >
                    {lesson || ""}
                  </ReactMarkdown>
                </div>

                <div className="border-t border-slate-100 p-8 bg-slate-50/50 flex items-center justify-center gap-4">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                    {copied ? "Copied to Clipboard" : "Copy Full Text"}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    <Download size={20} />
                    Export as PDF
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles size={20} />
            <span className="font-bold">LessonCraft AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          </div>
          <p className="text-sm text-slate-400">
            Powered by Gemini 2.0 Flash
          </p>
        </div>
      </footer>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, aside, footer, .border-t { display: none !important; }
          main { display: block !important; padding: 0 !important; }
          .lg\\:col-span-8 { width: 100% !important; }
          .bg-white { border: none !important; box-shadow: none !important; }
          .prose { max-width: 100% !important; }
        }
      `}} />
    </div>
  );
}
