import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.subtitle}>Fleet Operations</p>
        <h1 className={styles.title}>Vehicle Telemetry Dashboard</h1>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton}>
          Refresh
        </button>
      </div>
    </header>
  );
};

export default Header;
