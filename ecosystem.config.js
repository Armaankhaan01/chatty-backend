module.exports = {
  apps: [
    {
      name: 'my-app', // Change this to your app's name
      script: 'build/app.js', // The entry point of your application after TypeScript compiles it
      instances: 'max', // Use the max number of CPU cores
      exec_mode: 'cluster', // Run in cluster mode for better performance
      watch: true, // Enable watching files for changes in development
      env: {
        NODE_ENV: 'production' // Set environment variables
      }
    }
  ]
};
