# MongoDB Backup & Disaster Recovery Guide

## 1. Overview
Ensuring reliable database backups is a critical requirement prior to public launch. For Campus Buddy running on MongoDB Atlas, backups protect against accidental deletions, corrupted data, or bad migrations.

---

## 2. Option A: Atlas Cloud Snapshots (Recommended)
1. Go to **MongoDB Atlas Console** → Your Cluster (`Cluster0`).
2. Navigate to **Backup** tab.
3. Review retention policy. On Atlas M0 (Free Tier), manual cloud backups are limited; on M2/M5/M10+, automated point-in-time continuous snapshots are taken every 6 hours with 1-click restore.

---

## 3. Option B: CLI Automated Backup with `mongodump` (Works on all tiers including M0)

### 3.1 Prerequisite
Download and install [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) (`mongodump` and `mongorestore`).

### 3.2 Taking a Full Compressed Backup
Run from a secure backup server or local admin terminal:
```bash
# Set your production URI
export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusbuddy?retryWrites=true&w=majority"

# Create a timestamped backup directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p ./backups/${TIMESTAMP}

# Execute mongodump with gzip compression
mongodump --uri="${MONGODB_URI}" --gzip --out="./backups/${TIMESTAMP}"
```

### 3.3 Verifying the Backup
Inspect the exported BSON and metadata files:
```bash
ls -lh ./backups/${TIMESTAMP}/campusbuddy/
# Expected files:
# - users.bson.gz, users.metadata.json.gz
# - products.bson.gz, products.metadata.json.gz
# - messages.bson.gz, messages.metadata.json.gz
# - conversations.bson.gz, conversations.metadata.json.gz
```

---

## 4. Disaster Recovery & Restore Test Procedure

### 4.1 Step 1: Restore to a Staging Database (Dry Run)
**Never restore directly over production unless recovering from a catastrophic failure.** Test restore into `campusbuddy_restore_test`:
```bash
mongorestore --uri="${MONGODB_URI}" \
  --nsInclude="campusbuddy.*" \
  --nsFrom="campusbuddy.*" \
  --nsTo="campusbuddy_restore_test.*" \
  --gzip \
  --drop \
  ./backups/${TIMESTAMP}/campusbuddy
```

### 4.2 Step 2: Verify Integrity of Restored Data
Run an integrity check comparing document counts between production and the restored test database:
```javascript
// In mongosh or Node script:
const prodUsers = db.getSiblingDB('campusbuddy').users.countDocuments();
const testUsers = db.getSiblingDB('campusbuddy_restore_test').users.countDocuments();
console.log(`Prod: ${prodUsers}, Restored Test: ${testUsers}`);
assert(prodUsers === testUsers, "Document count mismatch!");
```

### 4.3 Step 3: Cleanup Test Database
Once verified:
```javascript
db.getSiblingDB('campusbuddy_restore_test').dropDatabase();
```

---

## 5. Automated Weekly Cron Example
To run weekly backups automatically on Linux/macOS or CI runner:
```cron
# Run every Sunday at 02:00 AM
0 2 * * 0 /usr/local/bin/mongodump --uri="$MONGODB_URI" --gzip --out="/var/backups/campusbuddy/$(date +\%F)"
```
