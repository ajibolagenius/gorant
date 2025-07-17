# DAY 2: IMPLEMENTATION 4
_Exported on 7/17/2025 at 17:49:05 GMT+1 from Cursor (1.2.4)_

---

**User**

fetch.js:30 Fetch finished loading: POST "https://rkqvimeslbwsajukjkjs.supabase.co/rest/v1/suggestion_votes?on_conflict=suggestion_id%2Canonymous_id".
eval @ fetch.js:30
eval @ fetch.js:51
fulfilled @ fetch.js:11
Promise.then
step @ fetch.js:13
eval @ fetch.js:14
__awaiter @ fetch.js:10
eval @ fetch.js:41
then @ PostgrestBuilder.js:65
fetch.js:30  POST https://rkqvimeslbwsajukjkjs.supabase.co/rest/v1/rpc/update_suggestion_votes 404 (Not Found)
eval @ fetch.js:30
eval @ fetch.js:51
fulfilled @ fetch.js:11
Promise.then
step @ fetch.js:13
eval @ fetch.js:14
__awaiter @ fetch.js:10
eval @ fetch.js:41
then @ PostgrestBuilder.js:65


---

**Cursor**

Your logs show two key things:

1. **`suggestion_votes` upsert is now working** (no 401 error, fetch finished loading).
2. **`update_suggestion_votes` RPC is still returning 404 (Not Found)**.

---

## What This Means

- **Voting table upserts are succeeding:**  
  The client is able to insert/update votes in the `suggestion_votes` table. This means your RLS and API key setup are correct for this table.

- **The `update_suggestion_votes` function is still missing:**  
  The 404 error for `/rest/v1/rpc/update_suggestion_votes` means the Postgres function (RPC) does **not exist** in your Supabase database.

---

## How to Fix the 404 on `update_suggestion_votes`

You **must create the function** in your Supabase database.  
Here’s the exact SQL to run in your Supabase SQL editor (as previously provided, but with negative count protection):

```sql
create or replace function update_suggestion_votes(
  suggestion_id uuid,
  vote_type text,
  prev_vote text
)
returns void as $$
begin
  if vote_type = 'up' then
    update suggestions
      set votes_up = greatest(votes_up + 1, 0),
          votes_down = greatest(votes_down - case when prev_vote = 'down' then 1 else 0 end, 0)
      where id = suggestion_id;
  elsif vote_type = 'down' then
    update suggestions
      set votes_down = greatest(votes_down + 1, 0),
          votes_up = greatest(votes_up - case when prev_vote = 'up' then 1 else 0 end, 0)
      where id = suggestion_id;
  end if;
end;
$$ language plpgsql;
```

**Steps:**
1. Go to your Supabase dashboard.
2. Open the SQL Editor.
3. Paste and run the SQL above.

---

## After Running the SQL

- The `/rpc/update_suggestion_votes` endpoint will exist.
- Your voting logic will work: after a vote, the function will atomically update the up/down counts, never allowing negative values.

---

## Summary Table

| Issue                | Status      | Solution                                  |
|----------------------|------------|--------------------------------------------|
| suggestion_votes upsert | ✅ Working | No action needed                          |
| update_suggestion_votes 404 | ❌ Not working | **Create the function in SQL editor**     |

---

**Once you create the function, the 404 will disappear and your voting UI will update counts as expected.**

If you want me to check for the function’s existence or help with any other part, let me know!

```sql
create or replace function update_suggestion_votes(
  suggestion_id uuid,
  vote_type text,
  prev_vote text
)
returns void as $$
begin
  if vote_type = 'up' then
    update suggestions
      set votes_up = greatest(votes_up + 1, 0),
          votes_down = greatest(votes_down - case when prev_vote = 'down' then 1 else 0 end, 0)
      where id = suggestion_id;
  elsif vote_type = 'down' then
    update suggestions
      set votes_down = greatest(votes_down + 1, 0),
          votes_up = greatest(votes_up - case when prev_vote = 'up' then 1 else 0 end, 0)
      where id = suggestion_id;
  end if;
end;
$$ language plpgsql;
```

