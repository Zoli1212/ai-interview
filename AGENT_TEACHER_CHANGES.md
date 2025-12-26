# Agent Teacher - Remaining Changes

## Terminology Changes:
- **candidate** → **learner**
- **student** → **learner**  
- **interviewer** → **teacher** / **AI teacher**
- **interview** → **learning session**

## Files to Update:

### 1. app/(routes)/interview/[interviewId]/start/page.tsx
**Critical D-ID Agent Prompts:**
- Line 199: "Connected to interviewer!" → "Connected to teacher!"
- Line 201: "Disconnected from interviewer" → "Disconnected from teacher"
- Line 239: "Failed to initialize interviewer" → "Failed to initialize teacher"
- Line 278: Intro already updated ✓
- Line 287: "ask the student" → "ask the learner"
- Line 295: "Interview started!" → "Learning session started!"
- Line 326: "Candidate's answer:" → "Learner's answer:"
- Line 334: "Thank the candidate" → "Thank the learner"
- Line 392: "Interview Completed!" → "Learning session completed!"
- Line 400: "Interview Session" → "Learning Session"
- Line 511: "Interviewer" → "Teacher"

**Type/Function Names:**
- Line 11: `InterviewData` → Keep (internal)
- Line 14: `interviewQuestions` → Keep (internal)
- Line 35: `StartInterview` → Keep (function name)

### 2. Dashboard & Components
All "Interview" references in UI text need updating to "Learning Session"

### 3. Convex/Prisma
- `api.Interview.*` calls remain (backend naming)
- Only UI-facing text changes

## Implementation Priority:
1. **HIGH**: start/page.tsx prompts (affects user experience directly)
2. **MEDIUM**: Dashboard UI labels
3. **LOW**: Internal variable names (optional)

deployment

