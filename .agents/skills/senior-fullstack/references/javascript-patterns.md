# Modern JavaScript (ES2023+) Patterns

Modern JavaScript standards, performance rules, and memory safety practices across browser and Node.js environments.

## 🟨 1. Modern ES2023+ Features & Immutability

### Non-Mutating Array Methods (`toSorted`, `with`, `toSpliced`)
Avoid mutating original arrays in state management:
```javascript
const numbers = [3, 1, 4, 1, 5];

// Non-mutating sort
const sorted = numbers.toSorted((a, b) => a - b); // [1, 1, 3, 4, 5]

// Non-mutating index update
const updated = numbers.with(2, 99); // [3, 1, 99, 1, 5]
```

### Dynamic Object Grouping (`Object.groupBy`)
```javascript
const inventory = [
  { name: "Apples", type: "fruit" },
  { name: "Carrots", type: "vegetable" },
  { name: "Bananas", type: "fruit" }
];

const grouped = Object.groupBy(inventory, item => item.type);
// { fruit: [...], vegetable: [...] }
```

---

## ⚡ 2. Event Loop & Memory Safety

- **Microtasks vs Macrotasks**: `Promise.then` and `queueMicrotask` run before the next event loop tick (`setTimeout`, `setImmediate`).
- **Memory Leak Cleanup**: Always clean up event listeners (`removeEventListener`) and use `WeakMap` / `WeakSet` for object metadata caches so garbage collection can reclaim memory.
