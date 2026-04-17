module.exports = {
  apps: [
    {
      name: "server", // The name of the app
      script: "./app/server.js", // Path to your main entry file
      env: {
        NODE_ENV: "production",
        PORT: 4002, // Set your port here
        // Add more environment variables as needed
      },
    },
  ],
};
