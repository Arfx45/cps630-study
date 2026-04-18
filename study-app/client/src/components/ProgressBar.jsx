import styles from './ProgressBar.module.css';

export default function ProgressBar({ current, total, progress }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <span>Question {total ? current + 1 : 0} of {total}</span>
        <span>{progress}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
