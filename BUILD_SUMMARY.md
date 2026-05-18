## Realtime LLM telephony fix (2026-05-18 follow-up)

Spec: `docs/superpowers/specs/2026-05-18-realtime-telephony-audio-config-design.md`
Plan: `docs/superpowers/plans/2026-05-18-realtime-telephony-audio-config.md`

**What changes when this ships:**
- `is_realtime=True` users (Gemini Live, OpenAI Realtime) finally get
  two-way audio on telephony calls. The pipeline auto-bumps to 16 kHz.
- `workflow_run.initial_context.is_realtime` becomes a per-call override.
- Non-realtime path: unchanged.

**Deployment path:**
- Fork image built by `.github/workflows/whitelabel-image.yml` →
  `ghcr.io/aymenbenpakiss/dograh-api:whitelabel-<sha>`
- Pin Railway api service to that SHA — NEVER `:whitelabel-latest`.
- Previous Railway image digest (for rollback):
  `ghcr.io/dograh-hq/dograh-api@sha256:3f7f41c5656dba59cf5706a0e45e71b00b32e8148ef34687611d3e915cdc6f2e`
- Rollback: in Railway dashboard, change image source back to the digest
  above. Verified working on 2026-05-18 16:31 UTC.
