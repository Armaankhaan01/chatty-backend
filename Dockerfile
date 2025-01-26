# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install PM2 globally
RUN npm install -g pm2

# Copy the application code to the container
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the port your application runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "run", "start"]
