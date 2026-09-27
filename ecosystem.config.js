module.exports = {
  apps: [
    {
      name: 'bachelor-solution-api',
      script: 'dist/main.js',
      instances: 'max', // Creates a worker for every CPU core available
      exec_mode: 'cluster', // Enables Node.js Load Balancing (Cluster Mode)
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
