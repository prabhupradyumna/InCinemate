module.exports = {
  apps: [
    {
      name: 'incinemate-backend',
      cwd: '/home/ubuntu/InCinemate/backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      error_file: '/home/ubuntu/logs/backend-error.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      log_file: '/home/ubuntu/logs/backend-combined.log',
      time: true
    },
    {
      name: 'incinemate-frontend',
      cwd: '/home/ubuntu/InCinemate/frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/logs/frontend-error.log',
      out_file: '/home/ubuntu/logs/frontend-out.log',
      log_file: '/home/ubuntu/logs/frontend-combined.log',
      time: true
    }
  ]
};


