import { useState, useEffect } from 'react';
import styles from './FlashcardMode.module.css';

export default function FlashcardMode({ question, questionIndex, total, onNext, onPrev, onShuffle, onResult }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [questionIndex]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onPrev]);

  if (!question) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.cardWrap} onClick={() => setFlipped(f => !f)}>
        <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
          <div className={`${styles.face} ${styles.front}`}>
            <div className={styles.faceHint}>Question — click to reveal answer</div>
            <div className={styles.faceText}>{question.question}</div>
          </div>
          <div className={`${styles.face} ${styles.back}`}>
            <div className={styles.faceHint}>Answer</div>
            <div className={styles.answer}>{question.correct}</div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className={styles.resultBtns}>
          <button className={styles.btnKnew} onClick={() => onResult(true)}>✓ Got it</button>
          <button className={styles.btnForgot} onClick={() => onResult(false)}>✗ Missed it</button>
        </div>
      )}

      <div className={styles.navRow}>
        <button className={styles.btnGhost} onClick={onPrev} disabled={questionIndex === 0}>← Prev</button>
        <button className={styles.btnDanger} onClick={onShuffle}>⟡ Shuffle</button>
        <button className={styles.btnPrimary} onClick={onNext}>
          {questionIndex + 1 >= total ? 'Finish ✓' : 'Next →'}
        </button>
      </div>

      <div className={styles.hint}>
        <kbd>Space</kbd> flip &nbsp;|&nbsp; <kbd>←</kbd><kbd>→</kbd> navigate
      </div>
    </div>
  );
}
