# Security Specification

## 1. Data Invariants

1.  **User Profiles**:
    *   Each user can read their own profile. Only the owners and administrators can write/read private profiles.
    *   Users are blocked from modifying their own `role` field. Only an Admin can elevate or change a user's role.
2.  **Customers**:
    *   A customer record cannot be created unless it is linked to a valid, authenticated user.
    *   Access to customers is restricted to signed-in users with valid roles (Admin, Agent, Viewer can read; Admin and Agent can write).
3.  **Complaints**:
    *   A complaint cannot exist without a valid customer ID.
    *   All complaints must have an owner (`userId`).
    *   Viewer role is strictly read-only.
    *   Agent (Contributor) can modify all fields except status transitions if locked, and cannot touch system-level metadata.
    *   Status modifications are permitted for Admins and Agents, but status becomes semi-locked during completed or checked-out statuses to maintain transactional integrity.

## 2. The "Dirty Dozen" Payloads

Here are twelve payloads designed to test security vulnerability bypasses (Identity, Integrity, and State):

### Attempt 1: Identity Spoofing (Create customer with other user's ID)
```json
{
  "id": "cust-1",
  "name": "Jane Doe",
  "phone": "12345678",
  "userId": "SOME_OTHER_USER_ID",
  "createdAt": "2026-06-14T00:00:00Z"
}
```
**Expected**: `PERMISSION_DENIED`

### Attempt 2: Privilege Escalation (Self-assigned Admin role)
```json
{
  "uid": "my-uid",
  "email": "attacker@example.com",
  "name": "Attacker",
  "role": "Admin",
  "createdAt": "2026-06-14T00:00:00Z"
}
```
**Expected**: `PERMISSION_DENIED`

### Attempt 3: Status Shortcutting (Direct to Completed without Receive Date)
```json
{
  "id": "comp-1",
  "customerId": "cust-1",
  "customerName": "Jane Doe",
  "customerPhone": "12345678",
  "description": "Faulty product",
  "status": "Completed",
  "productName": "Phone",
  "productCategory": "Electronics",
  "productModel": "X100",
  "productSerialNumber": "SN-123456",
  "companyName": "TechCorp",
  "userId": "my-uid",
  "createdAt": "2026-06-14T00:00:00Z",
  "updatedAt": "2026-06-14T00:00:00Z"
}
```
**Expected**: `PERMISSION_DENIED`

### Attempt 4: Injection of Huge Document ID (Denial of Wallet)
`POST /complaints/aaaaaaaa... [1.5KB long ID]`
**Expected**: `PERMISSION_DENIED`

### Attempt 5: Bypassing Creation Validation (Missing ProductName)
```json
{
  "id": "comp-2",
  "customerId": "cust-1",
  "customerName": "Jane Doe",
  "customerPhone": "12345678",
  "description": "Faulty product",
  "status": "Pending",
  "productCategory": "Electronics",
  "productModel": "X100",
  "productSerialNumber": "SN-123456",
  "companyName": "TechCorp",
  "userId": "my-uid",
  "createdAt": "2026-06-14T00:00:00Z",
  "updatedAt": "2026-06-14T00:00:00Z"
}
```
**Expected**: `PERMISSION_DENIED`

### Attempt 6: Modifying Immutable `createdAt` Timestamp on Complaint Update
```json
{
  "id": "comp-1",
  "createdAt": "2020-01-01T00:00:00Z"
}
```
**Expected**: `PERMISSION_DENIED`

### Attempt 7: Anonymous Session Write Access to Dashboard Collections
**Expected**: `PERMISSION_DENIED`

### Attempt 8: Viewer Modifying Complaint Status
**Expected**: `PERMISSION_DENIED`

### Attempt 9: Unverified User Account Action Writes
**Expected**: `PERMISSION_DENIED` (Unless email validation is not strictly enforced by active accounts, but we require verified accounts in core security).

### Attempt 10: Value Poisoning (Save description with huge string, e.g. 1MB)
**Expected**: `PERMISSION_DENIED` via length validation limit.

### Attempt 11: Modifying User Profile (Viewer writing to public database config)
**Expected**: `PERMISSION_DENIED`

### Attempt 12: Blank read of another user's private info
**Expected**: `PERMISSION_DENIED`

## 3. Test Verification
All the rules defined in `firestore.rules` will properly filter incoming requests to assert that all hostile vectors fail immediately with `PERMISSION_DENIED`.
