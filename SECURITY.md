# Security Policy

Please do not publish credentials, API keys, access tokens, private user information, or service-role keys in issues or pull requests.

For a security-sensitive issue, use the project's private security contact once one is configured.

## Required protections

- Row Level Security for Supabase tables
- least-privilege database permissions
- admin MFA
- server-only service-role credentials
- input validation
- upload MIME/type and size validation
- rate limiting on privileged endpoints
- dependency updates
- secret scanning
- audit logging
