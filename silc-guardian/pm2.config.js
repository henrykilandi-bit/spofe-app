// Configuration pour PM2 (optionnel)
module.exports = {
  apps: [
    {
      name: "silc-guardian",
      script: "dist/cli/index.js",
      args: "validate",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
