# ScopePilot - API Contracts & Access Control Model

**Version:** 1.0.0  
**Transport:** HTTPS / REST & Next.js Server Actions  
**Validation:** Zod v3+  
**Authentication:** Supabase Session Cookie (JWT) + Server-Side Session Verification  
**Last Updated:** October 2026  

---

## 1. Access Control & Authorization Guard Model

### 1.1 Centralized Guard Pattern
No Route Handler or Server Action trusts client-supplied identifiers (`projectId`, `requirementId`, etc.). Every request passes through `assertProjectAccess`:

```typescript
// src/lib/security/guards.ts
export async function assertAuthenticated(): Promise<UserSession> {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new AuthorizationError('Authentication required to perform this action', 401);
  }
  return { userId: user.id, email: user.email! };
}

export async function assertProjectAccess(projectId: string, userId: string): Promise<Project> {
  const supabase = createServerClient();
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !project) {
    throw new ForbiddenError('Project not found or access denied', 403);
  }
  return project;
}
```

### 1.2 Standardized JSON Error Response Format
All API endpoints return consistent, structured errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "title",
        "issue": "Title cannot be empty"
      }
    ],
    "requestId": "req_01h7x..."
  }
}
```

Standard HTTP status codes used:
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Schema validation failure.
- `401 Unauthorized`: Missing or invalid session JWT.
- `403 Forbidden`: Authenticated user does not own target resource.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Conflict or immutability violation (e.g. attempting to alter baseline).
- `422 Unprocessable Entity`: AI output failed structural schema validation after retry.
- `429 Too Many Requests`: Rate limit or monthly AI token quota exceeded.
- `500 Internal Server Error`: Unhandled server exception (sanitized in production).

---

## 2. Core API Endpoints & Request/Response Contracts

### 2.1 Project Management

#### `POST /api/projects`
Creates a new project container.

**Request Schema:**
```typescript
export const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(100),
  description: z.string().trim().max(1000).optional(),
  clientName: z.string().trim().min(1, 'Client name is required').max(100),
  clientEmail: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
});
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "E-Commerce Mobile Redesign",
    "clientName": "Acme Corp",
    "currency": "INR",
    "status": "draft",
    "createdAt": "2026-10-18T03:00:00Z"
  }
}
```

---

### 2.2 AI Requirement Extraction

#### `POST /api/ai/extract`
Extracts structured requirements from raw text or uploaded document text.

**Request Schema:**
```typescript
export const ExtractRequirementsRequestSchema = z.object({
  projectId: z.string().uuid(),
  rawText: z.string().trim().min(20, 'Input must contain at least 20 characters').max(50000),
  sourceDocumentId: z.string().uuid().optional(),
});
```

**Response Schema (Structured AI Extraction):**
```typescript
export const ExtractedRequirementItemSchema = z.object({
  reqCode: z.string(), // e.g. "REQ-001"
  title: z.string(),
  description: z.string(),
  category: z.enum(['functional', 'non_functional', 'integration', 'ui_ux', 'security', 'exclusion', 'other']),
  priority: z.enum(['must_have', 'should_have', 'could_have', 'nice_to_have', 'unknown']),
  acceptanceCriteria: z.array(z.string()),
  dependencies: z.array(z.string()),
  assumptions: z.array(z.string()),
  exclusions: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export const ExtractRequirementsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    requirements: z.array(ExtractedRequirementItemSchema),
    summary: z.string(),
    usage: z.object({
      promptTokens: z.number(),
      completionTokens: z.number(),
    }),
  }),
});
```

---

### 2.3 Scope Baseline Approval & Immutability

#### `POST /api/projects/[id]/baseline/approve`
Approves the current project requirements as an immutable baseline version.

**Request Schema:**
```typescript
export const ApproveBaselineRequestSchema = z.object({
  versionLabel: z.string().trim().min(1).max(50), // e.g. "v1.0 - Signed Agreement"
  approverName: z.string().trim().min(1).max(100),
  approvalNotes: z.string().trim().max(1000).optional(),
});
```

**Execution Logic:**
1. Fetch all active requirements for `projectId`.
2. Compute canonical SHA-256 hash: `hash(JSON.stringify(sortedRequirements))`.
3. Check next version sequence: `SELECT COALESCE(MAX(version_number), 0) + 1 FROM scope_versions WHERE project_id = $1`.
4. Transactionally:
   - Insert `scope_versions` with `is_baseline = true`, snapshot, and hash.
   - Insert `scope_approvals`.
   - Update `projects.status = 'active'`.
   - Record `audit_events`.
5. Database trigger activates on `scope_versions` row to prevent any subsequent update/delete.

---

### 2.4 Scope-Change Comparison Engine

#### `POST /api/ai/compare`
Compares new client input against the active immutable baseline.

**Request Schema:**
```typescript
export const ScopeComparisonRequestSchema = z.object({
  projectId: z.string().uuid(),
  newRequestText: z.string().trim().min(10, 'Request must contain at least 10 characters').max(30000),
  sourceDocumentId: z.string().uuid().optional(),
});
```

**AI Classification Schema (Zod Validated):**
```typescript
export const FindingCategorySchema = z.enum([
  'matched_requirement',
  'new_requirement',
  'modified_requirement',
  'removed_requirement',
  'ambiguous_request'
]);

export const ScopeFindingItemSchema = z.object({
  findingType: FindingCategorySchema,
  matchedReqCode: z.string().nullable(), // Null if new requirement
  title: z.string(),
  description: z.string(),
  differenceExplanation: z.string(),
  evidenceQuote: z.string(),
  confidenceLevel: z.enum(['high', 'medium', 'low']),
  dependenciesAffected: z.array(z.string()),
  acceptanceCriteriaChanges: z.array(z.string()),
  suggestedClarificationQuestions: z.array(z.string()),
  suggestedAction: z.string(),
});

export const ScopeComparisonResultSchema = z.object({
  summaryOverview: z.string(),
  totalFindings: z.number(),
  additionsCount: z.number(),
  modificationsCount: z.number(),
  removalsCount: z.number(),
  ambiguousCount: z.number(),
  findings: z.array(ScopeFindingItemSchema),
});
```

---

### 2.5 Scope-Change Decision Recording

#### `PATCH /api/comparisons/findings/[id]/decision`
Records the developer's human-in-the-loop decision on a specific finding.

**Request Schema:**
```typescript
export const RecordDecisionSchema = z.object({
  decision: z.enum([
    'included_in_scope',
    'additional_work',
    'clarification_required',
    'declined',
    'accepted_as_new_version'
  ]),
  notes: z.string().trim().max(1000).optional(),
});
```

---

### 2.6 PDF Export

#### `GET /api/projects/[id]/export/scope-report?comparisonId=[id]`
Streams a compiled PDF document.
- Headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="scopepilot-report-[project-id]-[date].pdf"`
  - `Cache-Control: private, no-cache, no-store`
- Validates user ownership of `projectId` and `comparisonId`.
