# StockNest API: Smart Inventory and Sales Management (Server)

REST API for **StockNest**, the inventory and sales system of the NestMart retail chain. Built with Node.js, Express and MongoDB, secured with JWT, and organized in clean layers.

**Live API:** https://stocknest-server.vercel.app
**Client app:** https://stock-nestmart.vercel.app
**Client repository:** https://github.com/arafsarkar13/stocknest-client

> Course project for CSE 3391 Web Engineering (Fall 2026, Section D), BCSE program.
> Built by Md Araf Islam Sarkar.

## Key features

- **JWT authentication** with three roles (admin, manager, staff) and role-based route protection
- **Layered architecture:** Route → Controller → Service → Repository → Model
- **Master-detail documents:** purchase orders and sales, each saved with its line items in one MongoDB document
- **Safe stock handling:** atomic stock updates stop overselling, and receiving an order twice is blocked
- **MongoDB aggregation pipelines** for dashboard statistics
- **File handling:** product image upload (ImgBB), PDF invoice download, Excel export
- **Search, filtering and pagination** on products, orders and sales

## Tech stack

Node.js, Express, MongoDB Atlas with Mongoose, JSON Web Tokens, bcryptjs, Multer, PDFKit, ExcelJS, deployed on Vercel.

## Architecture

```
src/
├── routes/          URL definitions and role checks
├── controllers/     read the request, send the response
├── services/        business rules (validation, totals, stock logic)
├── repositories/    all database queries live here
├── models/          Mongoose schemas and indexes
├── middlewares/     auth, role authorization, error handling
├── utils/           helpers (errors, tokens, PDF builder)
├── config/          database connection
└── seed/            demo data scripts
```

## API endpoints

All routes start with `/api`. Protected routes need the header `Authorization: Bearer <token>`.

| Area            | Endpoint                                                                                        | Access                    |
| --------------- | ----------------------------------------------------------------------------------------------- | ------------------------- |
| Auth            | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`                                       | Public / logged in        |
| Users           | `GET /users`, `PATCH /users/:id/role`, `DELETE /users/:id`                                      | Admin                     |
| Categories      | `GET /categories` (all roles), `POST`, `PUT /:id`, `DELETE /:id`                                | Admin, Manager            |
| Suppliers       | `GET /suppliers`, `POST`, `PUT /:id`, `DELETE /:id`                                             | Admin, Manager            |
| Products        | `GET /products`, `GET /products/:id` (all roles)                                                | Logged in                 |
| Products        | `POST`, `PUT /:id`, `DELETE /:id`, `POST /products/import`                                      | Admin, Manager            |
| Uploads         | `POST /uploads/image` (max 2 MB)                                                                | Admin, Manager            |
| Purchase orders | `GET`, `POST`, `GET /:id`, `PUT /:id`, `PATCH /:id/receive`, `PATCH /:id/cancel`, `DELETE /:id` | Admin, Manager            |
| Stock history   | `GET /stock-movements`                                                                          | Admin, Manager            |
| Sales           | `GET /sales`, `POST /sales`, `GET /sales/:id`, `GET /sales/:id/invoice`                         | All (staff see own sales) |
| Sales           | `PATCH /sales/:id/cancel`                                                                       | Admin, Manager            |
| Reports         | `GET /reports/dashboard`, `/reports/export/products`, `/reports/export/sales`                   | Admin, Manager            |

## MongoDB usage

- **CRUD** on users, categories, suppliers, products, purchase orders, sales and stock movements
- **Aggregation pipelines** (`reportRepository.js`) use `$match`, `$group`, `$unwind`, `$lookup`, `$sort`, `$limit`, `$dateToString`, `$cond` and `$multiply` for revenue, profit, daily sales, top products, revenue by category and inventory value
- **Indexes:** unique email, SKU, invoice number and PO number; plus indexes on product name, category and price, sale date and status, sale item product, and stock movement date

## Environment variables

Create a `.env` file:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string
CLIENT_URL=http://localhost:3000
IMGBB_API_KEY=your_imgbb_api_key
```

`CLIENT_URL` must match the client's address exactly (no trailing slash).

## Run it locally

```bash
git clone https://github.com/arafsarkar13/stocknest-server.git
cd stocknest-server
npm install
npm run seed             # creates admin, manager and staff demo users
npm run seed:suppliers   # creates sample suppliers
npm run dev
```

Check http://localhost:5000/api/health. It should report the database as connected.

## Demo accounts

| Role    | Email                | Password    |
| ------- | -------------------- | ----------- |
| Admin   | admin@nestmart.com   | Admin@123   |
| Manager | manager@nestmart.com | Manager@123 |
| Staff   | staff@nestmart.com   | Staff@123   |

## Assignment requirements coverage

| Requirement                             | Where                                                    |
| --------------------------------------- | -------------------------------------------------------- |
| REST API with JWT and layered structure | `routes`, `controllers`, `services`, `repositories`      |
| Master-detail data                      | Purchase orders and sales                                |
| Insert, update, delete, read            | All modules                                              |
| Aggregation pipeline and summary data   | `reportRepository.js`, dashboard                         |
| Indexing                                | Model files                                              |
| Middleware                              | `authMiddleware.js`, `errorMiddleware.js`, Multer upload |
| Real product API in the client          | DummyJSON browse and import page                         |
| File upload and download                | Image upload, PDF invoice, Excel export                  |

## Deployment

Deployed on Vercel through `api/index.js` and `vercel.json`. Add all variables from the section above in the Vercel project settings and redeploy after any change.
