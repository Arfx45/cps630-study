import { useState, useCallback, useMemo } from 'react';
import cps630Data from './data/questions.json';
import chy583Data from './data/chy583_questions.json';
import StatsBar from './components/StatsBar';
import ModeSelector from './components/ModeSelector';
import SectionSelector from './components/SectionSelector';
import ProgressBar from './components/ProgressBar';
import QuizMode from './components/QuizMode';
import FlashcardMode from './components/FlashcardMode';
import Results from './components/Results';
import styles from './App.module.css';

const COURSES = [
  {
    id: 'cps630',
    label: 'CPS 630',
    fullName: 'CPS 630 — Web Applications',
    data: cps630Data,
    tagFn: (name, idx) => name.match(/S(\d+)/)?.[0] || `S${idx + 1}`,
  },
  {
    id: 'chy583',
    label: 'CHY 583',
    fullName: 'CHY 583 — Energy & Environment',
    data: chy583Data,
    tagFn: (name, idx) => {
      const n = name.match(/\d+/)?.[0];
      return n ? `Ch${n}` : `Ch${idx + 2}`;
    },
  },
];

function buildCourseData(course) {
  const allQuestions = course.data.flatMap((sec, sectionIdx) => {
    const tag = course.tagFn(sec.name, sectionIdx);
    return sec.questions.map(q => ({ ...q, sectionName: sec.name, sectionIdx, sectionTag: tag }));
  });
  const sections = course.data.map((sec, idx) => ({
    idx,
    name: sec.name,
    tag: course.tagFn(sec.name, idx),
    count: sec.questions.length,
  }));
  return { allQuestions, sections };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function freshState(allQuestions) {
  return {
    questions: allQuestions,
    currentIndex: 0,
    sessionAnswers: {},
    missedQuestions: [],
    stats: { correct: 0, wrong: 0, streak: 0, total: 0 },
    showResults: false,
    activeSection: 'all',
  };
}

export default function App() {
  const [activeCourseId, setActiveCourseId] = useState('cps630');
  const [activeMode, setActiveMode] = useState('quiz');
  const [quizState, setQuizState] = useState(() => {
    const { allQuestions } = buildCourseData(COURSES[0]);
    return freshState(allQuestions);
  });
  const [toast, setToast] = useState('');

  const course = COURSES.find(c => c.id === activeCourseId);
  const { allQuestions, sections } = useMemo(() => buildCourseData(course), [activeCourseId]);

  const { questions, currentIndex, sessionAnswers, missedQuestions, stats, showResults, activeSection } = quizState;

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const handleCourseSwitch = useCallback((courseId) => {
    if (courseId === activeCourseId) return;
    setActiveCourseId(courseId);
    const { allQuestions: aq } = buildCourseData(COURSES.find(c => c.id === courseId));
    setQuizState(freshState(aq));
    setActiveMode('quiz');
  }, [activeCourseId]);

  const applySection = useCallback((secIdx) => {
    setQuizState(prev => ({
      ...prev,
      activeSection: secIdx,
      questions: secIdx === 'all'
        ? allQuestions
        : allQuestions.filter(q => q.sectionIdx === Number(secIdx)),
      currentIndex: 0,
      sessionAnswers: {},
      showResults: false,
    }));
  }, [allQuestions]);

  const handleShuffle = useCallback(() => {
    setQuizState(prev => ({ ...prev, questions: shuffle(prev.questions), currentIndex: 0, sessionAnswers: {}, showResults: false }));
    showToast('Questions shuffled!');
  }, [showToast]);

  const handleAnswer = useCallback((chosen, q) => {
    const isCorrect = chosen === q.correct;
    setQuizState(prev => {
      const newMissed = !isCorrect
        ? (() => {
            const key = `${q.sectionIdx}-${q.num}`;
            return prev.missedQuestions.some(m => `${m.sectionIdx}-${m.num}` === key)
              ? prev.missedQuestions
              : [...prev.missedQuestions, q];
          })()
        : prev.missedQuestions;
      return {
        ...prev,
        sessionAnswers: { ...prev.sessionAnswers, [prev.currentIndex]: { chosen, isCorrect } },
        missedQuestions: newMissed,
        stats: {
          correct: prev.stats.correct + (isCorrect ? 1 : 0),
          wrong: prev.stats.wrong + (isCorrect ? 0 : 1),
          streak: isCorrect ? prev.stats.streak + 1 : 0,
          total: prev.stats.total + 1,
        },
      };
    });
  }, []);

  const handleNext = useCallback(() => {
    setQuizState(prev => {
      if (prev.currentIndex + 1 >= prev.questions.length) return { ...prev, showResults: true };
      return { ...prev, currentIndex: prev.currentIndex + 1 };
    });
  }, []);

  const handlePrev = useCallback(() => {
    setQuizState(prev => prev.currentIndex > 0 ? { ...prev, currentIndex: prev.currentIndex - 1 } : prev);
  }, []);

  const handleRestart = useCallback(() => {
    setQuizState(prev => ({ ...prev, currentIndex: 0, sessionAnswers: {}, showResults: false, stats: { correct: 0, wrong: 0, streak: 0, total: 0 } }));
  }, []);

  const handleReviewMissed = useCallback(() => {
    if (missedQuestions.length === 0) { showToast('No missed questions yet!'); return; }
    setQuizState(prev => ({ ...prev, questions: prev.missedQuestions, currentIndex: 0, sessionAnswers: {}, showResults: false }));
    setActiveMode('quiz');
  }, [missedQuestions, showToast]);

  const handleModeSwitch = useCallback((mode) => {
    if (mode === 'review') { handleReviewMissed(); return; }
    setActiveMode(mode);
    setQuizState(prev => ({ ...prev, currentIndex: 0, sessionAnswers: {}, showResults: false }));
  }, [handleReviewMissed]);

  const handleFlashcardResult = useCallback((knew) => {
    setQuizState(prev => {
      const q = prev.questions[prev.currentIndex];
      const newMissed = !knew
        ? (() => {
            const key = `${q.sectionIdx}-${q.num}`;
            return prev.missedQuestions.some(m => `${m.sectionIdx}-${m.num}` === key)
              ? prev.missedQuestions
              : [...prev.missedQuestions, q];
          })()
        : prev.missedQuestions;
      const nextIndex = prev.currentIndex + 1;
      return {
        ...prev,
        missedQuestions: newMissed,
        stats: {
          ...prev.stats,
          correct: prev.stats.correct + (knew ? 1 : 0),
          wrong: prev.stats.wrong + (knew ? 0 : 1),
          streak: knew ? prev.stats.streak + 1 : 0,
          total: prev.stats.total + 1,
        },
        currentIndex: nextIndex < prev.questions.length ? nextIndex : prev.currentIndex,
        showResults: nextIndex >= prev.questions.length,
      };
    });
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? Math.round((currentIndex / questions.length) * 100) : 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{course.fullName}</h1>
        <p className={styles.subtitle}>{allQuestions.length} questions &bull; {sections.length} sections &bull; Multiple study modes</p>
      </header>

      <div className={styles.courseSelector}>
        {COURSES.map(c => (
          <button
            key={c.id}
            className={`${styles.courseBtn} ${activeCourseId === c.id ? styles.courseBtnActive : ''}`}
            onClick={() => handleCourseSwitch(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

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
          onResult={handleFlashcardResult}
        />
      )}

      {toast && <div className={`${styles.toast} ${styles.toastShow}`}>{toast}</div>}
    </div>
  );
}
