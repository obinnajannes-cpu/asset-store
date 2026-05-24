#!/bin/bash
# REMEDIATION SCRIPT for Exposed Secrets in Git History
# WARNING: This will rewrite git history. Make sure you have backups!

set -e

echo "=========================================="
echo "Git Security Remediation Script"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This script will rewrite git history!"
echo "⚠️  Make sure you have backed up your repository first!"
echo ""

# Step 1: Stash any uncommitted changes
echo "Step 1: Stashing uncommitted changes..."
git stash

# Step 2: Remove .env.example from history
echo "Step 2: Removing .env.example from git history..."
echo "This may take a moment..."

# Create backup of history
git bundle create /tmp/repo-backup.bundle HEAD

# Remove the file from all commits
git filter-branch --tree-filter 'rm -f .env.example' --prune-empty HEAD

echo "✅ .env.example removed from history"
echo ""

# Step 3: Verify the file is gone
echo "Step 3: Verifying removal..."
if git log -p -- .env.example | grep -q "0xbc7c45c2"; then
    echo "❌ ERROR: Secrets still found in history!"
    echo "Restoration info: git bundle from /tmp/repo-backup.bundle"
    exit 1
else
    echo "✅ Confirmed: No exposed secrets in history"
fi

echo ""
echo "=========================================="
echo "Step 4: Create safe .env.example"
echo "=========================================="

# Create new .env.example with PLACEHOLDERS ONLY
cat > .env.example << 'ENVEOF'
## Example .env for Sepolia deployment
# Copy to .env and replace the values below with your own.
# IMPORTANT: NEVER commit .env with real values!

# RPC endpoint for Sepolia (Infura, Alchemy, or other provider)
# Make sure this is a complete URL, e.g. https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID_HERE"

# The private key of the deployer account (0x-prefixed)
# NEVER use a real private key here! Use a test/dev key only!
SEPOLIA_PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000000"

# Optional Infura Gas API URL for fee estimation
# Example: https://gas.api.infura.io/v3/YOUR_PROJECT_ID
GAS_API_URL="https://gas.api.infura.io/v3/YOUR_INFURA_PROJECT_ID_HERE"

# Fallback network if Sepolia is unavailable. Use hardhat or localhost.
FALLBACK_NETWORK="hardhat"

# Optional local RPC endpoint for localhost fallback deployments.
LOCALHOST_RPC_URL="http://127.0.0.1:8545"

# Keep this file out of source control. Add .env to .gitignore if needed.
# SECURITY: This file should contain EXAMPLE values only, never real secrets!
ENVEOF

echo "✅ Created safe .env.example with placeholders"

# Step 5: Update .gitignore
echo ""
echo "Step 5: Updating .gitignore..."

# Check if .gitignore already has .env entries
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo "✅ .gitignore already has .env entries"
else
    echo "Adding .env entries to .gitignore..."
    cat >> .gitignore << 'GITIGNOREEOF'

# Environment files - NEVER commit these!
.env
.env.local
.env.*.local
.env.*.local.key
.env.production
.env.staging
*.key
*.pem
GITIGNOREEOF
    echo "✅ Updated .gitignore"
fi

# Step 6: Commit changes
echo ""
echo "Step 6: Committing remediation changes..."
git add .env.example .gitignore
git commit -m "security: remove exposed secrets from .env.example and update gitignore

- Removed real private key from .env.example (was: 0xbc7c45c2...)
- Removed real Infura Project ID from .env.example (was: e084558bf2ae...)
- Replaced with placeholder values for documentation
- Enhanced .gitignore to prevent future secret commits
- IMPORTANT: Git history has been rewritten. Run: git push origin main --force-with-lease"

echo "✅ Changes committed"

echo ""
echo "=========================================="
echo "✅ REMEDIATION COMPLETE"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Review the changes:"
echo "   git log -1 --stat"
echo ""
echo "2. FORCE PUSH to GitHub (rewrites history):"
echo "   git push origin main --force-with-lease"
echo ""
echo "3. Go to https://www.infura.io/ and:"
echo "   - Find project with ID: e084558bf2ae4b4cb73dc6f9818161ac"
echo "   - DELETE or DISABLE it immediately"
echo "   - Create a NEW project"
echo "   - Update your local .env with the NEW project ID"
echo ""
echo "4. NEVER do this again:"
echo "   - Don't commit real keys to any file tracked by git"
echo "   - Use .env (not tracked) for secrets"
echo "   - Use environment variables or secret managers in CI/CD"
echo ""
echo "⚠️  BACKUP LOCATION:"
echo "   If needed to restore: git bundle from /tmp/repo-backup.bundle"
echo ""
