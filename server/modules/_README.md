# Backend modules

Each domain owns its own folder with a stable five-file boundary:

```text
modules/<domain>/
├── schema.ts       # zod input schemas for the tRPC procedures
├── routes.ts       # tRPC router: procedures + middleware (admin/protected)
├── controller.ts   # request handling, authorization rules, error mapping
├── service.ts      # business logic / orchestration
└── repository.ts   # ALL database queries for this domain (Drizzle + getDb)
```

Rules of thumb:

- Query bodies live only in `repository.ts`; they import `getDb` and table
  schemas from `../../infrastructure/database`.
- `service.ts` and `controller.ts` import from `./repository`, never from
  another layer's internals.
- Cross-domain calls go through the other domain's `repository.ts`
  (e.g. `enrollments` → `course-paths` for `recalcPathProgressForUser`).
- The former monolithic `server/db.ts` and the
  `server/infrastructure/repositories.ts` compatibility barrel were removed;
  every domain repository now holds its own implementation.
