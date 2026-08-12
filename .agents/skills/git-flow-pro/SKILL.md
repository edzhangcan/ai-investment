---
name: git-flow-pro
description: >-
  Enforce Git & GitHub engineering best practices. Use whenever performing version control,
  creating branches, writing commit messages, opening Pull Requests (PRs), or preparing release tags.
  Strictly guards against pushing directly to main/master.
---

# Git & GitHub Workflow & Guardrails (`git-flow-pro`)

This skill defines the mandatory Git and GitHub workflow for this repository. It ensures high code quality, clean branch history, automated PR workflows, and zero direct pushes to protected production branches (`main`/`master`).

---

## 🛡️ Mandated Workflow & Guardrails

### 1. Protected Branch Rule — NEVER Push Directly to `main`
- Direct `git push origin main` or `git push origin master` is strictly prohibited.
- All code changes must enter `main` exclusively through a **GitHub Pull Request (PR)**.

---

### 2. Feature & Fix Branch Naming Specification
Before writing code or making edits, always create a dedicated branch from `main`:

Branch Type | Naming Convention | Example
:--- | :--- | :---
**New Features** | `feat/<short-descriptive-name>` | `feat/telegram-bot-alerts`
**Bug Fixes** | `fix/<short-descriptive-name>` | `fix/sec-edgar-parser-timeout`
**Refactoring** | `refactor/<short-descriptive-name>` | `refactor/clean-models`
**Performance** | `perf/<short-descriptive-name>` | `perf/cache-stock-quotes`
**Documentation** | `docs/<short-descriptive-name>` | `docs/api-contracts`
**DevOps/CI** | `chore/<short-descriptive-name>` | `chore/docker-compose-setup`

#### Command Checklist:
```bash
git checkout main
git pull origin main
git checkout -b feat/my-new-feature
```

---

### 3. Conventional Commit Messages
All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

$$\text{Format}: \quad \mathbf{\text{type}}(\text{scope}): \text{short, imperative summary}$$

- **`feat`**: A new feature for the user or system.
- **`fix`**: A bug fix.
- **`refactor`**: Code changes that neither fix a bug nor add a feature.
- **`test`**: Adding missing tests or correcting existing tests.
- **`docs`**: Documentation only changes.
- **`chore`**: Maintenance, build configs, or dependency updates.

#### Examples:
- `feat(alerts): add Telegram bot notification dispatcher`
- `fix(edgar): resolve CIK lookup fallback timeout`
- `refactor(models): remove deprecated database fields`

---

### 4. Verification Before Branch Push
Before pushing your branch to GitHub, you MUST run local verification:
1. **Backend Tests**: `pytest backend/tests/ -v`
2. **Frontend Compilation**: `npm run build` (inside `frontend/`)
3. Ensure no secrets, `.env` files, or binary SQLite databases (`*.db`) are staged.

---

### 5. Pull Request & Merge Workflow
Once changes are verified and committed on your feature branch:

1. **Push Feature Branch**:
   ```bash
   git push -u origin <branch-name>
   ```

2. **Create Pull Request**:
   Use GitHub API/MCP or `gh pr create`:
   - Title: `feat(scope): Short summary of feature`
   - Description: Include rationale, changes made, and verification steps.

3. **Merge Pull Request**:
   - Merge PR into `main` using **Squash and Merge** (or `gh pr merge --squash`).
   - Delete remote feature branch after merging.
   - Pull updated `main` locally:
     ```bash
     git checkout main
     git pull origin main
     ```

---

### 6. Summary Checklist for Every Task
- [ ] Create branch from `main` (`git checkout -b <type>/<name>`)
- [ ] Make modular commits using Conventional Commits
- [ ] Run automated tests (`pytest`, `npm run build`)
- [ ] Push feature branch (`git push -u origin <type>/<name>`)
- [ ] Open Pull Request targeting `main`
- [ ] Merge PR & cleanup branch
