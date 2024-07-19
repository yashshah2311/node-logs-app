# Use the official Node.js image as a base
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]
