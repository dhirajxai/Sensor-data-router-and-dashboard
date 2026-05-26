import { useAppStore } from '@context/store';
import styles from './FilterPanel.module.css';

const FilterPanel = () => {
  const filters = useAppStore((state) => state.filters);
  const updateFilter = useAppStore((state) => state.updateFilter);

  return (
    <aside className={styles.panel} aria-label="Filter vehicles">
      <h2 className={styles.heading}>Filters</h2>
      <div className={styles.controlGroup}>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          value={filters.search}
          placeholder="Vehicle name or ID"
          onChange={(event) => updateFilter({ search: event.target.value })}
        />
      </div>
      <div className={styles.controlGroup}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={filters.status ?? ''}
          onChange={(event) =>
            updateFilter({ status: event.target.value ? (event.target.value as 'active' | 'inactive' | 'offline') : undefined })
          }
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div className={styles.controlGroup}>
        <label htmlFor="batteryMin">Min Battery</label>
        <input
          id="batteryMin"
          type="number"
          min="0"
          max="100"
          value={filters.batteryMin ?? ''}
          placeholder="0"
          onChange={(event) => updateFilter({ batteryMin: event.target.value ? Number(event.target.value) : undefined })}
        />
      </div>
      <div className={styles.controlGroup}>
        <label htmlFor="speedMax">Max Speed</label>
        <input
          id="speedMax"
          type="number"
          min="0"
          max="240"
          value={filters.speedMax ?? ''}
          placeholder="Any"
          onChange={(event) => updateFilter({ speedMax: event.target.value ? Number(event.target.value) : undefined })}
        />
      </div>
    </aside>
  );
};

export default FilterPanel;
