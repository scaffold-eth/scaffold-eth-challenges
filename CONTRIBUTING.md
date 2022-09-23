Speedrun-statechannels repository has an unusual configuration because the end product is intentionally broken: ie, it has specific gaps in implementation that are meant to be filled in by students doing the tutorial.

Making improvements to this implementation-with-holes is... not fun. So the intent here is to maintain side-by-side branches:

- `main`: the student-facing default branch with implementation gaps
- `completed`: a branch with the gaps filled in

Work to improve the end-result application should be done against the `completed` branch, merged into the completed branch, and then cherry-picked back to `main`.
