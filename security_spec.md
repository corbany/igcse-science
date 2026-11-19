# Security Specification: 1v1 Live Quiz Challenges (`/challenges/{challengeId}`)

## 1. Data Invariants
1. **Participant Exclusivity & No Self-Challenge**: A challenge must have two distinct UIDs (`challengerId != challengedId`), `participantIds == [challengerId, challengedId]`, and only participants (`request.auth.uid == challengerId || request.auth.uid == challengedId`) may read, list, or update the challenge.
2. **Identity Integrity on Creation**: Only an authenticated, verified user matching `challengerId == request.auth.uid` can create a challenge, initialized strictly with `status == 'pending'`, `challengerScore == 0`, `challengedScore == 0`, and bounded arrays (`topics` 1..33, `questions` 1..30).
3. **Action-Based State Transitions & Terminal Locking**:
   - Only `challengedId` can accept (`pending -> accepted`) or decline (`pending -> declined`).
   - Only `challengerId` can cancel (`pending|accepted -> cancelled`).
   - Only participants can transition `accepted -> in_progress -> completed` and update scores/winner within numeric bounds (`0..10000`).
   - Once `status` reaches a terminal state (`completed`, `declined`, `cancelled`), no further updates or deletes are permitted.
4. **Immutable Core Configuration & Temporal Integrity**: `id`, `classId`, `challengerId`, `challengedId`, `participantIds`, `topics`, `questionCount`, `tier`, `questions`, and `createdAt` cannot be modified after creation. `createdAt` (on create) and `updatedAt` (on create/update) must equal `request.time`.
5. **No Shadow Fields & No PII**: Only allowlisted `QuizChallenge` keys are accepted; no email addresses or private PII are stored in `/challenges/{challengeId}`.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unauthenticated Read/Write**: Read or write `/challenges/{id}` when `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Write `/challenges/{id}` with `request.auth.token.email_verified == false` -> `PERMISSION_DENIED`.
3. **Challenger Identity Spoofing**: Authenticated user B sends `create` with `challengerId: userA` -> `PERMISSION_DENIED`.
4. **Self-Challenge Loop**: User A sends `create` with `challengerId == challengedId == userA` -> `PERMISSION_DENIED`.
5. **ParticipantIds Mismatch**: User A creates challenge with `participantIds: [userA, userC]` while `challengedId: userB` -> `PERMISSION_DENIED`.
6. **Blanket List Scraping**: User C queries `/challenges` without being in `resource.data.participantIds` -> `PERMISSION_DENIED`.
7. **Shadow Field Injection**: Challenger creates challenge with extra ghost field `isWinnerForced: true` -> `PERMISSION_DENIED`.
8. **Invalid ID Poisoning**: Document ID contains spaces, slashes, or >128 chars -> `PERMISSION_DENIED`.
9. **Unauthorized Accept by Challenger**: Challenger tries to self-accept their own pending challenge (`pending -> accepted`) -> `PERMISSION_DENIED`.
10. **Unauthorized Cancel by Challenged**: Challenged tries to mutate status to `cancelled` instead of `declined` -> `PERMISSION_DENIED`.
11. **Question Tampering Mid-Match**: Participant attempts to alter `questions`, `topics`, or `createdAt` during an `in_progress` update -> `PERMISSION_DENIED`.
12. **Terminal State Replay / Score Tampering**: Participant attempts to modify `challengerScore`, `challengedScore`, or `winnerId` after `status == 'completed'` -> `PERMISSION_DENIED`.
