import React, { useState, useEffect } from 'react';
import { studyApi } from '../../services/studyApi';
import './StudyWorkspace.css';

// 1. Pomodoro Timer Panel Component
const PomodoroPanel = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus' or 'break'
    const [notes, setNotes] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    // Timer logic
    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            // Play sound or pop notification here in future
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    // Format time display (MM:SS)
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

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        handleModeChange(mode);
    };

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        setSaveStatus('Saving...');
        // Simple mock auto-save delay
        setTimeout(() => setSaveStatus('All saved.'), 1000);
    };

    const handleDownloadNotes = () => {
        if (!notes.trim()) return;
        const element = document.createElement("a");
        const file = new Blob([notes], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Study_Notes_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="study-panel">
            <div className="panel-header">
                <h2>⏱️ Focus Workstation</h2>
                <p>Use the Pomodoro technique to study deeply and take structured breaks.</p>
            </div>

            <div className="pomodoro-container">
                <div className="timer-section">
                    <div className="timer-mode-toggles">
                        <button className={`timer-mode-btn ${mode === 'focus' ? 'active' : ''}`} onClick={() => handleModeChange('focus')}>Focus (25m)</button>
                        <button className={`timer-mode-btn ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => handleModeChange('shortBreak')}>Short Break (5m)</button>
                        <button className={`timer-mode-btn ${mode === 'longBreak' ? 'active' : ''}`} onClick={() => handleModeChange('longBreak')}>Long Break (15m)</button>
                    </div>

                    <div className="time-display">{formatTime(timeLeft)}</div>

                    <div className="timer-controls">
                        <button className="timer-btn primary" onClick={toggleTimer}>
                            {isRunning ? 'Pause' : 'Start'}
                        </button>
                        <button className="timer-btn secondary" onClick={resetTimer}>
                            Reset
                        </button>
                    </div>
                </div>

                <div className="notepad-section">
                    <div className="notepad-header">
                        <h3>Quick Scratchpad</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="save-status">{saveStatus}</span>
                            <button className="download-notes-btn" onClick={handleDownloadNotes} title="Download to PC">
                                ⬇️ Download
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="study-textarea"
                        placeholder="Type your notes, ideas, or to-do list here while you focus..."
                        value={notes}
                        onChange={handleNotesChange}
                    />
                </div>
            </div>
        </div>
    );
};

// 2. AI Flashcard Builder
const FlashcardPanel = ({ uploadedFiles = [] }) => {
    const [selectedPdfId, setSelectedPdfId] = useState('');
    const [flashcards, setFlashcards] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeCard, setActiveCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!selectedPdfId) return;
        setLoading(true);
        setError('');
        try {
            const data = await studyApi.generateFlashcards(selectedPdfId, 10);
            if (data.flashcards && data.flashcards.length > 0) {
                setFlashcards(data.flashcards);
                setActiveCard(0);
                setIsFlipped(false);
            } else {
                setError('Could not generate flashcards for this document.');
            }
        } catch (err) {
            setError(err.message || 'Error generating flashcards.');
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => setActiveCard((prev) => Math.min(prev + 1, flashcards.length - 1)), 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => setActiveCard((prev) => Math.max(prev - 1, 0)), 150);
    };

    return (
        <div className="study-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📇 AI Flashcard Generator</h2>
                    <p>Instantly convert class materials or textbooks into interactive study flips.</p>
                </div>
                {flashcards && (
                    <button className="timer-btn secondary" onClick={() => setFlashcards(null)} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                        Start Over
                    </button>
                )}
            </div>

            {!flashcards ? (
                <div className="placeholder-state">
                    <div className="placeholder-icon">📚</div>
                    <h3>Select a PDF to Generate Flashcards</h3>
                    <p>RovexAI will scan your document and extract the most important definitions and dates into interactive cards.</p>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', width: '100%', maxWidth: '500px' }}>
                        <select
                            className="study-select"
                            style={{ flexGrow: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={selectedPdfId}
                            onChange={(e) => setSelectedPdfId(e.target.value)}
                        >
                            <option value="">-- Choose a PDF --</option>
                            {uploadedFiles.map(f => (
                                <option key={f.backendId} value={f.backendId}>{f.name}</option>
                            ))}
                        </select>
                        <button
                            className="study-upload-btn"
                            onClick={handleGenerate}
                            disabled={!selectedPdfId || loading}
                            style={{ opacity: (!selectedPdfId || loading) ? 0.6 : 1 }}
                        >
                            {loading ? 'Generating...' : 'Generate AI Cards'}
                        </button>
                    </div>
                    {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
                </div>
            ) : (
                <div className="flashcards-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                    <div className="flashcard-progress" style={{ marginBottom: '15px', color: '#64748b', fontWeight: 'bold' }}>
                        Card {activeCard + 1} of {flashcards.length}
                    </div>

                    <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                        <div className="flashcard-inner">
                            <div className="flashcard-front">
                                <h3>{flashcards[activeCard]?.front}</h3>
                                <div className="flip-hint">Click to flip</div>
                            </div>
                            <div className="flashcard-back">
                                <h3>Answer:</h3>
                                <p>{flashcards[activeCard]?.back}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flashcard-controls" style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                        <button className="timer-btn secondary" onClick={prevCard} disabled={activeCard === 0}>← Previous</button>
                        <button className="timer-btn primary" onClick={nextCard} disabled={activeCard === flashcards.length - 1}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Quiz Master
const QuizPanel = ({ uploadedFiles = [] }) => {
    const [selectedPdfId, setSelectedPdfId] = useState('');
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!selectedPdfId) return;
        setLoading(true);
        setError('');
        try {
            const data = await studyApi.generateQuiz(selectedPdfId, 5);
            if (data.quiz && data.quiz.length > 0) {
                setQuiz(data.quiz);
                setActiveQuestion(0);
                setSelectedAnswer(null);
                setScore(0);
                setIsFinished(false);
            } else {
                setError('Could not generate a quiz for this document.');
            }
        } catch (err) {
            setError(err.message || 'Error generating quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (option) => {
        if (selectedAnswer) return; // Prevent changing answer
        setSelectedAnswer(option);
        if (option === quiz[activeQuestion].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (activeQuestion < quiz.length - 1) {
            setActiveQuestion(prev => prev + 1);
            setSelectedAnswer(null);
        } else {
            setIsFinished(true);
        }
    };

    return (
        <div className="study-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📝 The Quiz Master</h2>
                    <p>Test your knowledge before the exam with customized multiple-choice tests.</p>
                </div>
                {quiz && (
                    <button className="timer-btn secondary" onClick={() => setQuiz(null)} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                        Start Over
                    </button>
                )}
            </div>

            {!quiz ? (
                <div className="placeholder-state">
                    <div className="placeholder-icon">🧠</div>
                    <h3>Ready to test yourself?</h3>
                    <p>Select any syllabus or study guide and RovexAI will generate a practice test fully graded with explanations for wrong answers.</p>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', width: '100%', maxWidth: '500px' }}>
                        <select
                            className="study-select"
                            style={{ flexGrow: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={selectedPdfId}
                            onChange={(e) => setSelectedPdfId(e.target.value)}
                        >
                            <option value="">-- Choose a PDF --</option>
                            {uploadedFiles.map(f => (
                                <option key={f.backendId} value={f.backendId}>{f.name}</option>
                            ))}
                        </select>
                        <button
                            className="study-upload-btn"
                            onClick={handleGenerate}
                            disabled={!selectedPdfId || loading}
                            style={{ opacity: (!selectedPdfId || loading) ? 0.6 : 1 }}
                        >
                            {loading ? 'Generating...' : 'Generate Practice Test'}
                        </button>
                    </div>
                    {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
                </div>
            ) : isFinished ? (
                <div className="quiz-results" style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '10px' }}>{Math.round((score / quiz.length) * 100)}%</h2>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>You scored {score} out of {quiz.length} correctly.</p>
                    <button className="timer-btn primary" onClick={() => setQuiz(null)} style={{ marginTop: '30px' }}>Take Another Test</button>
                </div>
            ) : (
                <div className="quiz-container" style={{ marginTop: '20px' }}>
                    <div className="flashcard-progress" style={{ marginBottom: '15px', color: '#64748b', fontWeight: 'bold' }}>
                        Question {activeQuestion + 1} of {quiz.length}
                    </div>

                    <div className="study-card" style={{ padding: '30px', textAlign: 'left', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#1e293b' }}>
                            {quiz[activeQuestion].question}
                        </h3>

                        <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {quiz[activeQuestion].options.map((opt, idx) => {
                                let bgColor = '#f8fafc';
                                let borderColor = '#e2e8f0';
                                let color = '#334155';

                                if (selectedAnswer) {
                                    if (opt === quiz[activeQuestion].correctAnswer) {
                                        bgColor = '#dcfce7';
                                        borderColor = '#22c55e';
                                        color = '#15803d';
                                    } else if (opt === selectedAnswer) {
                                        bgColor = '#fee2e2';
                                        borderColor = '#ef4444';
                                        color = '#b91c1c';
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(opt)}
                                        disabled={!!selectedAnswer}
                                        style={{
                                            padding: '15px',
                                            borderRadius: '8px',
                                            border: `2px solid ${borderColor}`,
                                            background: bgColor,
                                            color: color,
                                            textAlign: 'left',
                                            cursor: selectedAnswer ? 'default' : 'pointer',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.2s',
                                            width: '100%'
                                        }}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedAnswer && (
                            <div className="quiz-explanation" style={{ marginTop: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #3b82f6', color: '#334155' }}>
                                <strong>Explanation:</strong> {quiz[activeQuestion].explanation}
                            </div>
                        )}

                        {selectedAnswer && (
                            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                                <button className="timer-btn primary" onClick={nextQuestion}>
                                    {activeQuestion < quiz.length - 1 ? 'Next Question →' : 'See Results'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Study Workspace Component
const StudyWorkspace = ({ uploadedFiles = [] }) => {
    const [activeTab, setActiveTab] = useState('pomodoro');

    const tabs = [
        { id: 'pomodoro', icon: '⏱️', label: 'Focus Timer' },
        { id: 'flashcards', icon: '📇', label: 'Flashcards' },
        { id: 'quiz', icon: '📝', label: 'Quiz' },
    ];

    return (
        <div className="study-workspace">
            <div className="study-header">
                <h1>RovexAI Study Studio</h1>
                <p>Master your materials with AI-powered study tools and focus workstations.</p>
            </div>

            <div className="study-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`study-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="study-content">
                {activeTab === 'pomodoro' && <PomodoroPanel />}
                {activeTab === 'flashcards' && <FlashcardPanel uploadedFiles={uploadedFiles} />}
                {activeTab === 'quiz' && <QuizPanel uploadedFiles={uploadedFiles} />}
            </div>
        </div>
    );
};

export default StudyWorkspace;