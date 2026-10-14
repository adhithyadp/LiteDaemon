# How to Pull Updates from the Original opentypeless Repo

## Why This Matters
opentypeless is actively maintained. When they fix bugs or add features, we want those too.
Because we NEVER edit original files, pulling updates is always conflict-free.

## Steps

```bash
# 1. Make sure you're on the dev branch
git checkout dev

# 2. Fetch the latest from the original repo
git fetch upstream

# 3. Merge their changes into our dev branch
git merge upstream/main

# 4. No conflicts will appear (because we never touched their files)

# 5. Push to our GitHub
git push origin dev

# 6. When ready, merge dev into main
git checkout main
git merge dev
git push origin main
```

## What If There IS a Conflict?
If a conflict ever appears, it means someone edited an original file.
Check WHAT_WE_CHANGED.md — that file must be updated whenever an original file is touched.
Resolve the conflict carefully, keeping our changes + their improvements.
