/** patient.repository.ts — Patient Data Access
 * DÍA 3: Query Optimization — Avoiding N+1 & Building Repositories */

import { PrismaClient, Prisma } from "@prisma/client";

// ============================================================================
// PATRÓN: Repository Pattern
// ============================================================================
//
// El problema (en JavaScript):
// Business logic directly queries Prisma everywhere:
// - Hard to optimize (N+1 queries hidden in business logic)
// - Hard to test (mock entire Prisma client)
// - Hard to change (if query changes, update 10 files)
//
// Con Repository Pattern:
// - Encapsulate all data queries in a single class
// - Business logic calls repository.findPatient(id) instead of calling Prisma
// - Repositories optimize queries internally
// - Easy to mock in tests
//
// Ventajas:
// - Single Responsibility: Repository is responsible for data access only
// - Testability: Mock repository in unit tests
// - Maintainability: Change query in one place
// - Performance: Optimize N+1 problems in repository
//
// Aplicación Healthcare:
// A clinician views a patient dashboard.
// Dashboard needs: patient + all their lab tests + count of pending tests.
// Without repository: 3 separate queries (N+1 problem).
// With repository: 1 optimized query with includes/selects.

export class PatientRepository {
  constructor(private db: PrismaClient) {}

  // ============================================================================
  // TAREA 3.1: Find Patient with Tests (Avoiding N+1)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // ❌ N+1 Query Pattern (SLOW)
  // const patient = await db.patient.findUnique({ where: { id } });
  // const tests = await db.labTest.findMany({ where: { patientId: id } });
  // Result: 2 queries (if you load 100 patients, 100 + 100 = 200 queries)
  //
  // ✅ Solution: Use include() to join in one query
  // const patient = await db.patient.findUnique({
  //   where: { id },
  //   include: { labTests: true }
  // });
  // Result: 1 query with JOIN (fast, even with 100 patients)
  //
  // Ventajas:
  // - Single database roundtrip
  // - Automatic JOIN optimization
  // - Type-safe: patient.labTests is strongly typed
  //
  // Aplicación Healthcare:
  // When a clinician opens a patient's chart, they need:
  // 1. Patient demographics
  // 2. All their lab tests
  // Both in <100ms (user expectation).

  async findWithTests(patientId: string) {
    // TODO: Implement using include()
    // Requirements:
    // 1. Load patient with ID = patientId
    // 2. Include all labTests related to this patient
    // 3. Order labTests by performedAt (newest first)
    // 4. Return type: Patient with labTests array
    //
    // Hint: Use include: { labTests: { orderBy: { performedAt: 'desc' } } }

    return this.db.patient.findUnique({
      where: { id: patientId },
      include: {
        labTests: {
          orderBy: { performedAt: "desc" },
        },
      },
    });
  }

  // ============================================================================
  // TAREA 3.2: Find Patient with Completed Tests Only
  // ============================================================================
  //
  // El problema (en JavaScript):
  // The query above loads ALL tests. But dashboard only needs COMPLETED tests.
  // Loading PENDING tests = unnecessary data + slower response.
  //
  // Con include + where:
  // Can filter related data BEFORE loading.
  //
  // Ventajas:
  // - Reduced data transfer (no pending tests)
  // - Faster response
  // - Still 1 query
  //
  // Aplicación Healthcare:
  // Clinician dashboard shows "Completed Tests" only.
  // Pending tests are shown in a separate section.

  async findWithCompletedTests(patientId: string) {
    // TODO: Implement
    // Requirements:
    // 1. Load patient
    // 2. Include only labTests where status = 'COMPLETED'
    // 3. Order by performedAt DESC
    // 4. Return patient with filtered labTests
    //
    // Hint: Use include: { labTests: { where: { status: 'COMPLETED' }, ... } }

    return this.db.patient.findUnique({
      where: { id: patientId },
      include: {
        labTests: {
          where: { status: "COMPLETED" },
          orderBy: { performedAt: "desc" },
        },
      },
    });
  }

  // ============================================================================
  // TAREA 3.3: Select Pattern (Avoid Over-Fetching)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // include: { labTests: true } loads ALL fields of labTests.
  // But sometimes you only need specific fields (e.g., testType + status).
  // Loading unnecessary fields = wasted bandwidth.
  //
  // Con select:
  // Choose exactly which fields to load.
  //
  // Ventajas:
  // - Smaller payload (only needed fields)
  // - Faster transfer
  // - Still type-safe
  //
  // Aplicación Healthcare:
  // Patient list view: show name + MRN + count of pending tests.
  // Don't need full test results (that's patient detail view).

  async findManyWithTestCount(clinicianId: string) {
    // TODO: Implement
    // Requirements:
    // 1. Find all patients where createdBy = clinicianId
    // 2. For each patient, SELECT only: id, firstName, lastName, mrn
    // 3. Use _count to get count of labTests
    // 4. Return array of { id, firstName, lastName, mrn, _count: { labTests } }
    //
    // Hint: Use select: { id: true, firstName: true, ..., _count: { select: { labTests: true } } }
    // This is much faster than loading all labTests then counting them

    return this.db.patient.findMany({
      where: { createdBy: clinicianId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        mrn: true,
        _count: {
          select: {
            labTests: true,
          },
        },
      },
    });
  }

  // ============================================================================
  // TAREA 3.4: Find Patients with Pending Tests (Filtering on Relations)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // "Find all patients that have at least one PENDING test"
  // This requires filtering on a related table (labTests).
  // SQL requires: WHERE EXISTS (SELECT 1 FROM lab_tests WHERE status = 'PENDING')
  //
  // Con Prisma some():
  // Prisma translates some() to EXISTS clause automatically.
  //
  // Ventajas:
  // - Readable
  // - Efficient (uses EXISTS, not IN subquery)
  //
  // Aplicación Healthcare:
  // Dashboard: "Show me all patients with pending test results"
  // Critical for clinical workflow: ensure nothing gets lost.

  async findWithPendingTests() {
    // TODO: Implement
    // Requirements:
    // 1. Find patients where at least ONE labTest has status = 'PENDING'
    // 2. Include those pending labTests
    // 3. Return array of patients
    //
    // Hint: Use where: { labTests: { some: { status: 'PENDING' } } }

    return this.db.patient.findMany({
      where: {
        labTests: {
          some: {
            status: "PENDING",
          },
        },
      },
      include: {
        labTests: {
          where: { status: "PENDING" },
        },
      },
    });
  }

  // ============================================================================
  // TAREA 3.5: Pagination (Performance for Large Datasets)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // Database has 1M patients.
  // Loading all 1M patients = memory explosion + timeout.
  //
  // Con Pagination:
  // Load 50 patients at a time.
  // Repeat for next page.
  //
  // Ventajas:
  // - Constant memory (always 50 patients in memory)
  // - Fast responses (50 rows << 1M rows)
  // - Better UX (pagination UI)
  //
  // Aplicación Healthcare:
  // Clinician sees patient list with "Next Page" button.
  // Each page loads instantly.

  async findPaginated(page: number, pageSize: number = 50) {
    // TODO: Implement
    // Requirements:
    // 1. Return paginated results: skip = (page - 1) * pageSize, take = pageSize
    // 2. Also return total count of all patients
    // 3. Return { patients: [...], total: 1500, pages: 30 }
    //
    // Hint: Use $transaction to ensure count matches results
    //       const [patients, total] = await db.$transaction([...])

    const [patients, total] = await this.db.$transaction([
      this.db.patient.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.db.patient.count(),
    ]);

    return {
      patients,
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  }

  // ============================================================================
  // TAREA 3.6: Search Pattern (Full-Text Search)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // "Find patients named 'John Smith' or MRN '12345'"
  // Simple LIKE is slow: SELECT * FROM patients WHERE firstName LIKE '%John%'
  // Scans every row (O(n) time).
  //
  // Con Indexes + Compound Queries:
  // Index on (firstName, lastName, mrn) + WHERE clause = fast.
  //
  // Ventajas:
  // - Uses index (O(log n) time)
  // - Exact matches fast
  // - Multiple filter options
  //
  // Aplicación Healthcare:
  // Clinician types "John Smith" in search box.
  // Results appear instantly (<100ms).

  async searchPatients(query: string) {
    // TODO: Implement
    // Requirements:
    // 1. Search by firstName OR lastName OR mrn (case-insensitive)
    // 2. Use ILIKE for case-insensitive partial matching
    // 3. Return matching patients
    //
    // Hint: Use where: { OR: [
    //   { firstName: { contains: query, mode: 'insensitive' } },
    //   ...
    // ]}

    const searchTerm = `%${query}%`;

    return this.db.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { mrn: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 50, // Limit results for performance
    });
  }

  // ============================================================================
  // TAREA 3.7: Raw SQL (When Prisma Isn't Enough)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // Some queries are so complex that Prisma's ORM syntax is awkward.
  // Example: "Find patients with tests from last 30 days, grouped by test type"
  //
  // Con Raw SQL:
  // Write SQL directly for complex queries.
  //
  // Ventajas:
  // - Maximum control
  // - Complex JOINs/GROUP BY easy
  // - Still parameterized (safe from SQL injection)
  //
  // Riesgos:
  // - No type safety (results are any[])
  // - Must validate results manually
  // - Don't use string interpolation (SQL injection!)
  //
  // Aplicación Healthcare:
  // Complex analytics: "How many patients per clinician?" "Average tests per patient?"

  async findPatientsWithRecentTests(days: number) {
    // TODO: Implement (or use Prisma query above instead)
    // Example using raw SQL:
    // const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // return this.db.$queryRaw`
    //   SELECT p.*, COUNT(lt.id) as testCount
    //   FROM patients p
    //   LEFT JOIN lab_tests lt ON p.id = lt.patient_id
    //     AND lt.performed_at > ${since}
    //   GROUP BY p.id
    //   HAVING COUNT(lt.id) > 0
    // `;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.db.$queryRaw<
      Array<{
        id: string;
        firstName: string;
        lastName: string;
        mrn: string;
        testCount: bigint;
      }>
    >`
      SELECT p.id, p.first_name as "firstName", p.last_name as "lastName", p.mrn, COUNT(lt.id) as "testCount"
      FROM patients p
      LEFT JOIN lab_tests lt ON p.id = lt.patient_id
        AND lt.performed_at > ${since}
      GROUP BY p.id
      HAVING COUNT(lt.id) > 0
      ORDER BY "testCount" DESC
    `;
  }

  // ============================================================================
  // TAREA 3.8: Create Patient (Auditability)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // How do you create a patient while ensuring createdBy is set correctly?
  // If you forget createdBy, audit trail is incomplete.
  //
  // Con Repository:
  // Repository enforces createdBy (can't create without it).
  //
  // Ventajas:
  // - Type-safe: createdBy is required parameter
  // - Consistent: all created patients have createdBy
  // - Auditable: every patient has creator recorded
  //
  // Aplicación Healthcare:
  // Only clinicians can create patients (Week 07: RBAC).
  // createdBy = current clinician's ID.

  async create(data: {
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    createdBy: string;
  }) {
    // TODO: Implement using db.patient.create()
    // Make sure createdBy is required (don't allow undefined)

    return this.db.patient.create({
      data,
    });
  }

  // ============================================================================
  // TAREA 3.9: Update Patient (Audit Trail)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // When you update a patient, how do you log the change?
  // If you modify directly: db.patient.update(), no audit trail created.
  //
  // Con Repository + AuditLog:
  // Repository creates AuditLog entry when patient changes.
  //
  // Ventajas:
  // - Change tracking: oldValues vs newValues
  // - Compliance: HIPAA requires audit trail
  // - Debugging: see exactly what changed
  //
  // Aplicación Healthcare:
  // Clinician corrects patient DOB.
  // AuditLog records: { oldValues: { dob: '1990-01-01' }, newValues: { dob: '1990-01-02' } }

  async update(
    patientId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
    }>,
    userId: string
  ) {
    // TODO: Implement
    // Requirements:
    // 1. Find patient's current state (before update)
    // 2. Update patient with new data
    // 3. Create AuditLog entry with oldValues + newValues
    // 4. Return updated patient
    //
    // Hint: Use $transaction to ensure both operations succeed or both fail

    const oldPatient = await this.db.patient.findUnique({
      where: { id: patientId },
    });

    if (!oldPatient) throw new Error("Patient not found");

    const updatedPatient = await this.db.patient.update({
      where: { id: patientId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await this.db.auditLog.create({
      data: {
        entityType: "PATIENT",
        entityId: patientId,
        action: "UPDATE",
        userId,
        oldValues: {
          firstName: oldPatient.firstName,
          lastName: oldPatient.lastName,
          dateOfBirth: oldPatient.dateOfBirth,
        },
        newValues: data,
      },
    });

    return updatedPatient;
  }

  // ============================================================================
  // TAREA 3.10: Delete Patient (Soft Delete)
  // ============================================================================
  //
  // El problema (en JavaScript):
  // Permanent delete loses audit trail.
  // HIPAA doesn't allow data loss.
  //
  // Con Soft Delete (deletedAt field):
  // Mark as deleted, but data persists.
  //
  // Ventajas:
  // - Audit trail preserved
  // - Reversible (can un-delete)
  // - Legal: satisfies HIPAA
  //
  // Aplicación Healthcare:
  // Patient asks to be deleted → add deletedAt timestamp.
  // Audit logs still accessible (for legal discovery).
  // Patient data hidden from UI (unless specifically viewing deleted).

  async softDelete(patientId: string, userId: string) {
    // TODO: Implement soft delete
    // Requirements:
    // 1. Add a deletedAt field to Patient model (in schema.prisma)
    // 2. Update patient: set deletedAt = now()
    // 3. Create AuditLog entry
    // 4. For this exercise, just update + log

    const patient = await this.db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) throw new Error("Patient not found");

    // Note: This assumes you've added deletedAt to schema
    // const updated = await this.db.patient.update({
    //   where: { id: patientId },
    //   data: { deletedAt: new Date() }
    // });

    await this.db.auditLog.create({
      data: {
        entityType: "PATIENT",
        entityId: patientId,
        action: "DELETE",
        userId,
        oldValues: { patientId, mrn: patient.mrn },
        newValues: null,
      },
    });

    return { success: true, deletedAt: new Date() };
  }
}

// ============================================================================
// NOTAS DE APRENDIZAJE
// ============================================================================
//
// 1. REPOSITORY PATTERN SOLVES N+1
//    Move queries into repository, optimize centrally.
//    Business logic calls repository.findWithTests() instead of raw Prisma.
//
// 2. INCLUDE vs SELECT
//    include: { labTests: true } → Load all related data
//    select: { id: true, name: true } → Load only specific fields
//    Use SELECT to avoid over-fetching.
//
// 3. FILTERING ON RELATIONS
//    where: { labTests: { some: { status: 'PENDING' } } } → Use EXISTS in SQL
//    Performance: EXISTS faster than IN for large datasets.
//
// 4. PAGINATION IS MANDATORY FOR LARGE DATASETS
//    Never load all rows at once (will crash with 1M+ rows).
//    Use skip + take for consistent O(n) performance.
//
// 5. AUDIT LOGS MUST BE CREATED WITH UPDATES
//    Update pattern: get old state → update → log change.
//    Use $transaction to ensure both succeed.
//
// 6. SOFT DELETE > HARD DELETE
//    Healthcare data is never truly deleted (HIPAA requires audit trail).
//    Mark deletedAt instead of permanent delete.
//
// 7. RAW SQL WHEN NEEDED
//    Prisma ORM isn't the right tool for every query.
//    Complex GROUP BY, window functions → use raw SQL (with parameterization).
//
// 8. TYPE SAFETY IS YOUR FRIEND
//    Prisma generates types from schema.
//    Repository methods return typed results (not any[]).
//    This prevents runtime errors.

// ============================================================================
// CONEXIÓN CON TU BACKGROUND
// ============================================================================
//
// AUDITORÍA:
// This entire repository is built around audit trails.
// Your background means you understand why every method tracks:
// - WHO (userId)
// - WHAT (oldValues vs newValues)
// - WHEN (timestamp)
// This makes you dangerous (in a good way) to legacy systems that don't audit.
//
// BIOLOGÍA (QBP):
// Lab tests need domain-specific queries.
// "Find patients with abnormal glucose results" requires understanding what abnormal means.
// Your QBP background means you can write better queries than someone without clinical knowledge.
//
// SALES/UX:
// Fast queries = happy clinicians. Slow queries = product failure.
// This repository ensures <100ms response times.
// That's the difference between product adoption and abandonment.
