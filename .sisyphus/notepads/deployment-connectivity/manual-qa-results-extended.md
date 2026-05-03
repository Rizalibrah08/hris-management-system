# Manual QA Extended Results - Deployment Connectivity (Supplemental)

Date: 2026-05-03
Tester: Sisyphus-Junior (Automated supplemental QA)

Summary:
- API 404 handling exists in code and returns JSON payload when the /api path is not found.
- Android manifest includes usesCleartextTraffic set to true, enabling HTTP traffic.
- In this environment, live HTTP curl requests to http://localhost:5000/api/nonexistent timed out, preventing in-environment verification of the 404 payload. Other health/root endpoints could not be fully exercised due to networking limitations.

What to verify in CI/local (recommended):
- docker compose up -d
- curl -s -i http://localhost:5000/api/nonexistent should return 404 with body: {"message":"Endpoint not found","path":"/nonexistent"}
- curl http://localhost:5000/health should return {"status":"ok"}
- Android manifest contains usesCleartextTraffic="true" on the application tag
- docker compose down

Notes:
- The code-level changes are in place; the manifest flag is present. The environment here is restrictive for live HTTP requests; CI or a local dev environment with proper network access is best for end-to-end verification.
