# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY public .

# Expose the port that your app runs on
EXPOSE 3000

# Command to run your application
CMD ["node", "server.js"]
