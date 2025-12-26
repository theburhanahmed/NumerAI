#!/bin/bash

# Dependency audit script for NumerAI
# Checks for security vulnerabilities in Python and Node.js dependencies

set -e

echo "🔍 NumerAI Dependency Security Audit"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python dependencies
echo ""
echo "📦 Checking Python dependencies..."
cd backend

if command -v safety &> /dev/null; then
    echo "Running safety check..."
    if safety check --json > /tmp/safety_report.json 2>&1; then
        echo -e "${GREEN}✓ Safety check passed${NC}"
    else
        echo -e "${YELLOW}⚠ Safety found vulnerabilities${NC}"
        safety check
    fi
else
    echo -e "${YELLOW}⚠ safety not installed. Install with: pip install safety${NC}"
fi

if command -v pip-audit &> /dev/null; then
    echo "Running pip-audit..."
    if pip-audit --format json > /tmp/pip_audit_report.json 2>&1; then
        echo -e "${GREEN}✓ pip-audit check passed${NC}"
    else
        echo -e "${YELLOW}⚠ pip-audit found vulnerabilities${NC}"
        pip-audit
    fi
else
    echo -e "${YELLOW}⚠ pip-audit not installed. Install with: pip install pip-audit${NC}"
fi

# Check Node.js dependencies
echo ""
echo "📦 Checking Node.js dependencies..."
cd ../frontend

if [ -f "package.json" ]; then
    echo "Running npm audit..."
    if npm audit --audit-level=moderate > /tmp/npm_audit_report.json 2>&1; then
        echo -e "${GREEN}✓ npm audit passed${NC}"
    else
        echo -e "${YELLOW}⚠ npm audit found vulnerabilities${NC}"
        npm audit
    fi
else
    echo -e "${RED}✗ package.json not found${NC}"
fi

# Summary
echo ""
echo "===================================="
echo "✅ Audit complete!"
echo ""
echo "Reports saved to:"
echo "  - /tmp/safety_report.json"
echo "  - /tmp/pip_audit_report.json"
echo "  - /tmp/npm_audit_report.json"
echo ""
echo "To fix vulnerabilities:"
echo "  Python: pip install --upgrade <package>"
echo "  Node: npm audit fix"

