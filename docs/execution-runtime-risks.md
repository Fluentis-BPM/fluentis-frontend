# Runtime Paso Execution: Risk & Rollback Plan

## 1. Partial Flush Failures
- Scenario: Some field drafts fail to persist (network/API error) while others succeed.
- Mitigation:
  - Each draft retains `dirty` + `error` state; failed ones stay dirty with error message.
  - `flushPasoDrafts.rejected` marks drafts in queue with an error; user can retry Save All or field-level blur to re-attempt.
- Rollback:
  - Because writes are idempotent (PUT per relation), simply retry. No bulk transactional need.

## 2. Race Conditions (Concurrent Edits)
- Scenario: User edits same paso in two tabs; last write wins silently.
- Mitigation:
  - Store keeps `lastSavedValue`; after flush success, local reflects server.
  - (Optional future) Include `If-Unmodified-Since` or version field if backend adds concurrency tokens.
- Rollback:
  - Manual: user reloads paso (Close drawer & reopen triggers refetch).

## 3. Stale Data / Long-Lived Drawer
- Scenario: Drawer open for long period; backend changes required fields or default values.
- Mitigation:
  - Provide manual refresh (future: add a Refresh button calling `fetchPasoExecutionRelations`).
  - Auto-close drawer after execution.
- Rollback:
  - User reopens drawer to fetch fresh metadata.

## 4. Validation Drift (Client vs Server)
- Scenario: Server enforces additional rules not mirrored client-side.
- Mitigation:
  - Client-side validation is minimal (required, number, date, multi-checkbox JSON). Server remains source of truth.
  - Show server error on flush rejection; keep drafts dirty.
- Rollback:
  - User adjusts value according to server error message.

## 5. Execute Without Persisted Values
- Scenario: User clicks Ejecutar before save completes.
- Mitigation:
  - Execute button disabled while `flushInProgress` or any required error/dirty missing value.
  - Handle: Forced flush before execute path already implemented (`handleExecute`).
- Rollback:
  - If forced flush fails, display error & keep drawer open.

## 6. Multi-Field Blur Flush Spamming
- Scenario: Rapid blur events trigger multiple sequential flushes.
- Mitigation:
  - Current implementation calls a full flush; pending optimization: queue debounce (not yet implemented).
- Rollback:
  - Acceptable for initial version; monitor performance.

## 7. Network Latency / Slow Saves
- Scenario: User perceives lag; re-edits field.
- Mitigation:
  - Draft retains `saving` flag (future enhancement) to show spinner per field.
  - Global footer shows "Guardando..." when flushInProgress.
- Rollback:
  - Edits while saving update draft rawValue; subsequent flush picks latest.

## 8. Backend Shape Changes
- Scenario: API changes relation field names.
- Mitigation:
  - Mapping layer in `fetchPasoExecutionRelations` isolates shape assumptions.
- Rollback:
  - Adjust mapper; runtime UI unaffected.

## 9. Execution After Partial Failures
- Scenario: Some optional fields failed to save; user still executes.
- Mitigation:
  - Required validation gating ensures only optional fields could fail.
  - Execution path flushes again; if still failing, user sees error and execution aborts.

## 10. Large Number of Fields
- Scenario: Many relations produce performance issues rendering / validating.
- Mitigation:
  - Lightweight per-draft validation only when editing.
  - Virtualization optional future improvement.

## 11. File Inputs (Not Yet Implemented)
- Scenario: User expects uploads; current implementation records only filename.
- Mitigation:
  - Future extension with presigned upload flow; current safe fallback is plain text.
- Rollback:
  - Hide unsupported tipo_input until implemented.

---
## Operational Playbook
| Issue | Symptom | Action |
|-------|---------|--------|
| Flush error | Red error under field(s) | User edits & triggers blur or clicks Guardar again |
| Cannot execute | Execute disabled | Hover tooltip (future) or check required fields marked * |
| Stale content | Values outdated | Close & reopen drawer to refetch |
| Mass failures | Many fields error | Retry; check network console; escalate backend logs |

## Future Enhancements (Optional)
- Debounced per-field flush (aggregate within 500ms window).
- Version hash (etag) to detect concurrent modifications.
- Inline spinner per field while saving.
- Refresh button in drawer header.
- Telemetry events for flush success/failure rates.

