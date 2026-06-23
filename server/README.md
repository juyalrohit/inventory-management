# Inventory Management Server

Layered Express backend for inventory management.

## Stack
- Express
- MySQL
- JWT auth
- bcryptjs

## Structure
- `src/controllers` handles HTTP requests
- `src/services` contains business logic
- `src/repositories` talks to SQL
- `src/validators` validates request payloads
- `src/middleware` handles auth and errors

## Run
1. Install dependencies: `npm install`
2. Create the database and run `database/schema.sql`
3. Set `.env`
4. Start the server: `npm run dev`

## Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/stock/movements`
- `POST /api/stock/adjust`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `GET /api/dashboard/summary`

