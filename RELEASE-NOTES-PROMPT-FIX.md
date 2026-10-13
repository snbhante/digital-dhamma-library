# v0.15.2 Prompt Runtime Fix

Fixed `components/SaveSearchButton.tsx` to remove `window.prompt()`, which is unsupported in the Next.js runtime shown in the reported screenshot. The save-search action now uses an inline, accessible form with Save and Cancel controls and an aria-live status message.

After replacing/extracting this project, run `npm run validate:release`. Then test `/search/?q=metta`, select **Save this search**, enter a name, and confirm it appears in the workspace saved-search list. This source fix does not itself verify live Supabase connectivity.
