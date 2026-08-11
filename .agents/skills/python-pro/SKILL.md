---
name: python-pro
description: Professional Python engineering standards covering modern syntax (Python 3.11+), strict typing (Mypy/Pyright), async programming (asyncio), performance optimization, and pytest testing patterns.
---

# Python Pro — Advanced Python Engineering & Patterns

The **python-pro** skill provides modern Python 3.11+ architectural standards, type checking rules, async concurrency patterns, and testing practices.

---

## 🐍 1. Modern Python Syntax & Typing (3.11+)

### Strict Type Hinting & Dataclasses
- Always use standard collection types (`list[str]`, `dict[str, int]`) instead of legacy `typing.List`.
- Use `dataclasses` or `Pydantic v2` for type-safe data structures with validation:

```python
from dataclasses import dataclass, field
from typing import Self

@dataclass(frozen=True, slots=True)
class UserProfile:
    user_id: str
    email: str
    roles: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, str | list[str]]) -> Self:
        return cls(
            user_id=str(data["user_id"]),
            email=str(data["email"]),
            roles=list(data.get("roles", []))
        )
```

### Pattern Matching (`match / case`)
- Use structural pattern matching for complex conditional branching:
```python
match response:
    case {"status": 200, "data": dict() as payload}:
        process_payload(payload)
    case {"status": 404}:
        raise ResourceNotFoundError("Endpoint not found")
    case _:
        raise APIError("Unexpected payload format")
```

---

## ⚡ 2. Async Concurrency & Performance

- **`asyncio` Workflows**: Prefer `asyncio.TaskGroup()` (Python 3.11+) over `asyncio.gather()` for structured concurrency:
```python
import asyncio

async def fetch_all(urls: list[str]) -> list[str]:
    results = []
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_url(url)) for url in urls]
    return [task.result() for task in tasks]
```
- **Generators vs Lists**: Use generators (`yield`) for streaming large datasets to prevent RAM memory spikes.

---

## 🧪 3. Quality, Tooling & Testing

- **Linter & Formatter**: Use **Ruff** for high-speed linting/formatting and **Mypy** / **Pyright** for type verification.
- **Pytest Patterns**: Use fixtures with explicit typing and parameterized test cases:
```python
import pytest

@pytest.mark.parametrize("input_val,expected", [(1, 2), (5, 6), (10, 11)])
def test_increment(input_val: int, expected: int) -> None:
    assert increment(input_val) == expected
```
