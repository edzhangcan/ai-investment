# Advanced TypeScript (5.0+) System Patterns

Type-system patterns for building bulletproof, type-safe application logic in TypeScript.

## 🔷 1. Advanced Utility & Mapped Types

### Discriminated Unions & Type Predicates
Use explicit string literal tags for type-safe pattern matching:

```typescript
type NetworkState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: UserPayload }
  | { status: "error"; error: Error };

// Type predicate function
function isSuccessState(state: NetworkState): state is Extract<NetworkState, { status: "success" }> {
  return state.status === "success";
}
```

### The `satisfies` Operator & Template Literal Types
```typescript
type EventName = `on${Capitalize<string>}`;

const config = {
  onSuccess: (data: string) => console.log(data),
  onError: (err: Error) => console.error(err),
} satisfies Record<EventName, Function>;
```

---

## ⚙️ 2. Strict `tsconfig.json` Setup

Enforce strict safety flags to prevent silent runtime type bugs:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  }
}
```
