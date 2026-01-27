export default {
  apps: [
    {
      name: "spofe-backend",
      script: "src/server.js",
      cwd: "c:\\Users\\henry\\Desktop\\SPOFE-APP VERS 1.0\\cascade",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      out_file: "logs/backend-out.log",
      error_file: "logs/backend-error.log",
      time: true,
      kill_timeout: 5000
    },
    {
      name: "spofe-frontend",
      script: "node_modules/vite/bin/vite.js",
      cwd: "c:\\Users\\henry\\Desktop\\SPOFE-APP VERS 1.0\\frontend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      args: "",
      env: {
        NODE_ENV: "development"
      },
      out_file: "logs/frontend-out.log",
      error_file: "logs/frontend-error.log",
      time: true,
      kill_timeout: 5000
    }
  ]
};
