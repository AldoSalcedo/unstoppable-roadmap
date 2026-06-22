# EMR System Design — Complete Architecture Document

## Your Interview Answer: "Design a Healthcare EMR"

This document is your definitive answer to system design interviews. Spend Day 2 of Week 11 building this.

---

## 1. Requirements (Clarify with Interviewer)

### Functional Requirements
- Store patient medical records (demographics, diagnoses, medications)
- Clinic staff can view/edit patient records
- Patients can view their own records
- Lab results integration (receive from external labs)
- Prescription management
- Appointment scheduling
- AI-powered clinical decision support

### Non-Functional Requirements
- 100,000 patients across 10 clinics
- 5,000 concurrent users
- 99.9% uptime (healthcare SLA)
- HIPAA compliant (encryption, audit logs)
- <200ms response time for patient search
- Support 1000 QPS (queries per second) at peak

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Web (React/Next.js)      Mobile (React Native)              │
│  Doctor Portal            Patient App                        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    API GATEWAY (AWS ALB)                      │
│  • Rate limiting (1000 QPS)                                   │
│  • Load balancing (round-robin)                               │
│  • Request validation                                         │
│  • HTTPS/TLS 1.3 enforcement                                  │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER (Node.js)                     │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌────────────────────┐  ┌─────────────┐ │
│ │ Auth Service    │  │ Patient Service    │  │ Lab Service │ │
│ │ • JWT tokens    │  │ • CRUD patient     │  │ • Store     │ │
│ │ • 2FA support   │  │ • Access control   │  │ • Retrieve  │ │
│ │ • Role mgmt     │  │ • Encryption       │  │ • Parse HL7 │ │
│ └─────────────────┘  └────────────────────┘  └─────────────┘ │
│ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐│
│ │ Document Service │ │ Decision Support │ │ Audit Service   ││
│ │ • Upload/store   │ │ • Call Azure AI   │ │ • Log all       ││
│ │ • Scan (OCR)     │ │ • Parse results   │ │   access        ││
│ │ • Encrypt files  │ │ • Cache responses │ │ • Compliance    ││
│ └──────────────────┘ └──────────────────┘ └─────────────────┘│
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                 CACHE LAYER (Redis Cluster)                   │
│ • Patient records (1 hour TTL)                                │
│ • Lab results (30 min TTL)                                    │
│ • AI decision support (24 hour TTL)                           │
│ • Session tokens (until logout)                               │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   DATA LAYER (Databases)                       │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌──────────────────┐  ┌────────────────┐ │
│ │ Shard 1         │ │ Shard 2          │  │ Shard N        │ │
│ │ Clinic A        │ │ Clinic B         │  │ Clinic N       │ │
│ │ PostgreSQL      │ │ PostgreSQL       │  │ PostgreSQL     │ │
│ │ Patients: 1-10k │ │ Patients: 10k-20k│  │ Patients:...   │ │
│ │                 │ │                  │  │                │ │
│ │ • Encryption at │ │ • Encryption at  │  │ • Encryption   │ │
│ │   rest (AES)    │ │   rest (AES)     │  │   at rest      │ │
│ │ • HIPAA audit   │ │ • HIPAA audit    │  │ • HIPAA audit  │ │
│ │ • Replication   │ │ • Replication    │  │ • Replication  │ │
│ └─────────────────┘ └──────────────────┘  └────────────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────┐    │
│ │           Document Storage (AWS S3)                     │    │
│ │ • Medical images/PDFs encrypted                        │    │
│ │ • Versioning enabled                                   │    │
│ │ • Access logging                                       │    │
│ │ • Cross-region replication (disaster recovery)         │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ┌────────────────────────────────────────────────────────┐    │
│ │           Audit Log Storage (CloudTrail)               │    │
│ │ • All data access logged                               │    │
│ │ • Immutable (cannot be modified)                       │    │
│ │ • 7-year retention (HIPAA requirement)                 │    │
│ └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow: Patient Record Access

```
1. DOCTOR LOGS IN
   Doctor clicks "Login" on clinic portal
   → Browser: POST /auth/login with email + password
   → Auth Service: Hash password, check database
   → Auth Service: Generate JWT token (valid 8 hours)
   → Response: { token: "eyJhbGc...", expiresIn: 28800 }
   → Browser: Store token in secure cookie

2. DOCTOR SEARCHES PATIENT
   Doctor searches "John Doe" in patient directory
   → Browser: GET /api/patients/search?q=John%20Doe
   → API Gateway: Validate JWT, rate limit check
   → Patient Service: Query cache (Redis)
   → Cache MISS: Query database (Shard 1, if clinic A)
   → Database: SELECT * FROM patients WHERE name LIKE 'John Doe%'
   → Result: patient_id = 12345, clinic_id = "A"
   → Cache: Store result in Redis (expire 1 hour)
   → Audit Service: Log query (doctor_id, patient_id, timestamp)
   → Response: [{ id: 12345, name: "John Doe", dob: "1975-03-15" }]

3. DOCTOR VIEWS PATIENT RECORD
   Doctor clicks on "John Doe" in results
   → Browser: GET /api/patients/12345
   → Patient Service: Check cache first
   → Cache HIT: Return cached patient record
   → Response includes: demographics, diagnoses, current medications
   → Audit Service: Log access (doctor_id=456, patient_id=12345, action=view)
   → Response: { id: 12345, name: "John Doe", diagnoses: [...], medications: [...] }

4. DOCTOR VIEWS LAB RESULTS
   Doctor clicks "View Lab Results"
   → Browser: GET /api/patients/12345/labs
   → Lab Service: Check cache
   → Cache MISS: Query lab database (Shard 1)
   → Database: SELECT * FROM lab_results WHERE patient_id = 12345 ORDER BY date DESC
   → Results: [{ test: "cholesterol", value: 185, date: "2026-04-01", normal_range: "<200" }, ...]
   → Cache: Store in Redis (expire 30 minutes, frequent changes)
   → Audit Service: Log access with full details
   → Response: Lab results with interpretation

5. AUDIT TRAIL
   Audit log entry created:
   {
     timestamp: "2026-04-02T14:23:45.123Z",
     user_id: "doc_456",  // encrypted
     action: "view_lab_results",
     patient_id: "[encrypted]",
     resource: "lab_cholesterol",
     clinic_id: "A",
     ip_address: "[encrypted]",
     outcome: "success",
     retention: "3 years"
   }
```

---

## 4. Scalability Decisions

### Why Database Sharding?
```
Problem: 100,000 patients in one database
→ Patient search becomes slow (full table scan)
→ Backup takes too long
→ Single failure = entire system down

Solution: Shard by clinic_id
→ Clinic A: Patients 1-10,000 → shard-1.postgresql.com
→ Clinic B: Patients 10,001-20,000 → shard-2.postgresql.com
→ Clinic N: Patients ... → shard-n.postgresql.com

Benefits:
✓ Each shard only has 10k patients (fast queries)
✓ Data locality: Clinic can have data in their region (HIPAA)
✓ Fault isolation: Clinic A outage doesn't affect Clinic B
✓ Scaling: Add more shards as clinics are added
```

### Why Redis Caching?
```
Problem: Every patient search queries database
→ 5000 concurrent users × 100 searches/hour = 500k queries/hour
→ Database can handle ~50k QPS, but why stress it?

Solution: Cache frequently accessed data in Redis
→ Patient search: <100ms (from cache) vs 50-200ms (from DB)
→ Lab results: 30-minute TTL (labs don't change hourly)
→ Decision support: 24-hour TTL (AI results are stable)

Hit ratio expected: 80% (4 out of 5 requests hit cache)
```

### Why CDN for Documents?
```
Problem: Medical PDFs/images large (10-50MB each)
→ Download takes 30+ seconds on slow connections
→ Clinic in California requests document from clinic in New York

Solution: CloudFront CDN (AWS's CDN)
→ Document cached at nearest edge location
→ Download takes 2-5 seconds (90% improvement)
→ Still encrypted (security not compromised)
```

---

## 5. HIPAA Compliance

### Encryption
```
At Rest (database):
  Command: aws rds modify-db-instance --db-instance-identifier clinic-a --storage-encrypted
  Method: AES-256 encryption
  Key Management: AWS KMS (customer-managed keys)
  
In Transit (network):
  Protocol: HTTPS/TLS 1.3 (minimum)
  Certificate: AWS Certificate Manager (auto-renew)
  HSTS: max-age=31536000 (1 year)

File Storage (S3):
  Encryption: SSE-S3 with customer-managed key
  Access: Only via HTTPS, IP restrictions
```

### Audit Logging
```
Events logged:
  ✓ User login/logout
  ✓ Data access (view patient, export document)
  ✓ Data modification (update medication, add diagnosis)
  ✓ System events (backup, restore, failover)
  
Not logged (reduces noise):
  ✓ Page views (too much log volume)
  ✓ Style sheet downloads
  ✓ JavaScript bundle fetches
  
Retention: 3 years (HIPAA requirement)
Immutability: CloudTrail cannot be modified (AWS guarantee)
```

### Access Control
```
Role-Based Access Control (RBAC):
  Admin: Can access all patients, manage users, system settings
  Doctor: Can access assigned patients, view all data
  Nurse: Can access assigned patients, view data (read-only)
  Patient: Can view own records only
  
Data deletion:
  Patient requests deletion
  → 30-day grace period (reversible)
  → After 30 days: Cryptographic erase (data unrecoverable)
  → Audit log: "Patient XYZ deletion completed at 2026-05-02"
```

---

## 6. Disaster Recovery

### Backup Strategy
```
RPO (Recovery Point Objective): 1 hour (data loss acceptable)
RTO (Recovery Time Objective): 15 minutes (downtime acceptable)

Backups:
  • Continuous replication to secondary region (active-active)
  • Daily full backup (daily snapshots)
  • Hourly incremental backups
  • Cross-region replication (S3, RDS)
  
Failover:
  • Route53 health checks (every 10 seconds)
  • If primary region down: Automatic failover to secondary
  • DNS propagation: <60 seconds
  • Switchover tested monthly
```

---

## 7. Monitoring & Alerting

### Key Metrics
```
Availability: Target 99.9% uptime (9 hours/month acceptable downtime)
Latency: 95th percentile <200ms for patient search
Error Rate: <0.1% (1 error per 1000 requests)
Throughput: 1000 QPS sustained

Dashboards:
  • Response time by service
  • Error rates by endpoint
  • Database query performance
  • Cache hit rate
  • Audit log entries per hour
  
Alerts:
  • Latency >500ms: Page oncall engineer
  • Error rate >1%: Immediate notification
  • Disk space >80%: Warning, >90%: Critical
  • Authentication failures >100/min: DDoS suspected
```

---

## 8. Cost Estimation (First Year)

```
AWS Services:
  EC2 (app servers): $5,000/month × 12 = $60,000
  RDS PostgreSQL (shards): $2,000/month × 12 = $24,000
  Redis (cache): $1,000/month × 12 = $12,000
  S3 (documents): $500/month × 12 = $6,000
  CloudFront CDN: $2,000/month × 12 = $24,000
  Route53 (DNS): $0.50/month = $6
  
Total AWS: ~$126,000/year

Staffing:
  2 Backend engineers: $400k total
  1 DevOps engineer: $200k
  1 Security/Compliance: $150k
  
Total Year 1: ~$876k (infrastructure + team)
Break-even: 100 clinics × $200/month subscription = $20k/month = $240k/year
```

---

## 9. Interview Talking Points

### Problem Clarification (5 min)
"Let me clarify requirements: 100k patients, 5000 concurrent users, HIPAA compliance needed, <200ms response times. Is that correct? Should I focus on any particular challenge?"

### High-Level Design (10 min)
"At high level: clinics will have separate database shards for data locality. APIs layer in Node.js. Redis cache for frequently accessed records. S3 for document storage. All encrypted and audited for HIPAA."

### Deep Dive: Sharding (10 min)
"Sharding by clinic_id ensures each clinic's data is isolated. Clinic A gets 1-10k patients, Clinic B gets 10k-20k, etc. This means faster queries, better fault isolation, and easier data residency management."

### HIPAA Discussion (5 min)
"Every data access is logged to an immutable audit trail. All data encrypted at rest (AES-256) and in transit (TLS 1.3). Retention policy: patient records 7 years, audit logs 3 years. This is standard for healthcare."

### Bottlenecks & Optimization (5 min)
"Biggest challenge: 5000 concurrent users × 100 searches/hour = 500k DB queries/hour. Solution: Redis cache with 80% hit rate reduces DB load. Also, CDN for document delivery."

### Wrap-up (2 min)
"This architecture supports 100k patients today and scales to 1M with more shards. All HIPAA compliant with audit trails. Any questions?"

---

## Your Take-Home

Print this document. Read Day 2-3 of Week 11. Be ready to explain this in your head during interviews. This is your competitive advantage: most engineers can't design systems for healthcare constraints.

