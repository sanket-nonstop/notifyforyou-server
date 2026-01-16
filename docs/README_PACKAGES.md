## 1. Project Setup (Node.js + Git)

### a) Initialize Node.js project

Creates a default `package.json` file for managing dependencies and scripts.

```bash
npm init -y
```

### b) Initialize Git

Starts Git version control in your project folder.

```bash
git init
```


## 2. Install Core Backend Packages

### a) Express + Basic Middleware

These packages help you build APIs, handle requests securely, and improve performance/logging.

```bash
npm install express dotenv cors body-parser cookie-parser helmet compression morgan
```

**What each package does (short):**

* **express** → main backend framework
* **dotenv** → loads environment variables from `.env`
* **cors** → allows frontend to access backend (cross-origin)
* **body-parser** → parses incoming request body (JSON/form-data)
* **cookie-parser** → reads cookies from request headers
* **helmet** → adds security headers
* **compression** → compresses response for better speed
* **morgan** → logs HTTP requests in console


### b) Authentication + Validation + Database

Used for login system, password encryption, and MongoDB storage.

```bash
npm install jsonwebtoken bcryptjs mongoose zod
```

**What each package does (short):**

* **jsonwebtoken (JWT)** → creates access tokens for authentication
* **bcryptjs** → hashes passwords securely
* **mongoose** → connects & works with MongoDB
* **zod** → validates request input (email, password, etc.)


### c) Email / Notifications

Used for sending OTP, reset password links, alerts, etc.

```bash
npm install nodemailer
```

* **nodemailer** → sends emails using SMTP (Gmail, Outlook, etc.)


### d) GraphQL + Apollo Server

Used to build GraphQL API with schema + resolvers.

```bash
npm install graphql @apollo/server @as-integrations/express5 @graphql-tools/load @graphql-tools/graphql-file-loader
```

**Short explanation:**

* **graphql** → GraphQL core library
* **@apollo/server** → Apollo GraphQL server
* **@as-integrations/express5** → connects Apollo with Express
* **@graphql-tools/load** → loads schema files easily
* **graphql-file-loader** → loads `.graphql` schema files


### e) Redis + Socket + Logging

Used for caching, session storage, real-time updates, and clean logging.

```bash
npm install ioredis socket.io pino
```

**Short explanation:**

* **ioredis** → Redis client (sessions, OTP, caching)
* **socket.io** → real-time communication (chat/notifications)
* **pino** → fast and clean logger (production friendly)


### f) SMS + Rate Limiting

Used for SMS OTP and protecting APIs from spam/abuse.

```bash
npm install twilio express-rate-limit
```

**Short explanation:**

* **twilio** → send OTP via SMS
* **express-rate-limit** → blocks repeated requests (prevents brute-force)


## 3. TypeScript Setup

### a) Install TypeScript core packages

Adds TypeScript compiler + runtime support.

```bash
npm install --save-dev typescript ts-node @types/node tsconfig-paths tsc-alias
```

**Short explanation:**

* **typescript** → TypeScript compiler
* **ts-node** → run TypeScript directly (no build needed in dev)
* **@types/node** → Node.js type definitions
* **tsconfig-paths** → supports path aliases like `@/utils`
* **tsc-alias** → fixes path aliases after build


### b) Generate `tsconfig.json`

Creates TypeScript config file.

```bash
npx tsc --init
```

✅ After this, update `tsconfig.json` based on your project needs.


### c) Verify TypeScript setup

Checks for TypeScript errors without generating build output.

```bash
npx tsc --noEmit
```


## 4. Install Dev Type Packages

### a) Install Nodemon + Type Definitions

Used for auto-restart in development and TypeScript support for libraries.

```bash
npm install --save-dev nodemon
npm install --save-dev @types/express @types/cors @types/morgan @types/jsonwebtoken @types/nodemailer
```

**Short explanation:**

* **nodemon** → restarts server automatically when files change
* **@types/** → gives TypeScript intellisense + type checking for libraries
