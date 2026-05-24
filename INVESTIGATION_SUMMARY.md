# Investigation Summary: Wallet Drain Root Cause Analysis

## Quick Answer

**Why was your wallet drained?**

Your private key was **hardcoded in the `.env.example` file** and **committed to the public GitHub repository**. Anyone with access to the GitHub repo could see and use this key.

---

## What Happened (Timeline)

### May 23, 2026
1. **Commit `8eb371c`** - Added your REAL private key to `.env.example`:
   - File: `.env.example`
   - Key: `0xbc7c45c2ba556b18588facae26973206b9580c08f3d207eeabeacdb38fcee914`
   - Also committed: Infura Project ID `e084558bf2ae4b4cb73dc6f9818161ac`

2. **Repository pushed to public GitHub:**
   - URL: `https://github.com/obinnajannes-cpu/asset-store`
   - Visibility: Public
   - Access: Anyone on the internet can clone and see the key

3. **Attacker discovered the key:**
   - Either through direct GitHub browsing or automated secret scanning tools
   - Used the key to access your wallet

4. **Transaction initiated:**
   - Hash: `0xf61cde0a1843e6d31a33dd1065c098c10dc779d6c7010143891dd1cee12bd7db`
   - Sender: `0xf7a8fa463f113eff2f436a21245b970f39e50ce9` (derived from your private key)
   - Recipient: `0x1989dc803b99bfe0c92079764286727d245010e3` (attacker's address)
   - Result: Your Sepolia ETH was transferred out

---

## Investigation Findings

### ✅ What We Verified

| Finding | Status | Evidence |
|---------|--------|----------|
| Private key exposed in `.env.example` | ✅ CONFIRMED | Git commit 8eb371c shows the real key was added |
| Infura Project ID exposed | ✅ CONFIRMED | Both `.env.example` and `.env` contain `e084558bf2ae4b4cb73dc6f9818161ac` |
| Repository is public | ✅ CONFIRMED | GitHub URL: https://github.com/obinnajannes-cpu/asset-store |
| Attack used the exposed key | ✅ CONFIRMED | Transaction sender matches the account derived from the private key |
| No malicious code in contract | ✅ CONFIRMED | OEV contract is a simple ERC20 token, no suspicious functions |
| Attack not caused by deploy:oev:local | ✅ CONFIRMED | Localhost deployment uses placeholder key, not compromised |
| No suspicious GitHub PGP relationships | ✅ CONFIRMED | Transaction addresses don't appear in GitHub settings |
| Commits not GPG signed | ✅ CONFIRMED | Generic "codespace" user made commits without signatures |

### ❌ What Was NOT the Problem

| Item | Why It's Clean |
|------|--------|
| OEV.sol contract | Simple ERC20 token, no malicious code |
| deploy-oev.ts script | No external calls to suspicious addresses |
| Dependencies | @openzeppelin/contracts is a standard, trusted library |
| Localhost deployment | Uses placeholder key, not the compromised one |
| GitHub PGP keys | No relationship to transaction addresses |
| Local .env file | Correctly in .gitignore, not tracked in git |

---

## The Attack Chain

```
┌─────────────────────────────────────────────────────────────┐
│ 1. You committed real private key to .env.example            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Pushed to public GitHub repository                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Attacker found the key (via GitHub search or scanning)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Attacker derived wallet address from private key          │
│    Address: 0xf7a8fa463f113eff2f436a21245b970f39e50ce9      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Attacker checked wallet balance on Sepolia               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Attacker initiated transfer using the private key         │
│    TXN Hash: 0xf61cde0a1843e6d31a33dd1065c098c10dc779d6c70 │
│    To: 0x1989dc803b99bfe0c92079764286727d245010e3           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Your wallet was drained                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Relationship Analysis Results

### Private Key & Transaction Sender
- **Private Key:** `0xbc7c45c2ba556b18588facae26973206b9580c08f3d207eeabeacdb38fcee914`
- **Transaction Sender:** `0xf7a8fa463f113eff2f436a21245b970f39e50ce9`
- **Relationship:** The sender address is derived from your private key using standard Ethereum cryptography
- **Conclusion:** ✅ DIRECT MATCH - This proves the attacker used your exposed key

### Infura Project ID & Exposure
- **Exposed ID:** `e084558bf2ae4b4cb73dc6f9818161ac`
- **Exposed in:** `.env.example` (git tracked) and `.env` (local)
- **Used in:** Both Sepolia RPC endpoint and Gas API endpoint
- **Relationship:** Anyone with this ID can intercept or redirect your RPC calls
- **Conclusion:** ✅ This ID should be considered compromised

### GitHub Account & Addresses
- **GitHub User:** obinnajannes-cpu (owner of exposed repo)
- **Transaction Addresses:** Not mentioned in GitHub profile, settings, or PGP keys
- **Relationship:** None
- **Conclusion:** ✅ Attack was not through GitHub account compromise, just key exposure

### Deploy Script & Attack
- **npm command:** `npm run deploy:oev:sepolia`
- **What it does:** Uses `.env` variables to deploy OEV contract to Sepolia
- **Relationship:** The same `.env` or `.env.example` that contains the private key
- **Conclusion:** ✅ The deploy script itself is clean, but it uses the compromised credentials from `.env.example`

### Localhost vs Sepolia
- **deploy:oev:local:** Uses `localhost` network, relies on local .env (not tracked in git)
- **deploy:oev:sepolia:** Uses Sepolia network, relies on .env.example (PUBLIC in git)
- **Relationship:** Both use the same private key variable from config
- **Conclusion:** ✅ Localhost deployment is not the problem; Sepolia deployment exposed the key

---

## Compromised Assets

### 1. Private Key (CRITICAL)
```
0xbc7c45c2ba556b18588facae26973206b9580c08f3d207eeabeacdb38fcee914
```
- **Status:** COMPLETELY COMPROMISED
- **Action:** Never use again
- **Location:** `.env.example` file in git history

### 2. Infura Project ID (HIGH)
```
e084558bf2ae4b4cb73dc6f9818161ac
```
- **Status:** COMPROMISED (RPC endpoint and Gas API exposed)
- **Action:** Delete/disable the project immediately
- **Location:** `.env.example` and `.env`

### 3. Git Repository (MEDIUM)
```
https://github.com/obinnajannes-cpu/asset-store
```
- **Status:** Contains sensitive data in git history
- **Action:** Clean history or create new repository
- **Location:** Public GitHub, fully accessible

---

## Ethereum Addresses Involved

| Address | Type | Owner |
|---------|------|-------|
| `0xf7a8fa463f113eff2f436a21245b970f39e50ce9` | Sender (Your wallet) | Derived from your compromised private key |
| `0x1989dc803b99bfe0c92079764286727d245010e3` | Recipient | Attacker's address |
| `0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97` | Producer | Unknown (possibly validator or MEV searcher) |

**Network:** Sepolia Testnet (11155111)  
**Block:** Check Sepolia Etherscan for transaction details  
**Amount:** Transferred to attacker's address

---

## Files Created for You

I've created the following remediation documents in your repository:

1. **SECURITY_INCIDENT_ANALYSIS.md** - Detailed technical analysis
2. **URGENT_ACTION_CHECKLIST.md** - Step-by-step remediation guide
3. **remediate-secrets.sh** - Automated cleanup script

---

## Bottom Line

```
YOUR WALLET WAS DRAINED BECAUSE:

❌ You committed a real private key to .env.example
❌ .env.example is tracked in git
❌ The repository is public on GitHub
❌ Anyone can access and use the key

THIS WAS NOT CAUSED BY:

✅ Malicious code in your contracts
✅ Compromised dependencies
✅ Deploy script vulnerabilities
✅ GitHub account compromise
✅ Local deployment issues
```

**The attack was purely credential-based - someone found your exposed key and used it.**

---

## Immediate Next Steps

1. **Read:** `URGENT_ACTION_CHECKLIST.md` (comprehensive step-by-step guide)
2. **Execute:** `./remediate-secrets.sh` (to clean git history)
3. **Verify:** Check `.env.example` has no real secrets
4. **Push:** Force push cleaned history to GitHub
5. **Revoke:** Delete the compromised Infura project
6. **Prevent:** Install pre-commit hooks to prevent future leaks

---

## Questions?

- **How can I verify my private key was used?** Check Etherscan Sepolia for the transaction hash and see the sender address matches the one derived from your key
- **Can I recover the funds?** No, once transferred out, the funds are gone. This is by design in blockchain
- **Will this happen on mainnet?** Only if your mainnet private key is exposed the same way
- **How do I prevent this?** Follow the URGENT_ACTION_CHECKLIST.md for comprehensive prevention measures

