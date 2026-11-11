# Changelog

All notable changes to **training-coach** are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-01

### Added
- feat: read all Garmin data from garmin-api, drop Supabase and the Garmin login (`9a8fff4`)

## [0.1.0] - 2026-01-27

### Added
- Initial commit: Training Coach with Env Setup (`20a05bf`)
- feat(data): scripts for garmin sync and supabase upload (`539c954`)
- feat(ui): basic dashboard with stats and activity list (`c696fa1`)
- feat(ui): add insights and planning dashboard (`80ca0b9`)
- feat(plan): dynamic training generator and fatigue analysis (`b900112`)

### Fixed
- fix(ui): move Recharts to client component (`2c96af8`)
- fix(css): simplify tailwind config and clean build cache (`5ab0312`)
- fix(react): move startTransition to useEffect + fix chart sizing (`280e83f`)
- fix(layout): proper grid structure and responsive breakpoints (`181818b`)

### Chores
- docs: add comprehensive project documentation (`a7d37d1`)
