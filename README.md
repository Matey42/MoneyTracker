# MoneyTracker - Personal Finance Management

A comprehensive personal finance management application for tracking income, expenses, liabilities, and cash flow.

## 🎯 Project Overview

MoneyTracker is a modern, full-stack web application designed to help users take control of their personal finances. The application provides intuitive tools for recording financial transactions, categorizing expenses, and visualizing spending patterns.

## 🚀 Current Phase: MVP (Budgeting Core)

### Features

#### Transaction Management
- **Income Tracking**: Record salary, freelance income, investments returns, and other income sources
- **Expense Tracking**: Log daily expenses with categories, dates, and descriptions
- **Liability Management**: Track debts, loans, and recurring payments

#### Categories & Organization
- Pre-defined expense categories (Food, Transport, Housing, Entertainment, etc.)
- Custom category creation
- Transaction tagging for flexible organization

#### Cash Flow Analytics
- Monthly income vs. expense summaries
- Category-wise spending breakdown
- Net worth calculation (Assets - Liabilities)
- Trend analysis over time periods

#### Dashboard
- Real-time financial overview
- Recent transactions list
- Budget progress indicators
- Key financial metrics at a glance

## 🛠️ Tech Stack

### Backend
- **Framework**: Java 21 + Spring Boot 3.x
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI (MUI)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Build Tool**: Vite

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Database Migration**: Flyway
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
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature-based modules
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── store/              # Redux store configuration
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── Documents/                  # Project documentation
├── docker-compose.yml
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Backend Setup

```bash
cd backend

# Configure database in application.yml
# Run the application
./mvnw spring-boot:run
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Using Docker

```bash
# Start all services
docker-compose up -d
```

## 📊 API Endpoints (MVP)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List all transactions |
| GET | `/api/transactions/{id}` | Get transaction by ID |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create custom category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Financial summary |
| GET | `/api/analytics/cashflow` | Cash flow report |
| GET | `/api/analytics/categories` | Category breakdown |

## 🧪 Running Tests

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
npm run test
```

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

MoneyTracker Team