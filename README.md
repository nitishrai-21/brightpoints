brightpoints/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── core/
│ │ │ ├── config.py
│ │ │ ├── security.py
│ │ │ └── database.py
│ │ │
│ │ ├── models/
│ │ │ └── my_model.py
│ │ │
│ │ ├── schemas/
│ │ │ ├── user.py
│ │ │ ├── house.py
│ │ │ └── points.py
│ │ │
│ │ ├── api/
│ │ │ ├── deps.py
│ │ │ └── routes/
│ │ │ ├── auth.py
│ │ │ ├── houses.py
│ │ │ └── points.py
│ │ │
│ │ └── services/
│ │ └── points_service.py
│ │
│ ├── requirements.txt
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ │ └── client.ts
│ │ ├── components/
│ │ │ ├── PointsLog.tsx
│ │ │ ├── HouseCard.tsx
│ │ │ ├── AddPointsModal.tsx
│ │ │ └── CreateHouseModal.tsx
│ │ ├── pages/
│ │ │ ├── Dashboard.tsx
│ │ │ ├── LogsView.tsx
│ │ │ └── StudentView.tsx
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── styles.css
│ │
│ ├── package.json
│ └── vite.config.ts
│
└── docker-compose.yml

This is a backend data model (using SQLAlchemy) for a **school-based points/reward system**, likely designed for tracking house points in a school.

Here’s the core idea in simple terms:

---

### 🏫 **School (Tenant)**

- Represents a school using the system.
- Stores:
  - Name, domain
  - Google OAuth credentials (client ID/secret)

- A school has:
  - Many users (teachers/students/admins)
  - Many houses

---

### 👤 **User**

- Represents people in the system (students, teachers, admins).
- Key fields:
  - Email (unique), name, role
  - Class group (e.g. "1A")

- Belongs to a school.
- Teachers can:
  - Give points (tracked in `PointsLog`)

- Has authentication support via refresh tokens.

---

### 🔐 **RefreshToken**

- Handles login sessions.
- Stores:
  - Token string
  - Created time
  - Revoked status

- Linked to a user.

---

### 🏠 **House**

- Represents school houses (like teams).
- Stores:
  - Name, description, logo
  - Total accumulated points
  - Color + motto

- Belongs to a school.
- Receives points via logs.

---

### 🧾 **PointsLog**

- Tracks every instance of points being awarded.
- Stores:
  - Which house got points
  - Which teacher gave them
  - How many points and why
  - Class group + timestamp

- Acts as the **audit/history system**.

---

### 🧠 Overall Flow

- A **teacher (User)** gives points →
- A **PointsLog** entry is created →
- Points are associated with a **House** →
- Houses accumulate totals within a **School**

---

### 🧩 Notes

- Multi-tenant design: multiple schools supported.
- OAuth-ready (Google login per school).
- Student model is commented out → likely using `User` instead for students.

---

If you want, I can also:

- suggest improvements (there are a few important ones),
- or show how to query totals / leaderboards efficiently.

You’ve already built a solid foundation—and the good news is: **your current app can support the treasure hunt feature with minimal disruption**.

Let’s connect your **existing frontend + backend** to this new idea in a _practical, implementation-ready way_.

---

# 🧠 Where You Are Right Now

Your app already has:

### ✅ Backend

- `School` → multi-tenant
- `User` → roles (teacher/student)
- `House` → teams
- `PointsLog` → scoring system (this is GOLD)

### ✅ Frontend

- Role-based dashboard (teacher vs student)
- Navigation + routing already structured
- Modal for awarding points (`AddPointsDrawer`)
- Log system with filtering/pagination

👉 This means:
**You already built 70% of the infrastructure needed.**

---

# 🚀 What You Add (Conceptually)

You’re adding a **new feature layer**, not changing existing logic.

Think of it as:

```
Points System  ← already exists
        ↑
Treasure Hunt Module (NEW)
```

---

# 🧩 Backend Integration (Minimal Disruption)

## 1. Add a new router

```python
app.include_router(activities.router, prefix="/activities")
```

---

## 2. Reuse `PointsLog` (VERY IMPORTANT)

Do NOT create a new reward system.

When activity ends:

```python
PointsLog(
    house_id=winner_house_id,
    teacher_id=activity.created_by,
    points=50,
    reason=f"1st place in {activity.title}"
)
```

👉 This keeps:

- Leaderboards consistent
- Dashboard unchanged
- History unified

---

# 🖥️ Frontend Integration (Fits Your Dashboard)

You don’t need a redesign—just extend navigation.

---

## 🔘 Add New Nav Button

Inside your `navButtons`:

```tsx
{
  label: "Activities",
  icon: <ListAltIcon />,
  active: location.pathname.startsWith("/dashboard/activities"),
  onClick: () => navigate("/dashboard/activities"),
}
```

---

## 🧭 Add New Routes

```tsx
<Route path="activities" element={<ActivitiesList />} />
<Route path="activities/:id" element={<ActivityPlay />} />
<Route path="activities/create" element={<CreateActivity />} />
```

---

# 👨‍🏫 Teacher Experience

### New Page: `ActivitiesList`

Shows:

- All activities
- Status (active/completed)
- Button: ➕ Create Activity

---

### Create Activity Page

Teacher:

- Adds title + description
- Adds clues (step-by-step)
- Sets rewards:
  - 🥇 50 points
  - 🥈 30 points
  - 🥉 10 points

---

### During Activity

Teacher can:

- See live progress
- See which house is on which clue
- End activity

---

# 🎮 Student Experience

### `ActivityPlay.tsx`

Flow:

1. Student selects activity
2. Joins with their house
3. Sees first clue
4. Submits answer
5. Unlocks next clue

---

# 🔁 Example API Flow

## Start Activity

```
POST /activities/{id}/start
```

## Submit Answer

```
POST /activities/{id}/answer
{
  clue_id: 1,
  answer: "library"
}
```

## Finish

```
POST /activities/{id}/finish
```

---

# ⚡ Small but Powerful Enhancements

## 1. Use QR Codes (SUPER EASY WIN)

Instead of typing answers:

- Place QR codes around school
- Scan → unlock clue

---

## 2. Auto Refresh Dashboard

You already have:

```tsx
if (location.state?.refresh)
```

👉 Use it after activity ends to refresh points automatically.

---

## 3. Live Leaderboard (Later Upgrade)

- Use WebSockets or polling
- Show:
  - 🥇 House A
  - 🥈 House B

---

# ⚠️ Important Improvements (Based on Your Code)

## 1. House Points Sync Issue

You have:

```python
total_points = Column(Integer, default=0)
```

👉 This can go out of sync.

**Better approach:**

- Either calculate from `PointsLog`
- OR always update it transactionally when logging points

---

## 2. Security

Right now:

```python
origins = ["*"]
```

👉 Fine for dev, but restrict in production.

---

## 3. Role Safety (Frontend)

You already check:

```tsx
role === "teacher";
```

👉 Good—but also enforce on backend.

---

# 💡 Why This Feature Is a Big Upgrade

This transforms your app from:

> “Points tracker”

into:

> 🧠 **Interactive school engagement platform**

It introduces:

- Gamification
- Movement (physical activities)
- Competition
- Real-time engagement

---

# 🧭 Suggested Build Order

1. ✅ Backend models (`Activity`, `Clue`)
2. ✅ Basic CRUD APIs
3. ✅ Simple frontend list page
4. ✅ Play page (text answers only)
5. ✅ Auto reward → `PointsLog`
6. 🔄 Then add QR / GPS / leaderboard

---

# 🚀 If You Want Next

I can:

- Generate full FastAPI routes for activities
- Build `ActivityPlay.tsx` UI logic
- Design DB migrations (Alembic)
- Add anti-cheating logic

---

This is honestly the kind of feature that could turn your project into something **schools would actually pay for**.
