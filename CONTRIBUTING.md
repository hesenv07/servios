## 📥 Contributing Guide

This package is open for contributions from everyone.
If you want to add new services, hooks, utility functions, or improvements, please follow the rules below so we maintain a clean and stable foundation library.

### 🔧 What You Can Contribute

You may contribute:

- API service implementations and abstractions
- Core service utilities (authentication, caching, providers)
- Reusable React hooks
- Pure utility/helper functions
- Shared constants or small modules
- Fixes or improvements to existing features
- Documentation updates

#### Important Requirements

- Each contribution **must work independently** or clearly declare its dependencies.
- Must be **general-purpose and reusable** across multiple projects.
- Must include **proper TypeScript types**.

### 🛠 How to Contribute

1. Fork the project
2. Create a new branch from `main`.
3. Add your service/hook/util/lib following the existing structure.
4. Write tests if applicable.
5. Update `CHANGELOG.md` using the correct category.
6. Open a Pull Request.
7. PRs must use **Squash and Merge**.
8. After approval, your PR will be merged and automatically released through CI/CD.

### 📝 Commit Message Rules

These rules are **required** for the automatic release pipeline to work.

When squashing your PR, the commit message **must** follow Conventional Commits format:

### New Feature / Service / Hook

```sh
feat: added ApiService base class for HTTP requests
feat: added useLocalStorage hook
feat: added token management utilities
```

→ triggers a minor version bump

### Bug Fix

```sh
fix: corrected token refresh logic in axios interceptor
fix: corrected delay behavior in useDebounce
```

→ triggers a patch version bump

### Breaking Change

```sh
feat!: updated ApiService configuration interface
feat!: updated API for useToggle
```

→ triggers a major version bump

## Updating the CHANGELOG

Each PR must update CHANGELOG.md:

Use the correct category (Added, Changed, Fixed, etc.)
Follow the formatting already used in the file
Keep descriptions short and clear

## [Unreleased]

### Added

```sh
- `ApiService` base class for building HTTP service clients (#42)
- `useLocalStorage` hook for persisting state in localStorage (#43)
- Token management utilities with multiple storage options (#44)
```

### Fixed

```sh
- Fixed race condition in `useDebounce` when value changes rapidly (#45)
- Fixed token refresh retry logic in axios interceptor (#46)
```

### Final Note

Your involvement is highly appreciated!
The more people contribute, the more powerful and useful this foundation library becomes.
Let's build something reliable and reusable for modern applications! 🚀
