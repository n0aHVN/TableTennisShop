# Access Control Matrix

| Field | Value |
|-------|-------|
| **Version** | 0.1 (draft) |
| **Last updated** | 2026-08-02 |

Roles follow `RoleEnum` in `@tabletennisshop/common` (e.g. customer / employee / owner — confirm exact enum values in code).

Legend: **A** = allow, **D** = deny, **S** = self only (own resource).

| API area | Anonymous | Customer | Employee | Owner/Admin |
|----------|-----------|----------|----------|-------------|
| `POST /api/users/signup` | A | A | A | A |
| `POST /api/users/signin` | A | A | A | A |
| `POST /api/users/signout` | A | A | A | A |
| `GET /api/users/currentuser` | A* | A | A | A |
| `GET /api/products` | A | A | A | A |
| `POST/PATCH /api/products` | D | D | A** | A |
| Product media admin | D | D | A** | A |
| Orders create/list own | D | A | A | A |
| Orders analytics | D | D | A | A |
| Payments create | D | A*** | A | A |
| Inventory mutate / import | D | D | A | A |

\* May return empty/null user.  
\** Confirm against actual middleware in product/inventory routers.  
\*\*\* Only for own payable orders.

**Rule:** When docs and code disagree, **code wins** — update this matrix in the same PR as middleware changes.
