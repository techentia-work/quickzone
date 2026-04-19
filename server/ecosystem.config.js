module.exports = {
  apps: [
    {
      name: "quickzone-backend",
      script: "./dist/index.js",
      env_file: ".env",
      instances: 1, // As requested, single instance. Use 'max' for cluster mode if state is distributed.
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      node_args: "--env-file=.env",
    },
  ],
};
