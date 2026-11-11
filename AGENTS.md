# training-coach — AI Agent Instructions

Repository: `https://github.com/nicanac/training-coach`

## Git, SemVer, Changelog & Release Workflow (Variant C — Zero GitHub Actions)
Every AI agent (Claude Code, Google Antigravity, Gemini CLI, GitHub Copilot, OpenAI Codex) MUST follow this workflow:
1. **Branch per change**: Never commit feature or fix work directly on `main`/`master`. Create a branch: `feat/<slug>`, `fix/<slug>`, `perf/<slug>`, `refactor/<slug>`, or `chore/<slug>`.
2. **Conventional Commits**: Format every commit message as `<type>(<scope>): <summary>` (e.g., `feat(ui): add dashboard filter`, `fix(api): handle empty payload`). Breaking changes use `!` or a `BREAKING CHANGE:` footer.
3. **Merge to default branch**: Open a PR (`nicode-ci` runs verification on the VPS) or merge into `main` once verified.
4. **Zero-Actions Release & Deploy**: GitHub Actions is disabled (`0` Action minutes used; no `.github/workflows/*.yml`). Merging/pushing to the default branch triggers `nicode-ci` on the VPS (`https://ci.nicode.eu/webhook`), which runs `release.mjs` (computes the next SemVer in `VERSION` / `package.json`, updates `CHANGELOG.md`, creates tag `vX.Y.Z` + GitHub Release) and triggers a single Dokploy deploy (`dk application.deploy`). You can also cut a release locally with `node ~/brain/scripts/release.mjs`.
