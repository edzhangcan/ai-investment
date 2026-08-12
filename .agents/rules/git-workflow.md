# Mandatory Git & GitHub Guardrail Rule

You MUST strictly adhere to the following version control and deployment rules for all code changes in this repository:

1. **NEVER Push Directly to `main`**:
   - `git push origin main` and `git push origin master` are strictly forbidden.
   - All code additions, bug fixes, and refactoring MUST be performed on a dedicated feature or fix branch (`feat/<name>`, `fix/<name>`, `refactor/<name>`).

2. **Pull Request Workflow**:
   - Push your feature branch to `origin` (`git push -u origin <branch-name>`).
   - Create a **GitHub Pull Request (PR)** targeting `main`.
   - Merge the PR into `main` (using squash merge) only after verification tests pass.

3. **Conventional Commits**:
   - Write commit messages adhering to Conventional Commits:
     - `feat(scope): ...`
     - `fix(scope): ...`
     - `refactor(scope): ...`
     - `test(scope): ...`
     - `chore(scope): ...`

4. **Pre-Commit Local Verification**:
   - Always run `pytest backend/tests/ -v` and `npm run build` inside `frontend/` before pushing or opening a Pull Request.
