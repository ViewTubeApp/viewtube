#!/usr/bin/env bash

set -euo pipefail

# Function to get all keys from a JSON file recursively
get_keys() {
    local file=$1
    jq -r 'path(..)|map(tostring)|join(".")' "$file" | sort
}

# Get the reference keys from en.json
reference_keys=$(get_keys "messages/en.json")

# Find all JSON files except en.json
find messages -name "*.json" -not -name "en.json" | while read -r file; do
    echo "Validating $file..."
    
    # Get keys from the current file
    current_keys=$(get_keys "$file")
    
    # Compare keys
    diff_result=$(diff <(echo "$reference_keys") <(echo "$current_keys") || true)
    
    if [ -n "$diff_result" ]; then
        echo "❌ Validation failed for $file"
        echo "Differences found:"
        echo "$diff_result"
        exit 1
    else
        echo "✅ $file is valid"
    fi
done

echo "✅ All files validated successfully"
