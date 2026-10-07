# Stage 9: feedback (`/task-resolver:feedback [reloop|end] [notes]`)

**Input:** the user's message, plus any files in `workframe/feedbacks/` newer than the last loop.

1. Write `feedback/loop-N.md` ([template](../templates/feedback.md)). Classify each feedback item as one of:
   - **defect**: a bug in this change;
   - **change**: an adjustment within the requirement;
   - **new scope**: beyond the requirement.

   Then give each item its proposed handling.
2. Choose the path from `$ARGUMENTS` or the user's own words. If neither says, ask.

   **reloop**
   1. Move `discussion/`, `planning/`, `implementation/`, `testing/`, `code-review/` and `feedback/` into `loops/loop-N/`. The stage folders move together, so relative links between them keep working.
   2. Recreate the empty skeleton and bump STATUS to Loop N+1.
   3. Run the *Discuss* half of [start.md](start.md), taking the feedback and the open decisions as the change to the requirement. The intake snapshot stays as it is.

   If the user says the feedback is small and defects only, you may go straight to a short plan. Record that the user allowed it.

   **end**
   1. Set STATUS to Feedback ✅ and record `Task ended <date>`.
   2. Suggest `/task-resolver:archive`.
