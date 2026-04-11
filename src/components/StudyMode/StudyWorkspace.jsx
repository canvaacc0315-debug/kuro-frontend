import React, { useState, useEffect, useRef } from 'react';
import { studyApi } from '../../services/studyApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Timer, BookOpen, Brain, Play, Pause, RotateCcw, Download, Save,
    ChevronRight, ChevronLeft, Sparkles, CheckCircle2, XCircle, Trophy,
    ClipboardList, Clock, Flame, Volume2, VolumeX, Music, Wind, Coffee, CloudRain, Trash2, Plus
} from 'lucide-react';
import './StudyWorkspace.css';

// --- Premium Shared Components ---

// 0. Mesh Background for Immersive Feel
const MeshBackground = () => (
    <div className="study-mesh-container">
        <div className="mesh-gradient mesh-1" />
        <div className="mesh-gradient mesh-2" />
        <div className="mesh-gradient mesh-3" />
        <div className="mesh-noise" />
    </div>
);

// 1. Ambient Audio Station
const AmbientAudioStation = () => {
    const [activeSound, setActiveSound] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);

    const sounds = [
        { id: 'lofi-1', icon: <Music size={16} />, label: 'Lofi Girl / Chill', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
        { id: 'lofi-2', icon: <Wind size={16} />, label: 'Lofi Beats', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' },
        { id: 'rain', icon: <CloudRain size={16} />, label: 'Cozy Rain', url: 'https://stream.zeno.fm/zndn2vea4wzuv' },
        { id: 'cafe', icon: <Coffee size={16} />, label: 'Jazz Cafe', url: 'https://stream.zeno.fm/5yzh917cbg8uv' },
    ];

    const toggleSound = (sound) => {
        if (activeSound?.id === sound.id) {
            setActiveSound(null);
            if (audioRef.current) audioRef.current.pause();
        } else {
            setActiveSound(sound);
            if (audioRef.current) {
                audioRef.current.src = sound.url;
                audioRef.current.volume = volume;
                audioRef.current.play();
            }
        }
    };

    return (
        <div className="ambient-station">
            <div className="station-header">
                <Volume2 size={14} />
                <span>Focus Sounds</span>
            </div>
            <div className="sound-grid">
                {sounds.map(s => (
                    <button
                        key={s.id}
                        className={`sound-btn ${activeSound?.id === s.id ? 'active' : ''}`}
                        onClick={() => toggleSound(s)}
                        title={s.label}
                    >
                        {s.icon}
                    </button>
                ))}
            </div>
            <audio ref={audioRef} loop />
        </div>
    );
};

// 1. Pomodoro Timer Panel Component
const PomodoroPanel = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [notes, setNotes] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setIsRunning(false);
        if (newMode === 'focus') setTimeLeft(25 * 60);
        else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
        else if (newMode === 'longBreak') setTimeLeft(15 * 60);
    };

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        setSaveStatus('Saving');
        setTimeout(() => setSaveStatus('All saved'), 1200);
    };

    const handleDownload = () => {
        if (!notes.trim()) return;
        const blob = new Blob([notes], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rovex-study-notes-${new Date().toLocaleDateString()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="study-layout">
            <div className="study-main-card pomodoro-card">
                <div className="pomodoro-header">
                    <div className="mode-badges">
                        {['focus', 'shortBreak', 'longBreak'].map((m) => (
                            <button
                                key={m}
                                className={`mode-badge ${mode === m ? 'active' : ''}`}
                                onClick={() => handleModeChange(m)}
                            >
                                {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`timer-visual ${isRunning ? 'running' : ''}`}>
                    <svg className="progress-ring" viewBox="0 0 100 100">
                        <circle className="progress-ring-bg" cx="50" cy="50" r="45" />
                        <motion.circle
                            className="progress-ring-bar"
                            cx="50" cy="50" r="45"
                            style={{
                                strokeDasharray: 283,
                                strokeDashoffset: 283 - (283 * progress) / 100
                            }}
                        />
                    </svg>
                    <div className="timer-content">
                        <span className="timer-digits">{formatTime(timeLeft)}</span>
                        <span className="timer-sub">{mode === 'focus' ? 'STAY FOCUSED' : 'TAKE A BREATH'}</span>
                    </div>
                </div>

                <div className="timer-controls">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="timer-action reset"
                        onClick={() => handleModeChange(mode)}
                    >
                        <RotateCcw size={20} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={`timer-action toggle ${isRunning ? 'running' : ''}`}
                        onClick={() => setIsRunning(!isRunning)}
                    >
                        {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
                    </motion.button>
                    <div className="timer-action empty" />
                </div>
            </div>

            <div className="study-main-card scratchpad-card">
                <div className="panel-header-mini">
                    <div className="header-left">
                        <div className="title-row">
                            <ClipboardList size={18} className="text-accent" />
                            <h3>Quick Scratchpad</h3>
                        </div>
                        <div className={`save-status-pill ${saveStatus === 'Saving' ? 'saving' : ''}`}>
                            <div className="status-dot" />
                            <span>{saveStatus || 'Ready'}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="icon-btn download-notes-btn" title="Download Notes" onClick={handleDownload}>
                            <Download size={18} />
                        </button>
                    </div>
                </div>
                <textarea
                    className="scratchpad-input"
                    placeholder="Capture your thoughts here while you study..."
                    value={notes}
                    onChange={handleNotesChange}
                />
            </div>
        </div>
    );
};

// 2. AI Flashcard Builder
const FlashcardPanel = ({ uploadedFiles = [] }) => {
    const [selectedPdfId, setSelectedPdfId] = useState('');
    const [flashcardCount, setFlashcardCount] = useState(10);
    const [flashcards, setFlashcards] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeCard, setActiveCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleGenerate = async () => {
        if (!selectedPdfId) return;
        setLoading(true);
        try {
            const data = await studyApi.generateFlashcards(selectedPdfId, flashcardCount);
            if (data.flashcards) {
                setFlashcards(data.flashcards);
                setActiveCard(0);
                setIsFlipped(false);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    return (
        <div className="study-container">
            {!flashcards ? (
                <div className="setup-container">
                    <div className="setup-header">
                        <div className="setup-icon-box">
                            <Sparkles className="text-accent" size={32} />
                        </div>
                        <h2>Flashcard Generator</h2>
                        <p>Turn any PDF into a deck of interactive study cards in seconds.</p>
                    </div>

                    <div className="setup-form">
                        <div className="form-group">
                            <label>Source Document</label>
                            <select
                                className="premium-select-study"
                                value={selectedPdfId}
                                onChange={(e) => setSelectedPdfId(e.target.value)}
                            >
                                <option value="">Select a PDF...</option>
                                {uploadedFiles.filter(f => f.backendId).map(f => (
                                    <option key={f.backendId} value={f.backendId}>
                                        {f.name || 'Untitled Document'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <div className="label-row">
                                <label>Card Count</label>
                                <span>{flashcardCount}</span>
                            </div>
                            <input
                                type="range" min="5" max="30"
                                value={flashcardCount}
                                onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
                                className="premium-range"
                            />
                        </div>

                        <button
                            className="premium-btn primary-btn"
                            disabled={!selectedPdfId || loading}
                            onClick={handleGenerate}
                        >
                            {loading ? <LoaderAnimation /> : 'Generate Cards'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="deck-container">
                    <div className="deck-header">
                        <div className="deck-progress">
                            <span className="count">{activeCard + 1} / {flashcards.length}</span>
                            <div className="progress-track">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((activeCard + 1) / flashcards.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <button className="text-btn" onClick={() => setFlashcards(null)}>New Deck</button>
                    </div>

                    <div className="flashcard-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
                        <motion.div
                            className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            <div className="card-face card-front">
                                <div className="card-tag">QUESTION</div>
                                <h3>{flashcards[activeCard]?.front}</h3>
                                <div className="card-hint">Tap to see answer</div>
                            </div>
                            <div className="card-face card-back">
                                <div className="card-tag">ANSWER</div>
                                <p>{flashcards[activeCard]?.back}</p>
                                <div className="card-hint">Tap to see question</div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="deck-controls">
                        <button
                            className="nav-btn"
                            disabled={activeCard === 0}
                            onClick={(e) => { e.stopPropagation(); setActiveCard(prev => prev - 1); setIsFlipped(false); }}
                        >
                            <ChevronLeft size={18} /> <span>Previous</span>
                        </button>
                        <button
                            className="nav-btn primary"
                            disabled={activeCard === flashcards.length - 1}
                            onClick={(e) => { e.stopPropagation(); setActiveCard(prev => prev + 1); setIsFlipped(false); }}
                        >
                            <span>Next</span> <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Quiz Master
const QuizPanel = ({ uploadedFiles = [] }) => {
    const [selectedPdfId, setSelectedPdfId] = useState('');
    const [quizCount, setQuizCount] = useState(5);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [selectedAns, setSelectedAns] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleGenerate = async () => {
        if (!selectedPdfId) return;
        setLoading(true);
        try {
            const data = await studyApi.generateQuiz(selectedPdfId, quizCount);
            if (data.quiz) {
                setQuiz(data.quiz);
                setActiveIdx(0);
                setSelectedAns(null);
                setScore(0);
                setFinished(false);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleAnswer = (opt) => {
        if (selectedAns) return;
        setSelectedAns(opt);
        if (opt === quiz[activeIdx].correctAnswer) setScore(s => s + 1);
    };

    const handleNext = () => {
        if (activeIdx < quiz.length - 1) {
            setActiveIdx(prev => prev + 1);
            setSelectedAns(null);
        } else {
            setFinished(true);
        }
    };

    return (
        <div className="study-container">
            {!quiz ? (
                <div className="setup-container">
                    <div className="setup-header">
                        <div className="setup-icon-box">
                            <Brain size={32} />
                        </div>
                        <h2>The Quiz Master</h2>
                        <p>Generate precise multiple-choice questions from your documents.</p>
                    </div>

                    <div className="setup-form">
                        <div className="form-group">
                            <label>Source Document</label>
                            <select
                                className="premium-select-study"
                                value={selectedPdfId}
                                onChange={(e) => setSelectedPdfId(e.target.value)}
                            >
                                <option value="">Select a PDF...</option>
                                {uploadedFiles.filter(f => f.backendId).map(f => (
                                    <option key={f.backendId} value={f.backendId}>
                                        {f.name || 'Untitled Document'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <div className="label-row">
                                <label>Question Count</label>
                                <span>{quizCount}</span>
                            </div>
                            <input
                                type="range" min="5" max="30"
                                value={quizCount}
                                onChange={(e) => setQuizCount(parseInt(e.target.value))}
                                className="premium-range"
                            />
                        </div>
                        <button className="premium-btn primary-btn" disabled={!selectedPdfId || loading} onClick={handleGenerate}>
                            {loading ? <LoaderAnimation /> : 'Start Quiz'}
                        </button>
                    </div>
                </div>
            ) : finished ? (
                <motion.div
                    className="quiz-results-premium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Trophy size={64} className="trophy-icon" />
                    <h2>Knowledge Mastered!</h2>
                    <div className="result-score">
                        <span className="final">{score}</span>
                        <span className="total">/ {quiz.length}</span>
                    </div>
                    <p>Accuracy: {Math.round((score / quiz.length) * 100)}%</p>
                    <button className="premium-btn primary-btn" onClick={() => setQuiz(null)}>Try Another</button>
                </motion.div>
            ) : quiz.length > 0 && quiz[activeIdx] ? (
                <div className="quiz-active-container">
                    <div className="quiz-header">
                        <div className="quiz-progress-bar">
                            <div className="progress-label">Question {activeIdx + 1} of {quiz.length}</div>
                            <div className="track"><div className="fill" style={{ width: `${((activeIdx + 1) / quiz.length) * 100}%` }} /></div>
                        </div>
                    </div>

                    <motion.div
                        key={activeIdx}
                        className="question-card-premium"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3>{quiz[activeIdx].question}</h3>
                        <div className="options-grid">
                            {quiz[activeIdx].options?.map((opt, i) => {
                                let state = '';
                                if (selectedAns) {
                                    if (opt === quiz[activeIdx].correctAnswer) state = 'correct';
                                    else if (opt === selectedAns) state = 'wrong';
                                    else state = 'disabled';
                                }
                                return (
                                    <button
                                        key={i}
                                        className={`option-btn ${state}`}
                                        onClick={() => handleAnswer(opt)}
                                        disabled={!!selectedAns}
                                    >
                                        <div className="opt-letter">{String.fromCharCode(65 + i)}</div>
                                        <div className="opt-text">{opt}</div>
                                        {state === 'correct' && <CheckCircle2 size={18} className="status-icon" />}
                                        {state === 'wrong' && <XCircle size={18} className="status-icon" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {selectedAns && (
                            <motion.div
                                className="explanation-drawer"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                            >
                                <div className="explanation-content">
                                    <strong>Insight:</strong> {quiz[activeIdx].explanation}
                                </div>
                                <button className="premium-btn primary-btn" onClick={handleNext}>
                                    {activeIdx === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="no-questions-error" style={{ textAlign: 'center', padding: '40px' }}>
                    <Brain size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <h3>No questions found</h3>
                    <p>We couldn't generate a quiz for this document. Try another one!</p>
                    <button className="premium-btn primary-btn" style={{ marginTop: '20px' }} onClick={() => setQuiz(null)}>Go Back</button>
                </div>
            )}
        </div>
    );
};

// 4. Study Roadmap (Goal Tracker)
const RoadmapPanel = () => {
    const [goals, setGoals] = useState([
        { id: 1, text: 'Read Chapter 4: Neural Networks', completed: true },
        { id: 2, text: 'Generate 20 Flashcards from PDF', completed: false },
        { id: 3, text: 'Score 80%+ on Practice Quiz', completed: false },
    ]);
    const [newGoal, setNewGoal] = useState('');

    const toggleGoal = (id) => {
        setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    const deleteGoal = (e, id) => {
        e.stopPropagation();
        setGoals(goals.filter(g => g.id !== id));
    };

    const addGoal = (e) => {
        e.preventDefault();
        if (!newGoal.trim()) return;
        setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
        setNewGoal('');
    };

    return (
        <div className="study-container roadmap-container">
            <div className="setup-header">
                <div className="setup-icon-box orange">
                    <Flame size={32} />
                </div>
                <h2>Study Roadmap</h2>
                <p>Track your learning milestones and crush your study goals.</p>
            </div>

            <div className="roadmap-card study-main-card">
                <form className="roadmap-input-row" onSubmit={addGoal}>
                    <input
                        type="text"
                        placeholder="What's your next study goal?"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                    />
                    <button type="submit" className="roadmap-add-btn">
                        <Plus size={18} />
                        <span>Add Goal</span>
                    </button>
                </form>

                <div className="goals-list">
                    {goals.map(goal => (
                        <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`} onClick={() => toggleGoal(goal.id)}>
                            <div className="goal-check">
                                {goal.completed && <CheckCircle2 size={16} />}
                            </div>
                            <span>{goal.text}</span>
                            <button className="goal-delete-btn" onClick={(e) => deleteGoal(e, goal.id)} title="Delete Goal">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LoaderAnimation = () => (
    <div className="premium-loader">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
    </div>
);

// Main Study Workspace Component
const StudyWorkspace = ({ uploadedFiles = [] }) => {
    const [activeTab, setActiveTab] = useState('pomodoro');

    const tabs = [
        { id: 'pomodoro', icon: <Timer size={18} />, label: 'Deep Focus' },
        { id: 'flashcards', icon: <BookOpen size={18} />, label: 'Flashcards' },
        { id: 'quiz', icon: <Brain size={18} />, label: 'Master Quiz' },
        { id: 'roadmap', icon: <Flame size={18} />, label: 'Roadmap' },
    ];

    return (
        <div className="study-workspace-root">
            <div className="study-sidebar">
                <div className="sidebar-brand">
                    <Sparkles className="brand-sparkle" size={20} />
                    <span>Study Studio</span>
                </div>

                <div className="study-nav">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="nav-icon">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                            {activeTab === tab.id && <motion.div layoutId="nav-glow" className="nav-glow" />}
                        </button>
                    ))}
                </div>

                <AmbientAudioStation />

                <div className="study-stats-mini">
                    <div className="stat-item">
                        <Flame size={14} className="text-orange" />
                        <span>3 Day Streak</span>
                    </div>
                </div>
            </div>

            <main className="study-content-area">
                <MeshBackground />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="study-tab-wrapper"
                    >
                        {activeTab === 'pomodoro' && <PomodoroPanel />}
                        {activeTab === 'flashcards' && <FlashcardPanel uploadedFiles={uploadedFiles} />}
                        {activeTab === 'quiz' && <QuizPanel uploadedFiles={uploadedFiles} />}
                        {activeTab === 'roadmap' && <RoadmapPanel />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default StudyWorkspace;
