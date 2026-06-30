# 🎾 Tennis Analytics

A mobile-style web app for tracking tennis matches point-by-point and seeing your stats
(serve location, fault location, rally length, win rate, and more). It also has an
on-device computer-vision screen that detects players and the ball in an uploaded video.

The whole app is a **single file** — `index.html` — with no build step.

---

## Run it locally

Just open `index.html` in a browser (double-click it), **or** serve it from a folder:

```bash
# from inside this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Out of the box it runs in **local mode**: accounts and matches are saved in your browser
(`localStorage`). A demo account is pre-filled on the sign-in screen:

- **Email:** `alex@email.com`
- **Password:** `tennis`

You can also create your own account with **Sign Up**.

---

## Make it a "real" app with a cloud backend (Supabase)

This connects real accounts + a cloud database, so your data syncs across devices.

### 1. Create a Supabase project (free)
1. Go to <https://supabase.com> → sign up → **New project**.
2. Wait ~2 minutes for it to finish setting up.

### 2. Get your two keys
In your project: **Project Settings → API**. Copy:
- **Project URL** (looks like `https://abcd1234.supabase.co`)
- **anon public** key (a long string — this one is safe to put in your code)

> ⚠️ Only use the **anon** key. Never put the **service_role** key in this file.

### 3. Paste them into `index.html`
Near the top of the `<script>` section there's a **CONFIG** block:

```js
const SUPABASE_URL  = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON = "PASTE_YOUR_ANON_PUBLIC_KEY_HERE";
```

Replace the two strings with your values. That's the only code change you need.

### 4. Create the database table (one time)
In Supabase: **SQL Editor → New query**, paste this, and click **Run**:

```sql
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users default auth.uid(),
  p1 text, p2 text, score text, winner text,
  fmt text, played_on text, stats jsonb,
  created_at timestamptz default now()
);

alter table matches enable row level security;

create policy "own matches" on matches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

(The last part — Row-Level Security — guarantees each user only ever sees their own matches.)

### 5. Make testing easy
In **Authentication → Providers → Email**, turn **off** "Confirm email" while you're testing,
so new sign-ups log in immediately instead of waiting for a confirmation email.

Done — reload the app and it's now using the cloud. 🎉

---

## Put it online (free public URL)

**GitHub Pages:**
1. Push this folder to a GitHub repo (see below).
2. In the repo: **Settings → Pages → Source: `main` branch / root → Save**.
3. After a minute you'll get a URL like `https://<your-username>.github.io/<repo>/`.

(GitHub Pages serves over HTTPS, which Supabase and the camera/CV features require.)

---

## Notes
- **Computer vision** runs entirely in the browser (TensorFlow.js + COCO-SSD). It's a
  starting point — detecting players and the ball — and is the part still being built out.
- Local mode stores everything in one browser; the Supabase backend is what makes it a real,
  multi-device app.
