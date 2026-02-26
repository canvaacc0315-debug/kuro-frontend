import React, { useState, useEffect } from 'react';
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
                        <span className="save-status">{saveStatus}</span>
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

// 2. Flashcard Builder Stub (Phase 1)
const FlashcardPanel = () => {
    return (
        <div className="study-panel">
            <div className="panel-header">
                <h2>📇 AI Flashcard Generator</h2>
                <p>Instantly convert class materials or textbooks into interactive study flips.</p>
            </div>
            <div className="placeholder-state">
                <div className="placeholder-icon">📚</div>
                <h3>Select a PDF to Generate Flashcards</h3>
                <p>RovexAI will soon be able to scan your document and extract the 20 most important definitions and dates into interactive cards.</p>
                <button className="study-upload-btn" disabled>Coming Soon (Phase 2)</button>
            </div>
        </div>
    );
};

// 3. Quiz Master Stub (Phase 1)
const QuizPanel = () => {
    return (
        <div className="study-panel">
            <div className="panel-header">
                <h2>📝 The Quiz Master</h2>
                <p>Test your knowledge before the exam with customized multiple-choice tests.</p>
            </div>
            <div className="placeholder-state">
                <div className="placeholder-icon">🧠</div>
                <h3>Ready to test yourself?</h3>
                <p>Select any syllabus or study guide and RovexAI will generate a practice test fully graded with explanations for wrong answers.</p>
                <button className="study-upload-btn" disabled>Coming Soon (Phase 2)</button>
            </div>
        </div>
    );
};

// Main Study Workspace Component
const StudyWorkspace = () => {
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
                {activeTab === 'flashcards' && <FlashcardPanel />}
                {activeTab === 'quiz' && <QuizPanel />}
            </div>
        </div>
    );
};

export default StudyWorkspace;
