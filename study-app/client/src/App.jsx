import { useState, useCallback } from 'react';
import rawData from './data/questions.json';
import StatsBar from './components/StatsBar';
import ModeSelector from './components/ModeSelector';
import SectionSelector from './components/SectionSelector';
import ProgressBar from './components/ProgressBar';
import QuizMode from './components/QuizMode';
import FlashcardMode from './components/FlashcardMode';
import Results from './components/Results';
import styles from './App.module.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Process raw JSON into flat question list and section metadata once
const allQuestions = rawData.flatMap((sec, sectionIdx) => {
  const tag = sec.name.match(/S(\d+)/)?.[0] || `S${sectionIdx + 1}`;
  return sec.questions.map(q => ({ ...q, sectionName: sec.name, sectionIdx, sectionTag: tag }));
});

const sections = rawData.map((sec, idx) => ({
  idx,
  name: sec.name,
  tag: sec.name.match(/S(\d+)/)?.[0] || `S${idx + 1}`,
  count: sec.questions.length,
}));

export default function App() {
  const [activeSection, setActiveSection] = useState('all');
  const [activeMode, setActiveMode] = useState('quiz');
  const [questions, setQuestions] = useState(allQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, streak: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const applySection = useCallback((secIdx) => {
    setActiveSection(secIdx);
    const filtered = secIdx === 'all'
      ? allQuestions
      : allQuestions.filter(q => q.sectionIdx === Number(secIdx));
    setQuestions(filtered);
    setCurrentIndex(0);
    setSessionAnswers({});
    setShowResults(false);
  }, []);

  const handleShuffle = useCallback(() => {
    setQuestions(q => shuffle(q));
    setCurrentIndex(0);
    setSessionAnswers({});
    setShowResults(false);
    showToast('Questions shuffled!');
  }, [showToast]);

  const handleAnswer = useCallback((chosen, q) => {
    const isCorrect = chosen === q.correct;
    setSessionAnswers(prev => ({ ...prev, [currentIndex]: { chosen, isCorrect } }));
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      streak: isCorrect ? prev.streak + 1 : 0,
      total: prev.total + 1,
    }));
    if (!isCorrect) {
      setMissedQuestions(prev => {
        const key = `${q.sectionIdx}-${q.num}`;
        return prev.some(m => `${m.sectionIdx}-${m.num}` === key) ? prev : [...prev, q];
      });
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) setShowResults(true);
    else setCurrentIndex(i => i + 1);
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSessionAnswers({});
    setShowResults(false);
    setStats({ correct: 0, wrong: 0, streak: 0, total: 0 });
  }, []);

  const handleReviewMissed = useCallback(() => {
    if (missedQuestions.length === 0) { showToast('No missed questions yet!'); return; }
    setQuestions(missedQuestions);
    setCurrentIndex(0);
    setSessionAnswers({});
    setShowResults(false);
    setActiveMode('quiz');
  }, [missedQuestions, showToast]);

  const handleModeSwitch = useCallback((mode) => {
    if (mode === 'review') { handleReviewMissed(); return; }
    setActiveMode(mode);
    setCurrentIndex(0);
    setSessionAnswers({});
    setShowResults(false);
  }, [handleReviewMissed]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? Math.round((currentIndex / questions.length) * 100) : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>CPS 630 Study App</h1>
        <p className={styles.subtitle}>{allQuestions.length} questions &bull; {sections.length} sections &bull; Multiple study modes</p>
      </header>

      <StatsBar stats={stats} />
      <ModeSelector activeMode={activeMode} onSwitch={handleModeSwitch} />
      <SectionSelector sections={sections} activeSection={activeSection} onSelect={applySection} />
      <ProgressBar current={currentIndex} total={questions.length} progress={progress} />

      {showResults ? (
        <Results stats={stats} onRestart={handleRestart} onReviewMissed={handleReviewMissed} missedCount={missedQuestions.length} />
      ) : activeMode === 'quiz' ? (
        <QuizMode
          question={currentQuestion}
          questionIndex={currentIndex}
          total={questions.length}
          prevAnswer={sessionAnswers[currentIndex]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrev={handlePrev}
          onShuffle={handleShuffle}
        />
      ) : (
        <FlashcardMode
          question={currentQuestion}
          questionIndex={currentIndex}
          total={questions.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onShuffle={handleShuffle}
          onResult={(knew) => {
            if (!knew) {
              setMissedQuestions(prev => {
                const q = currentQuestion;
                const key = `${q.sectionIdx}-${q.num}`;
                return prev.some(m => `${m.sectionIdx}-${m.num}` === key) ? prev : [...prev, q];
              });
              setStats(prev => ({ ...prev, wrong: prev.wrong + 1, streak: 0, total: prev.total + 1 }));
            } else {
              setStats(prev => ({ ...prev, correct: prev.correct + 1, streak: prev.streak + 1, total: prev.total + 1 }));
            }
            handleNext();
          }}
        />
      )}

      {toast && <div className={`${styles.toast} ${styles.toastShow}`}>{toast}</div>}
    </div>
  );
}
