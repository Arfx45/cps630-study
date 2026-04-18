import styles from './Results.module.css';

const LABELS = ['Keep going!', 'Good effort!', 'Nice work!', 'Almost there!', 'Excellent!', 'Perfect! 🎉'];

export default function Results({ stats, onRestart, onReviewMissed, missedCount }) {
  const total = stats.correct + stats.wrong;
  const pct = total ? Math.round((stats.correct / total) * 100) : 0;
  const label = LABELS[Math.min(Math.floor(pct / 20), 5)];

  return (
    <div className={styles.wrap}>
      <div className={styles.score}>{pct}%</div>
      <div className={styles.label}>{label}</div>

      <div className={styles.breakdown}>
        <div className={styles.item}>
          <div className={`${styles.num} ${styles.green}`}>{stats.correct}</div>
          <div className={styles.itemLabel}>Correct</div>
        </div>
        <div className={styles.item}>
          <div className={`${styles.num} ${styles.red}`}>{stats.wrong}</div>
          <div className={styles.itemLabel}>Wrong</div>
        </div>
        <div className={styles.item}>
          <div className={`${styles.num} ${styles.yellow}`}>{total}</div>
          <div className={styles.itemLabel}>Total</div>
        </div>
        <div className={styles.item}>
          <div className={`${styles.num} ${styles.purple}`}>{stats.streak}</div>
          <div className={styles.itemLabel}>Best Streak</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onRestart}>Restart</button>
        {missedCount > 0 && (
          <button className={styles.btnGhost} onClick={onReviewMissed}>
            Review {missedCount} Missed
          </button>
        )}
      </div>
    </div>
  );
}
