import styles from './ModeSelector.module.css';

const MODES = [
  { id: 'quiz', label: 'Quiz' },
  { id: 'flashcard', label: 'Flashcards' },
  { id: 'review', label: 'Review Missed' },
];

export default function ModeSelector({ activeMode, onSwitch }) {
  return (
    <div className={styles.row}>
      {MODES.map(m => (
        <button
          key={m.id}
          className={`${styles.btn} ${activeMode === m.id ? styles.active : ''}`}
          onClick={() => onSwitch(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
