# **Database Schema Documentation**

## **1. School (Tenant)**

- **Table:** `schools`
- **Purpose:** Represents a school or tenant in a multi-tenant system.
- **Columns:**
  - `id` (PK)
  - `name` (unique, not null)
  - `client_id` / `client_secret` – for Google OAuth integration
  - `domain` – optional domain filter
  - `created_at` / `updated_at` – inherited from `TimestampMixin`

- **Relationships:**
  - `users` → all users belonging to the school
  - `houses` → all houses belonging to the school

**Notes:**
This is the **top-level tenant** table. All users, houses, and logs are linked to a `school_id` to enforce tenant isolation.

---

## **2. User**

- **Table:** `users`
- **Purpose:** Represents a user (teacher, student, or admin).
- **Columns:**
  - `id` (PK)
  - `email` (unique, not null)
  - `name`
  - `role` – `teacher` / `student` / `admin`
  - `class_group` – optional
  - `school_id` (FK → `schools.id`)

- **Relationships:**
  - `school` → the school this user belongs to
  - `points_given` → logs of points awarded by this user
  - `refresh_tokens` → refresh tokens associated with this user

**Notes:**

- Tenant-safe: Every user must belong to a `school_id`.
- Teachers and admins can award points; students can receive points via their house.

---

## **3. RefreshToken**

- **Table:** `refresh_tokens`
- **Purpose:** Stores refresh tokens for JWT authentication.
- **Columns:**
  - `id` (PK)
  - `user_id` (FK → `users.id`)
  - `token` (unique, not null)
  - `created_at`
  - `revoked` (boolean, default False)

- **Relationships:**
  - `user` → the user this token belongs to

**Notes:**

- Used in the `/auth/refresh` endpoint.
- Only valid if `revoked = False`.

---

## **4. House**

- **Table:** `houses`
- **Purpose:** Represents a house/group in the school (like Hogwarts houses).
- **Columns:**
  - `id` (PK)
  - `name` (unique, not null)
  - `description`
  - `logo_url`
  - `total_points` (accumulated points for the house)
  - `school_id` (FK → `schools.id`)

- **Relationships:**
  - `school` → the school this house belongs to
  - `logs` → all `PointsLog` entries associated with this house

**Notes:**

- Each house is tied to a school for tenant isolation.
- Points awarded to students are aggregated in `total_points`.

---

## **5. PointsLog**

- **Table:** `points_logs`
- **Purpose:** Tracks points awarded by teachers to houses.
- **Columns:**
  - `id` (PK)
  - `house_id` (FK → `houses.id`)
  - `teacher_id` (FK → `users.id`)
  - `points` (integer, not null)
  - `reason` (text)
  - `class_group` (optional)
  - `awarded_at` (timestamp, default `datetime.utcnow`)

- **Relationships:**
  - `house` → the house receiving the points
  - `teacher` → the user awarding the points

**Notes:**

- Tenant-safe: `house_id` ensures points are only awarded within the same school.
- Useful for reporting and leaderboards per school.

---

## **Relationship Diagram (Simplified)**

```
School
 ├─ Users
 │   ├─ RefreshTokens
 │   └─ PointsLog (teacher_id)
 └─ Houses
     └─ PointsLog (house_id)
```

- **School → Users**: One-to-many
- **School → Houses**: One-to-many
- **User → PointsLog**: One-to-many (teacher awards points)
- **House → PointsLog**: One-to-many (house receives points)

**Tenant Isolation:**

- All tables containing `school_id` are automatically filtered in queries to prevent cross-tenant data access.
