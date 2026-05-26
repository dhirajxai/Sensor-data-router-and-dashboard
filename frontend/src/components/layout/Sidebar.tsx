import { useAppStore } from '@context/store';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const activeTab = useAppStore((state) => state.ui.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Dashboard navigation">
        <button
          type="button"
          className={activeTab === 'map' ? styles.active : ''}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Map
        </button>
        <button
          type="button"
          className={activeTab === 'list' ? styles.active : ''}
          onClick={() => setActiveTab('list')}
        >
          📋 Vehicles
        </button>
        <button
          type="button"
          className={activeTab === 'analytics' ? styles.active : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </nav>
      <section className={styles.help}>
        <p>Use the left navigation to switch views and inspect the fleet.</p>
      </section>
    </aside>
  );
};

export default Sidebar;
