# Backend modules

Each domain has a stable schema, route, controller, service, and repository boundary.
The route definitions currently reuse the unchanged procedure definitions from the
pre-modular router source. This keeps the public tRPC contract identical while the
business logic can be moved behind the controller/service/repository seams incrementally.
