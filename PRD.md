Excellent. You’ve made disciplined, high-quality decisions throughout—this is now very buildable.

Below is your **complete PRD + execution plan**, structured so you can feed it into Codex and build iteratively without getting stuck.

---

# 🧾 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 📌 Product Name

**Tennis Analytics App (V1)**

---

## 🎯 Objective

Build a **mobile-first web application** that allows a user to:

1. Track tennis matches point-by-point with **full detail**
2. Automatically compute match statistics
3. Store and review past matches

---

## 👤 Target User

* Primary: **Single user (Player 1 = you)**
* Use case:

  * Live match tracking (courtside, phone)
  * Post-match analytics

---

## 🧱 Core Features (V1 Scope)

### 1. Start Match

* Input:

  * Player 1 name (you)
  * Player 2 name (opponent)
  * Who serves first
* Format:

  * **1 set**
  * **Tiebreak at 6–6**

---

### 2. Live Match Tracking

#### Constraints:

* ❗ No typing
* ❗ All inputs via buttons
* ❗ Max 1–2 taps per action

---

### Point Input Flow

#### Step 1: Serve

* First serve:

  * In / Fault
  * Direction: Wide / Body / T
  * Result: Ace / In Play / Fault

* If fault:

  * Second serve:

    * In / Fault
    * Direction
    * Result: Double Fault / In Play

---

#### Step 2: Rally

* Rally length:

  * 2
  * 3–4
  * 5–6
  * 7+

---

#### Step 3: Outcome

* Winner:

  * Player 1 / Player 2

* End type:

  * Winner
  * Forced error
  * Unforced error

* Shot type:

  * Forehand
  * Backhand
  * Volley
  * Smash

* Shot detail:

  * Crosscourt
  * Down the line
  * Inside-out
  * Inside-in
  * Slice
  * Drop shot
  * Passing shot

* If error:

  * Net
  * Long
  * Wide

---

### Special Controls

* ✅ Confirm Point
* ⏪ Undo Last Point
* ➕ Quick Point (No Data)

  * Updates score only
  * Saves:

    * `is_tracked = false`

---

### 3. Analytics

Per match:

#### Serve Stats

* First serve %
* Second serve %
* Aces
* Double faults

#### Point Stats

* Winners
* Forced errors
* Unforced errors

#### Rally Stats

* Average rally length
* Win % by rally length

---

### 4. Match History

* List of matches
* Tap to view analytics

---

# 🏗️ TECHNICAL ARCHITECTURE

## Frontend

* **Next.js (App Router)**
* Mobile-first responsive design

---

## Backend

* Next.js API routes

---

## Database

* **Supabase (PostgreSQL)**

---

## Hosting

* **Vercel**

---

# 🧩 DATABASE SCHEMA

## Table: `matches`

```sql
id (uuid)
player1_name (text)
player2_name (text)
match_date (timestamp)
winner (text)
created_at (timestamp)
```

---

## Table: `points`

```sql
id (uuid)
match_id (uuid)

set_number (int)
game_number (int)
point_in_game (int)

server (text)

is_tracked (boolean)

-- Serve
first_serve_in (boolean)
first_serve_direction (text)
first_serve_result (text)

second_serve_in (boolean)
second_serve_direction (text)
second_serve_result (text)

-- Rally
rally_length (int)

-- Outcome
winner (text)
end_type (text)

shot_type (text)
shot_detail (text)

error_type (text)

created_at (timestamp)
```

---

# ⚙️ MATCH ENGINE (LOGIC)

## Rules:

* 1 set match
* First to 6 games
* Tiebreak at 6–6
* Standard scoring:

  * 0, 15, 30, 40, deuce, advantage

---

## Behavior:

* Every confirmed point:

  * Updates score
  * Saves to DB
* Automatically:

  * Detect game win
  * Detect set win
  * Detect match end

---

# 🔌 API DESIGN

## Create Match

```
POST /api/matches
```

---

## Add Point

```
POST /api/points
```

---

## Get Match

```
GET /api/matches/:id
```

---

## Get Analytics

```
GET /api/analytics/:match_id
```

---

# 🎨 UI/UX REQUIREMENTS

## Global Rules

* Mobile-first
* Large tap targets
* No scrolling during point input
* No typing during match

---

## Screens

### Home

* Start Match
* Recorded Match (disabled)
* Analytics

---

### Match Setup

* Name inputs
* Serve selection
* Start button

---

### Live Match Screen

* Top: Scoreboard
* Middle: Dynamic input
* Bottom:

  * Confirm
  * Undo
  * Quick Point

---

# 💾 DATA STRATEGY

* Auto-save **after every point**
* No batch saving
* No offline mode (V1)

---

# 🚀 FUTURE FEATURES (NOT IN V1)

* Recorded match (video tagging)
* AI-assisted tracking
* Player accounts
* Cross-match analytics
* Age group comparisons

---

# 🧩 BUILD PLAN (CODEX-READY)

## 🔨 RULE:

> Do NOT move to next step until current step works fully

---

## ✅ CHUNK 1 — Project Setup

**Goal:**

* Next.js app running locally

**Tasks:**

* Create Next.js app
* Setup Tailwind (for UI)
* Clean folder structure

**Test:**

* App runs on localhost

---

## ✅ CHUNK 2 — Supabase Setup

**Goal:**

* Database connected

**Tasks:**

* Create Supabase project
* Create `matches` + `points` tables
* Connect to app

**Test:**

* Can insert a test match manually

---

## ✅ CHUNK 3 — Create Match Flow

**Goal:**

* User can create a match

**Tasks:**

* Build setup screen
* API route: create match

**Test:**

* Match saved in DB

---

## ✅ CHUNK 4 — Score Engine (Local Only)

**Goal:**

* Score updates correctly (no DB yet)

**Tasks:**

* Implement tennis scoring logic

**Test:**

* Simulate full set manually

---

## ✅ CHUNK 5 — Point Input UI

**Goal:**

* Full 3-step input working

**Tasks:**

* Serve UI
* Rally UI
* Outcome UI

**Test:**

* Can input full point without bugs

---

## ✅ CHUNK 6 — Save Points

**Goal:**

* Points persist in DB

**Tasks:**

* Connect input → API → DB

**Test:**

* Each point saved correctly

---

## ✅ CHUNK 7 — Undo + Quick Point

**Goal:**

* Error recovery works

**Tasks:**

* Undo logic
* Quick point logic (`is_tracked=false`)

**Test:**

* Score + DB consistent after undo

---

## ✅ CHUNK 8 — Match Completion

**Goal:**

* Match ends correctly

**Tasks:**

* Detect winner
* Save winner to DB

**Test:**

* Match closes at correct time

---

## ✅ CHUNK 9 — Analytics Engine

**Goal:**

* Stats computed from DB

**Tasks:**

* Write queries
* Build analytics endpoint

**Test:**

* Stats match manual calculations

---

## ✅ CHUNK 10 — Analytics UI

**Goal:**

* Display stats cleanly

**Tasks:**

* Match list
* Match detail page
* Basic charts

**Test:**

* Data is readable and correct

