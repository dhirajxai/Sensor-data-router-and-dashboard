export interface BackendHealth {
  status: 'ok';
  timestamp: string;
}

export const getHealth = (): BackendHealth => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
});

export default getHealth;
