#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Parse command line arguments
HEADLESS=true
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --headless) HEADLESS=true ;;
        --headed) HEADLESS=false ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "Installing dependencies..."
npm install

echo "Starting dev-browser server..."
export HEADLESS=$HEADLESS
npx tsx scripts/start-server.ts
