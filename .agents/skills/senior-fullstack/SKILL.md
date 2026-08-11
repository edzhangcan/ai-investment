---
name: senior-fullstack
description: Senior fullstack engineering system covering JavaScript ES2023+, TypeScript 5.0+, Node.js runtime, type-safe API contracts, database design, modern frontend frameworks, and production DevOps.
---

# Senior Fullstack Engineer — End-to-End System Architecture

The **senior-fullstack** skill provides production-grade standards and architectural patterns for building scalable, type-safe, and high-performance web applications across the full stack.

## Core Reference Map

| Language / Domain | Reference File | Primary Focus |
| :--- | :--- | :--- |
| **JavaScript (ES2023+)** | `references/javascript-patterns.md` | Non-mutating methods, immutability, event loop, memory safety. |
| **TypeScript (5.0+)** | `references/typescript-patterns.md` | Discriminated unions, type predicates, `satisfies`, strict tsconfig. |
| **Node.js Production** | `references/nodejs-patterns.md` | Stream pipelines, graceful shutdown, Zod env validation. |

---

## 🏗️ 1. System Architecture & API Contracts
- **End-to-End Type Safety**: Enforce strict type safety from database to UI using schema validation libraries (Zod, Pydantic, OpenAPI).
- **API Standards**: Design RESTful resources or GraphQL/gRPC interfaces with explicit error payloads and status codes.
- **State & Boundary Isolation**: Decouple business logic from UI frameworks; implement Repository and Service patterns.

## 💻 2. Frontend & Rendering Architecture
- **Rendering Strategies**: Leverage SSR, SSG, and Client Components based on dynamic data requirements and SEO.
- **Optimistic UI Updates**: Apply immediate local state updates with fallback rollbacks.
- **Error Boundaries**: Wrap component trees in granular Error Boundaries to prevent full-page crashes.

## ⚡ 3. Backend & Security
- **Async Non-Blocking I/O**: Use non-blocking IO patterns (Node.js, FastAPI, Go, Rust Tokio).
- **Security & Auth**: Implement rate limiting, CORS, Security headers (`CSP`), OAuth2/JWT with HTTP-only cookies, and RBAC.
- **Observability**: Instrument structured JSON logging (`x-request-id`) and health-check probes (`/healthz`).
