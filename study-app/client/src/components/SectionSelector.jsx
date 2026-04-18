import styles from './SectionSelector.module.css';

export default function SectionSelector({ sections, activeSection, onSelect }) {
  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.btn} ${activeSection === 'all' ? styles.active : ''}`}
        onClick={() => onSelect('all')}
        title="All Sections"
      >
        All
      </button>
      {sections.map(sec => (
        <button
          key={sec.idx}
          className={`${styles.btn} ${activeSection === sec.idx ? styles.active : ''}`}
          onClick={() => onSelect(sec.idx)}
          title={`${sec.name} (${sec.count} questions)`}
        >
          {sec.tag}
          <span className={styles.count}>{sec.count}</span>
        </button>
      ))}
    </div>
  );
}
