#!/bin/bash

# Print commands and their arguments as they are executed
set -x

# Exit immediately if a command exits with a non-zero status
set -e

# Change to the NextJS directory
cd packages/nextjs

# Install dependencies
echo "Installing dependencies..."
yarn install

# Build the app
echo "Building Next.js app..."
yarn build

# Print success message
echo "Build completed successfully!" 