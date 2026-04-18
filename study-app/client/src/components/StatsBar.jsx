import styles from './StatsBar.module.css';

export default function StatsBar({ stats }) {
  return (
    <div className={styles.bar}>
      <div className={styles.chip}>
        <span className={`${styles.dot} ${styles.green}`} />
        {stats.correct} correct
      </div>
      <div className={styles.chip}>
        <span className={`${styles.dot} ${styles.red}`} />
        {stats.wrong} wrong
      </div>
      <div className={styles.chip}>
        <span className={`${styles.dot} ${styles.purple}`} />
        {stats.total} answered
      </div>
      <div className={styles.chip}>
        <span className={`${styles.dot} ${styles.yellow}`} />
        Streak: {stats.streak}
      </div>
    </div>
  );
}
