# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies (including gulp, typescript, etc.)
RUN npm install --legacy-peer-deps

# Install Gulp globally
RUN npm install -g gulp-cli

# Install PM2 globally (for running the app in production)
RUN npm install -g pm2

# Copy the application code to the container
COPY . .

# Run Gulp build tasks (Views)
RUN npm run build
RUN gulp

# Expose the port your application runs on
EXPOSE 5000

# Command to run the application with PM2
CMD ["npm", "start"]
