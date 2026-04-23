// to start pm2 production trigger
module.exports = {
  apps: [
    {
      name: "a-lex",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};