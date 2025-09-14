# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an InstantDB-based project that should be built with Next.js, React, and Tailwind CSS. InstantDB is a modern real-time database that provides instant synchronization and collaborative features.

## Key Technologies

- **InstantDB**: Real-time database with client-side packages for React (`@instantdb/react`)
- **Next.js**: React framework for production
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

## Important InstantDB Guidelines

### Setup
- Check if a Next.js project exists before creating a new one
- Use the Instant MCP tools to create apps and manage schema
- Always read `instant-rules.md` before writing any InstantDB code

### Package Usage
- React apps: Use `@instantdb/react` only
- React Native: Use `@instantdb/react-native` only
- Backend/scripts: Use `@instantdb/admin` only (requires admin token from environment variables)
- Vanilla JS: Use `@instantdb/core` only

### Critical InstantDB Rules
- Admin tokens are SENSITIVE - always use environment variables, never hardcode
- Seed data MUST be created via admin SDK scripts, not on the client
- Follow React hooks rules - hooks cannot appear conditionally
- Pagination (`limit`, `offset`, etc.) only works on top-level namespaces, not nested relations

### Query Operators
InstantDB supports these `where` filters:
- Equality: `{ field: value }`
- Inequality: `{ field: { $ne: value } }`
- Null checks: `{ field: { $isNull: true/false } }`
- Comparison: `$gt`, `$lt`, `$gte`, `$lte` (indexed/typed fields only)
- Sets: `{ field: { $in: [v1, v2] } }`
- Substring: `{ field: { $like: 'pattern%' } }` (case-sensitive), `{ field: { $ilike: '%pattern%' } }` (case-insensitive)
- Logic: `and: [{...}, {...}]`, `or: [{...}, {...}]`
- Nested: `'relation.field': value`

Note: No `$exists`, `$nin`, or `$regex` operators. Use `$like`/`$ilike` for pattern matching.

## InstantDB Resources

Refer to the comprehensive example app in `instant-rules.md` for implementation patterns including:
- Database initialization (`lib/db.ts`)
- Schema definition (`instant.schema.ts`)
- Authentication with magic codes
- Data operations with `db.useQuery` and `db.transact`
- Ephemeral features (presence, topics)
- File uploads

For detailed documentation, fetch the relevant URLs listed in `instant-rules.md` documentation section.