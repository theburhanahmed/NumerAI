#!/bin/bash
# Fix .env.production syntax errors
# This script helps identify and fix syntax issues in .env.production

ENV_FILE="/opt/numerai/.env.production"

if [ ! -f "${ENV_FILE}" ]; then
    echo "Error: ${ENV_FILE} not found"
    exit 1
fi

echo "Checking .env.production for syntax issues..."
echo ""

# Check line 2 specifically
LINE2=$(sed -n '2p' "${ENV_FILE}")
echo "Line 2 content: ${LINE2}"
echo ""

# Check for unquoted parentheses
if echo "${LINE2}" | grep -q "(" && ! echo "${LINE2}" | grep -q "^[[:space:]]*#"; then
    if ! echo "${LINE2}" | grep -q "="; then
        echo "Line 2 appears to be a comment or invalid line"
        echo "If it contains parentheses, it should be quoted or commented out"
    elif echo "${LINE2}" | grep -q "=" && ! echo "${LINE2}" | grep -qE '=".*\(.*"|='\''.*\(.*'\'''; then
        echo "WARNING: Line 2 has unquoted parentheses in a value"
        echo "Values with special characters should be quoted"
        echo ""
        echo "Example fix:"
        echo "  BAD:  SOME_VAR=value(with)parens"
        echo "  GOOD: SOME_VAR=\"value(with)parens\""
        echo "  OR:   SOME_VAR='value(with)parens'"
    fi
fi

# Show first 5 lines for debugging
echo ""
echo "First 5 lines of .env.production:"
head -5 "${ENV_FILE}"
echo ""

echo "To fix:"
echo "1. Edit the file: nano ${ENV_FILE}"
echo "2. Make sure all values with special characters are quoted"
echo "3. Comment lines should start with #"
echo "4. Variable assignments should be: VAR_NAME=\"value\" or VAR_NAME=simple_value"

