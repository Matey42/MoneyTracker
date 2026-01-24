# MoneyTracker - Personal Finance Management

A personal finance management application for tracking wallets, transactions, and categories.

## 🚦 Quick Start

### Docker (development)

```bash
# Dev stack (auto-includes docker-compose.override.yml)
docker compose up -d --build
```

### Docker (production-like)

```bash
# Base compose only (prod-like)
docker compose -f docker-compose.yml up --build
```

### Local backend + Docker Postgres

```bash
# Start Postgres only (option A)
docker compose up postgres

# Start Postgres only (option B, use 5433 to avoid conflicts)
docker run --name moneytracker-db \
  -e POSTGRES_DB=moneytracker \
  -e POSTGRES_USER=moneytracker \
  -e POSTGRES_PASSWORD=localdev123 \
  -p 5433:5432 \
  -d postgres:16-alpine

# Run backend (CLI)
cd backend
./mvnw spring-boot:run
```

If you use the 5433 mapping above, set:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/moneytracker
SPRING_DATASOURCE_USERNAME=moneytracker
SPRING_DATASOURCE_PASSWORD=localdev123
```

You can also run the backend from IntelliJ using the Spring Boot run configuration.

### Local frontend

```bash
cd web
npm install
npm run dev
```

See `web/.env.example` for API mode switches (mock/api/hybrid).

## 🎯 Project Overview

MoneyTracker is a modern full-stack web app designed to help users track finances with a clear dashboard, wallet categories, and transaction history.

## 🚀 Current Phase: MVP (Budgeting Core)

### Features

#### Transaction Management
- Record income and expenses
- Track transactions per wallet
- Date filtering and balance summaries

#### Categories & Organization
- System categories (income/expense)
- Custom categories
- Category-based breakdowns

#### Wallets
- Wallet groups by category
- Favorites and ordering
- Category-specific wallet views

#### Dashboard
- Summary metrics
- Net worth history
- Recent activity

## 🛠️ Tech Stack

### Backend
- **Framework**: Java 25 + Spring Boot 4.0.1
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **Migrations**: Flyway
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: MUI 7
- **Router**: React Router 7
- **HTTP Client**: Axios
- **Build Tool**: Vite (rolldown-vite)

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Testing**: JUnit 5, Mockito, React Testing Library

## 📁 Project Structure

```
MoneyTracker/
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/moneytracker/
│   │   │   │       ├── config/         # Configuration classes
│   │   │   │       ├── controller/     # REST controllers
│   │   │   │       ├── dto/            # Data Transfer Objects
│   │   │   │       ├── entity/         # JPA entities
│   │   │   │       ├── exception/      # Custom exceptions
│   │   │   │       ├── mapper/         # Entity-DTO mappers
│   │   │   │       ├── repository/     # Data repositories
│   │   │   │       ├── security/       # Security configuration
│   │   │   │       └── service/        # Business logic
│   │   │   └── resources/
│   │   │       ├── db/migration/       # Flyway migrations
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
├── web/                        # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature-based modules
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── api/                # API services
│   │   ├── store/              # Redux store configuration
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── package.json
│   │   └── vite.config.ts
├── Documents/                  # Project documentation
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md
```

## 📊 API Endpoints (MVP)

Base paths below are without a global `/api` prefix.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user (token) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Current user profile |
| PUT | `/users/me` | Update current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard summary |
| GET | `/dashboard/net-worth-history` | Net worth history by period |

### Wallets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallets` | List wallets |
| GET | `/wallets/favorites` | Favorite wallets |
| GET | `/wallets/{walletId}` | Wallet by ID |
| POST | `/wallets` | Create wallet |
| PUT | `/wallets/{walletId}` | Update wallet |
| DELETE | `/wallets/{walletId}` | Delete wallet |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List all transactions |
| POST | `/transactions` | Create transaction |
| DELETE | `/transactions/{transactionId}` | Delete transaction |
| GET | `/wallets/{walletId}/transactions` | Wallet transactions |
| GET | `/wallets/{walletId}/transactions/range` | Wallet transactions by date range |
| GET | `/wallets/{walletId}/transactions/balance` | Wallet balance |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/{categoryId}` | Category by ID |
| GET | `/categories/income` | Income categories |
| GET | `/categories/expense` | Expense categories |
| GET | `/categories/system` | System categories |
| POST | `/categories` | Create category |
| PUT | `/categories/{categoryId}` | Update category |
| DELETE | `/categories/{categoryId}` | Delete category |

## 🧪 Running Tests

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd web
npm run test
```

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

MoneyTracker Team
