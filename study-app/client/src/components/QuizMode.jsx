import { useEffect, useCallback } from 'react';
import styles from './QuizMode.module.css';

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizMode({ question, questionIndex, total, prevAnswer, onAnswer, onNext, onPrev, onShuffle }) {
  const answered = prevAnswer !== undefined;

  const handleSelect = useCallback((opt) => {
    if (answered || !question) return;
    onAnswer(opt, question);
  }, [answered, question, onAnswer]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const map = { '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[e.key] !== undefined && question && !answered) {
        handleSelect(question.options[map[e.key]]);
      }
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSelect, answered, onNext, onPrev, question]);

  if (!question) return null;

  const getOptionClass = (opt) => {
    if (!answered) return styles.option;
    if (opt === prevAnswer?.chosen) {
      return `${styles.option} ${prevAnswer.isCorrect ? styles.correct : styles.wrong}`;
    }
    if (!prevAnswer.isCorrect && opt === question.correct) {
      return `${styles.option} ${styles.revealCorrect}`;
    }
    return `${styles.option} ${styles.dimmed}`;
  };

  const sectionTag = question.sectionName?.match(/S(\d+)/)?.[0] || 'S?';

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.meta}>
          <span className={styles.badge}>{sectionTag}</span>
          <span className={styles.qNum}>#{question.num}</span>
        </div>

        <p className={styles.questionText}>{question.question}</p>

        <div className={styles.options}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={getOptionClass(opt)}
              onClick={() => handleSelect(opt)}
              disabled={answered}
            >
              <span className={styles.label}>{LABELS[i]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {answered && (
          <div className={`${styles.feedback} ${prevAnswer.isCorrect ? styles.correctFb : styles.wrongFb}`}>
            {prevAnswer.isCorrect
              ? '✓ Correct! Well done.'
              : `✗ Incorrect — the correct answer is highlighted.`}
          </div>
        )}
      </div>

      <div className={styles.navRow}>
        <button className={styles.btnGhost} onClick={onPrev} disabled={questionIndex === 0}>← Prev</button>
        <button className={styles.btnDanger} onClick={onShuffle}>⟡ Shuffle</button>
        <button className={styles.btnPrimary} onClick={onNext}>
          {questionIndex + 1 >= total ? 'Finish ✓' : 'Next →'}
        </button>
      </div>

      <div className={styles.hint}>
        <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> to answer &nbsp;|&nbsp; <kbd>←</kbd><kbd>→</kbd> to navigate
      </div>
    </div>
  );
}
