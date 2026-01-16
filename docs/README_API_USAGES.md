# API Usage Overview

This document explains how the backend APIs work during the initial setup, including **REST**, **GraphQL**, and **Socket.IO** endpoints.

## 1. REST APIs

**Health Check API**

Use this endpoint to verify that the REST server is running correctly.

```http
GET http://localhost:5000/api/v1/health
```

**Expected Response**

```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2026-01-01T05:00:04.523Z"
}
```

---

## 2. GraphQL APIs

All GraphQL requests are served through a **single endpoint**.

```http
POST http://localhost:5000/graphql
```

### 🔹 GraphQL Health Check

Use this query to verify that the GraphQL server is operational.

```json
{
  "query": "query { health }"
}
```

**Expected Response**

```json
{
  "data": {
    "health": "GraphQL server is healthy 🚀"
  }
}
```

---

### 🔹 Get Logged-in User Profile (`me` Query)

Returns the currently authenticated user’s basic profile details.

```json
{
  "query": "query { meTest { id username email firstName lastName bio } }"
}
```

**Expected Response**

```json
{
  "data": {
    "me": {
      "id": "7hjnfj",
      "username": "demo_user",
      "email": "demo@example.com",
      "firstName": "Demo",
      "lastName": "User",
      "bio": "This is a demo profile"
    }
  }
}
```

### 🔹 Update User Profile (Mutation)

Use this mutation to update the logged-in user’s profile information.

```json
{
  "query": "mutation UpdateProfile($input: UpdateProfileInputTest!) { updateProfileTest(input: $input) { id username email firstName lastName bio } }",
  "variables": {
    "input": {
      "firstName": "Chandan",
      "lastName": "Sahu",
      "bio": "Backend developer working with Node.js, GraphQL, and scalable systems."
    }
  }
}
```

**Expected Response**

```json
{
  "data": {
    "me": {
      "id": "7hjnfj",
      "username": "demo_user",
      "email": "demo@example.com",
      "firstName": "Chandan",
      "lastName": "Sahu",
      "bio": "Backend developer working with Node.js, GraphQL, and scalable systems."
    }
  }
}
```

**Notes**

* Only fields provided in `UpdateProfileInput` will be updated
* Missing fields remain unchanged
* Authentication is required

## 3. Socket.IO Server

### 🔹 Testing Socket Connection

To test the Socket.IO server locally:

1. Navigate to the following file:

   ```
   src/test/index.html
   ```
2. Open the file directly in a browser
3. The page will automatically attempt to connect to the Socket server

This file is intended for **local testing and debugging only**.

## Summary

* REST APIs are used for basic system-level operations
* GraphQL APIs handle authenticated user data and mutations
* Socket.IO enables real-time communication
* All services run on `http://localhost:5000`