# 🚨 URGENT ACTION CHECKLIST - Wallet Drain Remediation

**Incident:** Your private key was exposed in a public GitHub repository and used to drain your wallet.

**Timeline:** Do these steps IN ORDER, today.

---

## 🔴 IMMEDIATE (DO THIS NOW - Next 30 minutes)

### Step 1: Stop Using the Compromised Private Key
- [x] **DONE** - Your key is now public knowledge and useless
- Do NOT attempt to use this wallet again
- The key: `0xbc7c45c2ba556b18588facae26973206b9580c08f3d207eeabeacdb38fcee914`

### Step 2: Identify If You Have Remaining Funds
```bash
# Check remaining balance on Sepolia:
# Use Etherscan Sepolia: https://sepolia.etherscan.io/
# Address: 0xf7a8fa463f113eff2f436a21245b970f39e50ce9
# (derived from the private key)
```
- [ ] Checked the compromised wallet balance
- [ ] Confirmed: _____ ETH remaining (if any)

### Step 3: Create NEW Private Key
```bash
# Option 1: Use MetaMask
# - Install MetaMask browser extension
# - Create new wallet
# - DO NOT import the old one

# Option 2: Use ethers.js CLI
# npm install -g ethers
# ethers createRandomMnemonic
```
- [ ] Generated new private key
- [ ] Stored in secure location (hardware wallet preferred)
- [ ] DO NOT commit to any file

### Step 4: Transfer Any Remaining Funds
```bash
# If there are remaining funds on Sepolia:
# 1. Use MetaMask or hardhat to send funds from:
#    FROM: 0xf7a8fa463f113eff2f436a21245b970f39e50ce9
#    TO:   Your new secure wallet
# 2. Or simply ignore (Sepolia ETH is free testnet currency)
```
- [ ] Transferred remaining funds (or confirmed no funds exist)
- [ ] New wallet address: `0x_____________________`

---

## 🟠 HIGH PRIORITY (Do within 1 hour)

### Step 5: Disable Infura Project ID
1. [ ] Go to https://www.infura.io/
2. [ ] Sign in to your account
3. [ ] Find project with ID: `e084558bf2ae4b4cb73dc6f9818161ac`
4. [ ] DELETE or DISABLE the project immediately
5. [ ] Create a NEW Infura project
6. [ ] Copy the NEW project ID

### Step 6: Generate New Environment Variables
```bash
cd /workspaces/codespaces-blank/asset-store

# Update .env with NEW values (NOT .env.example!)
cat > .env << 'EOF'
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_NEW_PROJECT_ID"
SEPOLIA_PRIVATE_KEY="0xYOUR_NEW_PRIVATE_KEY"
GAS_API_URL="https://gas.api.infura.io/v3/YOUR_NEW_PROJECT_ID"
FALLBACK_NETWORK="hardhat"
LOCALHOST_RPC_URL="http://127.0.0.1:8545"
EOF
```
- [ ] Created new `.env` file with NEW values
- [ ] Verified `.env` is in `.gitignore` (should not be tracked)
- [ ] Verified NEW values (not old ones) are in the file

### Step 7: Verify .env is in .gitignore
```bash
cd /workspaces/codespaces-blank/asset-store
grep "\.env" .gitignore
```
- [ ] `.env` is listed in `.gitignore`
- [ ] If not, add it:
```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env is in gitignore"
```

---

## 🟡 IMPORTANT (Do within 2-4 hours)

### Step 8: Remove Secrets from Git History

**OPTION A: Simple approach (easier)**
```bash
cd /workspaces/codespaces-blank/asset-store

# Run the provided remediation script
chmod +x remediate-secrets.sh
./remediate-secrets.sh
```
- [ ] Ran remediation script
- [ ] Reviewed the changes: `git log -1 --stat`

**OPTION B: Manual approach (if script doesn't work)**
```bash
cd /workspaces/codespaces-blank/asset-store

# Backup first
git bundle create /tmp/backup.bundle HEAD

# Remove the file
git filter-branch --tree-filter 'rm -f .env.example' --prune-empty HEAD

# Recreate .env.example with placeholders (see Step 9)
```

### Step 9: Recreate .env.example with Placeholders ONLY
```bash
cd /workspaces/codespaces-blank/asset-store

# Create new .env.example with NO REAL VALUES
cat > .env.example << 'EOF'
## Example .env for Sepolia deployment
# Copy to .env and replace the values below with your own.

SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID_HERE"
SEPOLIA_PRIVATE_KEY="0xyourprivatekey"
GAS_API_URL="https://gas.api.infura.io/v3/YOUR_INFURA_PROJECT_ID_HERE"
FALLBACK_NETWORK="hardhat"
LOCALHOST_RPC_URL="http://127.0.0.1:8545"
EOF

# Verify NO real values
grep -E "0x[a-f0-9]{60,}" .env.example || echo "✅ No real keys found"

# Commit
git add .env.example
git commit -m "security: recreate .env.example with placeholder values only"
```
- [ ] Created new `.env.example` with placeholders only
- [ ] Verified no real values in `.env.example`
- [ ] Committed the change

### Step 10: Force Push to GitHub
```bash
cd /workspaces/codespaces-blank/asset-store
git push origin main --force-with-lease
```
⚠️ **WARNING**: This rewrites history. Make sure you understand the implications.

- [ ] Force pushed to GitHub
- [ ] Verified on GitHub that `.env.example` no longer contains real secrets

---

## 🟢 IMPORTANT PREVENTION (Do this week)

### Step 11: Set Up Pre-commit Hook (Prevents Future Mistakes)
```bash
cd /workspaces/codespaces-blank/asset-store

# Install pre-commit framework
pip3 install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
      - id: mixed-line-ending
      - id: trailing-whitespace

  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.0
    hooks:
      - id: trufflehog
        name: TruffleHog
        description: Detect secrets
        entry: trufflehog filesystem
        language: python
        types: [text]
        stages: [commit]
EOF

# Install the hook
pre-commit install

# Test it
pre-commit run --all-files
```
- [ ] Installed pre-commit framework
- [ ] Created `.pre-commit-config.yaml`
- [ ] Installed the git hook
- [ ] Tested it runs successfully

### Step 12: Enable GitHub Secret Scanning
1. [ ] Go to https://github.com/obinnajannes-cpu/asset-store/settings
2. [ ] Click "Security & analysis" (left sidebar)
3. [ ] Enable "Secret scanning"
4. [ ] Enable "Push protection" (if available on your plan)

### Step 13: Review Git Config
```bash
# Ensure your git config is correct
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Consider signing commits with GPG
# https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key
```
- [ ] Verified git user name and email
- [ ] (Optional) Set up GPG signing for commits

---

## 📋 VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Old private key is no longer used anywhere
- [ ] Old Infura project ID is disabled/deleted
- [ ] New `.env` has NEW credentials (not old ones)
- [ ] `.env.example` has NO real secrets, only placeholders
- [ ] `.env` is in `.gitignore`
- [ ] Git history has been cleaned (no exposed keys)
- [ ] Changes pushed to GitHub
- [ ] Pre-commit hooks are installed
- [ ] GitHub secret scanning is enabled

---

## 📞 IF YOU NEED HELP

**Scenario 1: I'm not sure if I got all the secrets removed**
```bash
cd /workspaces/codespaces-blank/asset-store
git log -p | grep -E "0x[a-f0-9]{64}|e084558bf2ae4b4cb73dc6f9818161ac" | head -5
# If this returns results, more work is needed
```

**Scenario 2: I accidentally pushed sensitive data again**
```bash
# Immediately:
git rm --cached .env
git commit -m "Remove .env from tracking"
git push

# Then follow steps above to clean history
```

**Scenario 3: I'm not sure if my Infura key is still at risk**
- Go to https://www.infura.io/ → your account → project settings
- Check "Usage" or "API Calls" tab
- Look for unusual activity after May 23, 2026
- If you see suspicious activity, delete the project immediately

---

## 🎓 LESSONS LEARNED

| ❌ What You Did | ✅ What To Do Instead |
|---|---|
| Committed real private key to `.env.example` | Only put placeholders in `.env.example` |
| Tracked `.env.example` in git | Use `.env` (untracked) for secrets, `.env.example` for structure only |
| No pre-commit hooks | Always use `detect-private-key` hook or similar |
| No GitHub secret scanning | Enable it in repo settings |
| Single global Infura project ID | Use separate project IDs for dev/staging/production |

---

## 📚 RESOURCES

- [GitHub Docs: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Pre-commit Framework](https://pre-commit.com/)
- [TruffleHog Secret Scanning](https://github.com/trufflesecurity/trufflehog)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Hardhat Documentation](https://hardhat.org/hardhat-runner/docs/config)

---

**Status:** Ready to execute  
**Estimated Time:** 2-3 hours total  
**Difficulty:** Medium  
**Risk:** Low (if following steps carefully)

