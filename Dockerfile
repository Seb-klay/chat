# Use official Node.js LTS on Debian
FROM node:24-bullseye

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the app
COPY . .

# Expose port 3000
EXPOSE 3000

CMD ["npm", "run", "dev"]