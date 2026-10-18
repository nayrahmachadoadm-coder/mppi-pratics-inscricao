# Architecture rules

- Keep the anonymous Supabase client sessionless so public submissions do not share or overwrite the signed-in account's session.
- Store the optional registration account identifier as a plain UUID; registration tables must not depend on Supabase-managed authentication tables.
- Use dedicated display types for public finalist summaries instead of requiring private scoring fields absent from the public response.