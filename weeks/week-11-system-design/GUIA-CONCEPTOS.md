# Conceptos Week 11 — System Design & Scale

## Scalability Fundamentals

### Load Balancing
```
Clients
  ↓
Load Balancer (round-robin, least connections)
  ↓
  Server 1 (handles 30% traffic)
  Server 2 (handles 30% traffic)
  Server 3 (handles 40% traffic)
```

### Caching Strategy
```
Request → Cache (Redis)
  ↓ (cache miss)
  Database (PostgreSQL)
  ↓ (results)
  Store in cache (expire in 5 min)
  ↓
  Response to client
```

### Database Sharding (for healthcare)
```
Patient IDs 1-100k by clinic:

Shard 1: Clinic A (patients 1-10k)
  Database: clinic-a-db.postgresql.com
  
Shard 2: Clinic B (patients 10k-20k)
  Database: clinic-b-db.postgresql.com
  
Shard N: Clinic N (patients...)
  Database: clinic-n-db.postgresql.com

Benefits:
- Data isolation (HIPAA)
- Faster queries (smaller dataset)
- Clinic-specific backups
- Regulatory compliance (data residency)
```

---

## Healthcare EMR Design

### Core Components
1. **API Gateway** (public interface)
2. **Authentication Layer** (JWT tokens, role-based access)
3. **Patient Service** (CRUD patient records)
4. **Lab Results Service** (store/retrieve lab values)
5. **Document Service** (store medical images/PDFs)
6. **Audit Service** (log all data access for HIPAA)
7. **Cache Layer** (Redis for frequent queries)
8. **Database** (PostgreSQL for structured data, S3 for files)

### Data Flow Example: Viewing Lab Result
```
1. Doctor logs in
   → API authenticates JWT token
   → Verify doctor has access to clinic
   
2. Doctor searches for patient "John Doe"
   → API queries patient service
   → Cache hits (patient_12345)
   → Returns patient ID
   
3. Doctor clicks "View Lab Results"
   → API calls lab service
   → Lab service queries database (shard 1)
   → Results found: cholesterol = 185 mg/dL
   → Cache stores result (expire 1 hour)
   → AUDIT LOG: "Doctor ID 456 accessed Patient 12345 lab results at 2026-04-02 14:23:45"
   
4. Doctor reviews result and closes
   → UI shows result
   → Background: audit log committed to database
```

---

## HIPAA Compliance at Scale

### Encryption
- **At Rest:** AES-256 encryption for patient records
- **In Transit:** HTTPS/TLS 1.3 for all network communication
- **Key Management:** Customer-managed keys (CMK) in AWS/Azure

### Audit Logging
```
Event: Data Access
{
  timestamp: "2026-04-02T14:23:45Z",
  user_id: "doc_456",
  action: "view_lab_results",
  patient_id: "[encrypted]",
  resource_accessed: "lab_cholesterol",
  ip_address: "[encrypted]",
  outcome: "success"
}
```

### Data Retention & Deletion
- Patient records: Retained 7 years (medical/legal requirement)
- Audit logs: Retained 3 years
- Deleted data: Securely wiped (crypto erase)
- User request to delete: 30-day grace period, then permanent deletion

---

## HL7/FHIR Standards (Intro)

### HL7 (Health Level 7)
- Standard format for healthcare data exchange
- Example message: "OBR^patient_id^lab_code^value"

### FHIR (Fast Healthcare Interoperability Resources)
- Modern JSON-based standard (replacing HL7)
- RESTful API approach
- Example:
```json
{
  "resourceType": "Observation",
  "id": "lab-result-123",
  "code": { "coding": [{ "code": "2093-3", "system": "http://loinc.org" }] },
  "valueQuantity": { "value": 185, "unit": "mg/dL" },
  "status": "final",
  "effectiveDateTime": "2026-04-02T10:00:00Z"
}
```

---

## CAP Theorem (in Healthcare Context)

### Trade-off: Consistency vs Availability vs Partition Tolerance
```
Scenario: Lab result shows as "pending" to patient but "complete" to doctor

Choice 1: Consistency (all see "complete")
  → Require all replicas updated before returning response
  → Risk: Slower, might timeout, patient thinks system is down

Choice 2: Availability (accept disagreement)
  → Return immediately (one replica might be stale)
  → Patient might see "pending" for 5 seconds while replicas sync
  → Better UX, slightly stale data

Healthcare usually chooses: Availability + Partition tolerance
(Eventual consistency is acceptable if resolved quickly)
```

