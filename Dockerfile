# Use an official Node.js image as the base image
FROM node:18-bullseye

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if using yarn) to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Install @expo/ngrok as a local dependency to avoid the global prompt during runtime
RUN npm install @expo/ngrok@^4.1.0

# Copy the rest of the application files into the container
COPY . .

# Log in to Expo using the provided credentials
RUN npx expo login -u testusername881 -p 3Ssy3i_VhsZgU2y

# Expose the port that Expo typically uses
EXPOSE 19000

# Start the Expo development server using npx
CMD ["npx", "expo", "start", "-c"]

