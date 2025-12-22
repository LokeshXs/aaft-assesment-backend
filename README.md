## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/LokeshXs/aaft-assesment-backend.git
cd aaft-assesment-backend
```

### 2. Install dependencies

```bash
npm install

```

### 2. Setup environment variables

```bash
cp .env.example .env
```

### 3. Seed users to DB

```bash
npm run seed
```

### 4. Start the server

```bash
npm run dev
```

---

## 📦 Database Schema

### Users

```bash
id           SERIAL PRIMARY KEY
name         VARCHAR(100)
email        VARCHAR(150) UNIQUE
created_at  TIMESTAMP

```

### Leads

```bash
id           SERIAL PRIMARY KEY
name         VARCHAR(100)
email        VARCHAR(150)
phone        VARCHAR(20)
source       VARCHAR(50)
status       VARCHAR(20)
assigned_to  INTEGER (FK → users.id)
created_at  TIMESTAMP



```

### Lead Activities

```bash
id           SERIAL PRIMARY KEY
lead_id      INTEGER (FK → leads.id)
activity_type VARCHAR(50)
description  TEXT
timestamp   TIMESTAMP

```

---

## Assumptions Made

- Authentication and authorization are out of scope
- Status transitions are enforced in application logic, not DB
  -Pagination size is fixed at 10 items per page

---

## Known Limitations

- Duplicate detection fetches all leads
- No transactions for multi-step operations
- Indexing is not done
- Advanced DB queries not implemented(like GROUP BY, ORDER BY)
- Proper file structure is not good
- Error handling middleware is not done

---

## .env.example

```bash
POSTGRESQL_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```
