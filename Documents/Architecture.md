# MoneyTracker - System Architecture

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Principles](#architecture-principles)
4. [Technology Stack](#technology-stack)
5. [Phase I: MVP Architecture](#phase-i-mvp-architecture)
6. [Phase II: Investment Module Architecture](#phase-ii-investment-module-architecture)
7. [Data Architecture](#data-architecture)
8. [API Design](#api-design)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Future Considerations](#future-considerations)

---

## Executive Summary

MoneyTracker is a comprehensive personal finance management platform designed with a modular, scalable architecture. The system is built in two phases:

- **Phase I (MVP)**: Core budgeting functionality including income/expense tracking, liability management, and cash flow analytics
- **Phase II (Expansion)**: Investment portfolio tracking with external API integrations for stocks, forex, crypto, and real estate

The architecture follows clean architecture principles, ensuring high maintainability, testability, and extensibility.

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     React SPA (TypeScript)                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │Dashboard │ │Transact- │ │Analytics │ │Investment│ │ Settings │  │   │
│  │  │  Module  │ │  ions    │ │  Module  │ │  Module  │ │  Module  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │                    ↓ Redux Toolkit + RTK Query ↓                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS/REST
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                         (Spring Cloud Gateway)                               │
│              Rate Limiting │ Authentication │ Load Balancing                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                                   │
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│  │   Core Service     │  │  Analytics Service │  │ Investment Service │    │
│  │   (Spring Boot)    │  │   (Spring Boot)    │  │   (Spring Boot)    │    │
│  │                    │  │                    │  │                    │    │
│  │ • User Management  │  │ • Report Generation│  │ • Portfolio Mgmt   │    │
│  │ • Transactions     │  │ • Cash Flow Calc   │  │ • Asset Tracking   │    │
│  │ • Categories       │  │ • Trend Analysis   │  │ • API Integration  │    │
│  │ • Liabilities      │  │ • Budget Analysis  │  │ • Price Updates    │    │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘    │
│            │                       │                       │                │
└────────────┼───────────────────────┼───────────────────────┼────────────────┘
             │                       │                       │
             ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│                                                                              │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│  │    PostgreSQL      │  │      Redis         │  │    Time Series     │    │
│  │  (Primary Store)   │  │  (Cache/Session)   │  │  (InfluxDB/TimescaleDB) │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Alpha   │ │  Yahoo   │ │  Coin    │ │  Forex   │ │  Real Estate     │  │
│  │ Vantage  │ │ Finance  │ │  Gecko   │ │   API    │ │     APIs         │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Clean Architecture
```
┌─────────────────────────────────────────────┐
│              Presentation Layer             │
│         (Controllers, DTOs, Mappers)        │
├─────────────────────────────────────────────┤
│              Application Layer              │
│          (Use Cases, Services)              │
├─────────────────────────────────────────────┤
│               Domain Layer                  │
│       (Entities, Business Rules)            │
├─────────────────────────────────────────────┤
│            Infrastructure Layer             │
│    (Repositories, External Services)        │
└─────────────────────────────────────────────┘
```

### 2. Design Principles
- **SOLID Principles**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY (Don't Repeat Yourself)**: Reusable components and utilities
- **KISS (Keep It Simple, Stupid)**: Simple, readable code over clever solutions
- **YAGNI (You Aren't Gonna Need It)**: Build only what's needed now

### 3. Architectural Patterns
- **Repository Pattern**: Abstract data access layer
- **Service Layer Pattern**: Business logic encapsulation
- **DTO Pattern**: Data transfer between layers
- **Factory Pattern**: Object creation abstraction
- **Strategy Pattern**: Interchangeable algorithms (e.g., different API providers)

---

## Technology Stack

### Backend Technologies

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| Runtime | Java | 21 LTS | Latest LTS, virtual threads, pattern matching |
| Framework | Spring Boot | 3.2.x | Industry standard, extensive ecosystem |
| Security | Spring Security | 6.x | Robust authentication/authorization |
| Data Access | Spring Data JPA | 3.x | Simplified data access layer |
| Database | PostgreSQL | 16.x | Reliable, feature-rich RDBMS |
| Cache | Redis | 7.x | High-performance caching |
| Time Series | TimescaleDB | 2.x | PostgreSQL extension for time-series data |
| Migration | Flyway | 9.x | Database version control |
| API Docs | SpringDoc OpenAPI | 2.x | Interactive API documentation |
| Build | Maven | 3.9.x | Dependency management |

### Frontend Technologies

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| Framework | React | 18.x | Component-based, large ecosystem |
| Language | TypeScript | 5.x | Type safety, better DX |
| State Mgmt | Redux Toolkit | 2.x | Predictable state container |
| Data Fetching | RTK Query | 2.x | Powerful data fetching/caching |
| UI Library | Material-UI | 5.x | Professional components, theming |
| Charts | Recharts | 2.x | React-native charting library |
| Forms | React Hook Form | 7.x | Performant form handling |
| Validation | Zod | 3.x | TypeScript-first schema validation |
| HTTP | Axios | 1.x | HTTP client with interceptors |
| Routing | React Router | 6.x | Client-side routing |
| Build | Vite | 5.x | Fast development/build tool |
| Testing | Vitest + RTL | Latest | Modern testing stack |

### DevOps & Infrastructure

| Component | Technology | Justification |
|-----------|------------|---------------|
| Containerization | Docker | Standard containerization |
| Orchestration | Docker Compose | Local development |
| CI/CD | GitHub Actions | Integrated with repository |
| Monitoring | Prometheus + Grafana | Metrics and visualization |
| Logging | ELK Stack | Centralized logging |
| Cloud | AWS / Azure | Scalable cloud infrastructure |

---

## Phase I: MVP Architecture

### Component Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                             │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Dashboard  │  │Transactions │  │  Analytics  │  │  Settings   │ │
│  │    Page     │  │    Page     │  │    Page     │  │    Page     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │         │
│         └────────────────┴────────────────┴────────────────┘         │
│                                 │                                     │
│                     ┌───────────┴───────────┐                        │
│                     │    Redux Store        │                        │
│                     │  ┌─────────────────┐  │                        │
│                     │  │   RTK Query     │  │                        │
│                     │  │   API Slices    │  │                        │
│                     │  └─────────────────┘  │                        │
│                     └───────────────────────┘                        │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ REST API (JSON)
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot)                             │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      Controller Layer                            │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │ │
│  │  │    Auth    │ │Transaction │ │  Category  │ │  Analytics │   │ │
│  │  │ Controller │ │ Controller │ │ Controller │ │ Controller │   │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                 │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                       Service Layer                              │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │ │
│  │  │    User    │ │Transaction │ │  Category  │ │  Analytics │   │ │
│  │  │  Service   │ │  Service   │ │  Service   │ │  Service   │   │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                 │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     Repository Layer                             │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │ │
│  │  │    User    │ │Transaction │ │  Category  │ │  Liability │   │ │
│  │  │ Repository │ │ Repository │ │ Repository │ │ Repository │   │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │   users    │ │transactions│ │ categories │ │ liabilities│        │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
└──────────────────────────────────────────────────────────────────────┘
```

### Backend Package Structure

```
com.moneytracker/
├── MoneyTrackerApplication.java
│
├── config/
│   ├── SecurityConfig.java
│   ├── WebConfig.java
│   ├── CacheConfig.java
│   └── OpenApiConfig.java
│
├── controller/
│   ├── AuthController.java
│   ├── TransactionController.java
│   ├── CategoryController.java
│   ├── LiabilityController.java
│   └── AnalyticsController.java
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── TransactionRequest.java
│   │   └── CategoryRequest.java
│   └── response/
│       ├── ApiResponse.java
│       ├── AuthResponse.java
│       ├── TransactionResponse.java
│       ├── CategoryResponse.java
│       └── AnalyticsSummaryResponse.java
│
├── entity/
│   ├── User.java
│   ├── Transaction.java
│   ├── Category.java
│   ├── Liability.java
│   └── enums/
│       ├── TransactionType.java
│       └── LiabilityStatus.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   └── UnauthorizedException.java
│
├── mapper/
│   ├── TransactionMapper.java
│   ├── CategoryMapper.java
│   └── UserMapper.java
│
├── repository/
│   ├── UserRepository.java
│   ├── TransactionRepository.java
│   ├── CategoryRepository.java
│   └── LiabilityRepository.java
│
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── SecurityUtils.java
│
└── service/
    ├── AuthService.java
    ├── UserService.java
    ├── TransactionService.java
    ├── CategoryService.java
    ├── LiabilityService.java
    └── AnalyticsService.java
```

### Frontend Structure

```
src/
├── main.tsx
├── App.tsx
│
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── Loading/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   └── charts/
│       ├── PieChart/
│       ├── BarChart/
│       ├── LineChart/
│       └── AreaChart/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── authSlice.ts
│   ├── transactions/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── transactionsSlice.ts
│   ├── categories/
│   │   ├── components/
│   │   └── categoriesSlice.ts
│   ├── analytics/
│   │   ├── components/
│   │   └── analyticsSlice.ts
│   └── dashboard/
│       └── components/
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Analytics.tsx
│   ├── Categories.tsx
│   ├── Liabilities.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   └── Register.tsx
│
├── services/
│   └── api.ts
│
├── store/
│   ├── index.ts
│   └── apiSlice.ts
│
├── types/
│   ├── transaction.ts
│   ├── category.ts
│   ├── user.ts
│   └── analytics.ts
│
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
│
└── styles/
    ├── theme.ts
    └── global.css
```

---

## Phase II: Investment Module Architecture

### Investment Module Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INVESTMENT MODULE FRONTEND                               │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Portfolio  │  │   Assets    │  │   Market    │  │   Reports   │        │
│  │  Dashboard  │  │  Manager    │  │   Watch     │  │  Generator  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Stocks    │  │   Forex     │  │   Crypto    │  │ Real Estate │        │
│  │   Widget    │  │   Widget    │  │   Widget    │  │   Widget    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INVESTMENT SERVICE (Spring Boot)                         │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Controller Layer                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │Portfolio │ │  Stock   │ │  Forex   │ │  Crypto  │ │  Real    │   │  │
│  │  │Controller│ │Controller│ │Controller│ │Controller│ │ Estate   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          Service Layer                                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Portfolio   │  │    Asset     │  │   Valuation  │                │  │
│  │  │   Service    │  │   Service    │  │   Service    │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐    │  │
│  │  │              External API Integration Layer                    │    │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │    │  │
│  │  │  │ Stock   │ │  Forex  │ │ Crypto  │ │Commodity│ │  Real   │ │    │  │
│  │  │  │Provider │ │Provider │ │Provider │ │Provider │ │ Estate  │ │    │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │    │  │
│  │  └──────────────────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │   PostgreSQL    │ │   TimescaleDB   │ │      Redis      │
          │   (Holdings)    │ │ (Price History) │ │  (Price Cache)  │
          └─────────────────┘ └─────────────────┘ └─────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │  Alpha Vantage  │ │    CoinGecko    │ │  Exchange Rate  │
          │  Yahoo Finance  │ │    Binance      │ │      API        │
          └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Investment Module Package Structure

```
com.moneytracker.investment/
├── InvestmentModuleApplication.java
│
├── config/
│   ├── ExternalApiConfig.java
│   ├── CacheConfig.java
│   └── SchedulingConfig.java
│
├── controller/
│   ├── PortfolioController.java
│   ├── StockController.java
│   ├── ForexController.java
│   ├── CryptoController.java
│   ├── CommodityController.java
│   └── RealEstateController.java
│
├── dto/
│   ├── request/
│   │   ├── AddHoldingRequest.java
│   │   ├── SellHoldingRequest.java
│   │   └── WatchlistRequest.java
│   └── response/
│       ├── PortfolioSummaryResponse.java
│       ├── AssetPriceResponse.java
│       ├── PerformanceResponse.java
│       └── MarketDataResponse.java
│
├── entity/
│   ├── Portfolio.java
│   ├── Holding.java
│   ├── Transaction.java
│   ├── PriceHistory.java
│   └── Watchlist.java
│
├── integration/
│   ├── provider/
│   │   ├── MarketDataProvider.java (interface)
│   │   ├── AlphaVantageProvider.java
│   │   ├── YahooFinanceProvider.java
│   │   ├── CoinGeckoProvider.java
│   │   ├── BinanceProvider.java
│   │   └── ExchangeRateProvider.java
│   └── client/
│       ├── RestClientConfig.java
│       └── WebClientConfig.java
│
├── scheduler/
│   ├── PriceUpdateScheduler.java
│   └── PortfolioValuationScheduler.java
│
├── repository/
│   ├── PortfolioRepository.java
│   ├── HoldingRepository.java
│   └── PriceHistoryRepository.java
│
└── service/
    ├── PortfolioService.java
    ├── AssetService.java
    ├── ValuationService.java
    ├── MarketDataService.java
    └── ReportingService.java
```

### External API Integration Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MARKET DATA PROVIDER STRATEGY                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  MarketDataProvider (Interface)                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  + getQuote(symbol: String): Quote                            │  │   │
│  │  │  + getHistoricalPrices(symbol: String, range: DateRange): List│  │   │
│  │  │  + searchSymbol(query: String): List<Symbol>                  │  │   │
│  │  │  + getSupportedAssetTypes(): List<AssetType>                  │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    △                                        │
│                                    │ implements                             │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│  ┌──────┴──────┐           ┌───────┴───────┐          ┌───────┴───────┐   │
│  │AlphaVantage │           │  CoinGecko    │          │ YahooFinance  │   │
│  │  Provider   │           │   Provider    │          │   Provider    │   │
│  │             │           │               │          │               │   │
│  │ • Stocks    │           │ • Crypto      │          │ • Stocks      │   │
│  │ • ETFs      │           │ • DeFi Tokens │          │ • ETFs        │   │
│  │ • Forex     │           │               │          │ • Indices     │   │
│  └─────────────┘           └───────────────┘          └───────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Asset Types Support

| Asset Type | Primary API | Backup API | Update Frequency |
|------------|-------------|------------|------------------|
| Stocks/ETFs | Alpha Vantage | Yahoo Finance | Real-time (delayed 15min) |
| Forex | Alpha Vantage | Exchange Rate API | Real-time |
| Cryptocurrencies | CoinGecko | Binance | Real-time |
| Commodities (Gold) | Alpha Vantage | Yahoo Finance | 15 minutes |
| Real Estate | Manual Entry | Zillow API (future) | Daily |

---

## Data Architecture

### Entity Relationship Diagram (Complete)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE I: CORE ENTITIES                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────┐         ┌───────────────────┐
    │       USER        │         │     CATEGORY      │
    ├───────────────────┤         ├───────────────────┤
    │ id (PK)           │         │ id (PK)           │
    │ email             │◄───┐    │ user_id (FK)      │
    │ password_hash     │    │    │ name              │
    │ first_name        │    │    │ type (INCOME/     │
    │ last_name         │    │    │       EXPENSE)    │
    │ created_at        │    │    │ icon              │
    │ updated_at        │    │    │ color             │
    │ is_active         │    │    │ is_default        │
    └───────────────────┘    │    │ created_at        │
             │               │    └───────────────────┘
             │               │              │
             │               │              │
             ▼               │              ▼
    ┌───────────────────┐    │    ┌───────────────────┐
    │   TRANSACTION     │    │    │    LIABILITY      │
    ├───────────────────┤    │    ├───────────────────┤
    │ id (PK)           │    │    │ id (PK)           │
    │ user_id (FK)      │────┘    │ user_id (FK)      │────┐
    │ category_id (FK)  │─────────│ name              │    │
    │ type (INCOME/     │         │ principal_amount  │    │
    │       EXPENSE)    │         │ current_balance   │    │
    │ amount            │         │ interest_rate     │    │
    │ description       │         │ start_date        │    │
    │ transaction_date  │         │ end_date          │    │
    │ created_at        │         │ monthly_payment   │    │
    │ updated_at        │         │ status            │    │
    │ tags              │         │ created_at        │    │
    └───────────────────┘         └───────────────────┘    │
                                           │               │
                                           ▼               │
                                  ┌───────────────────┐    │
                                  │LIABILITY_PAYMENT  │    │
                                  ├───────────────────┤    │
                                  │ id (PK)           │    │
                                  │ liability_id (FK) │────┘
                                  │ amount            │
                                  │ payment_date      │
                                  │ principal_portion │
                                  │ interest_portion  │
                                  └───────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE II: INVESTMENT ENTITIES                         │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────┐         ┌───────────────────┐
    │     PORTFOLIO     │         │      ASSET        │
    ├───────────────────┤         ├───────────────────┤
    │ id (PK)           │         │ id (PK)           │
    │ user_id (FK)      │         │ symbol            │
    │ name              │         │ name              │
    │ description       │         │ asset_type        │
    │ is_default        │         │ exchange          │
    │ created_at        │         │ currency          │
    └───────────────────┘         │ last_price        │
             │                    │ last_updated      │
             │                    └───────────────────┘
             ▼                             │
    ┌───────────────────┐                  │
    │     HOLDING       │                  │
    ├───────────────────┤                  │
    │ id (PK)           │                  │
    │ portfolio_id (FK) │                  │
    │ asset_id (FK)     │──────────────────┘
    │ quantity          │
    │ average_cost      │
    │ current_value     │
    │ unrealized_pnl    │
    │ created_at        │
    └───────────────────┘
             │
             ▼
    ┌───────────────────┐         ┌───────────────────┐
    │INVESTMENT_TRANSACT│         │   PRICE_HISTORY   │
    ├───────────────────┤         ├───────────────────┤
    │ id (PK)           │         │ id (PK)           │
    │ holding_id (FK)   │         │ asset_id (FK)     │
    │ type (BUY/SELL/   │         │ timestamp         │
    │       DIVIDEND)   │         │ open              │
    │ quantity          │         │ high              │
    │ price             │         │ low               │
    │ fees              │         │ close             │
    │ transaction_date  │         │ volume            │
    │ notes             │         └───────────────────┘
    └───────────────────┘
```

### Database Schema (Phase I)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name, type)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags VARCHAR(255)[]
);

-- Liabilities table
CREATE TABLE liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 4),
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_payment DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID_OFF', 'DEFAULTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Liability payments table
CREATE TABLE liability_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liability_id UUID NOT NULL REFERENCES liabilities(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    principal_portion DECIMAL(15, 2),
    interest_portion DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);
```

### Database Schema (Phase II - Investment)

```sql
-- Assets master table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('STOCK', 'ETF', 'CRYPTO', 'FOREX', 'COMMODITY', 'REAL_ESTATE')),
    exchange VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    last_price DECIMAL(20, 8),
    last_updated TIMESTAMP WITH TIME ZONE,
    UNIQUE(symbol, asset_type)
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Holdings table
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id),
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost DECIMAL(20, 8) NOT NULL,
    current_value DECIMAL(20, 2),
    unrealized_pnl DECIMAL(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, asset_id)
);

-- Investment transactions table
CREATE TABLE investment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BUY', 'SELL', 'DIVIDEND', 'SPLIT')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    fees DECIMAL(15, 2) DEFAULT 0,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Price history (TimescaleDB hypertable)
CREATE TABLE price_history (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_id UUID NOT NULL REFERENCES assets(id),
    open DECIMAL(20, 8),
    high DECIMAL(20, 8),
    low DECIMAL(20, 8),
    close DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(30, 8)
);

-- Convert to TimescaleDB hypertable for efficient time-series queries
SELECT create_hypertable('price_history', 'time');

-- Indexes
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_investment_trans_holding ON investment_transactions(holding_id);
CREATE INDEX idx_price_history_asset ON price_history(asset_id, time DESC);
```

---

## API Design

### RESTful API Conventions

| Method | URI Pattern | Description |
|--------|-------------|-------------|
| GET | `/api/v1/{resources}` | List all resources |
| GET | `/api/v1/{resources}/{id}` | Get single resource |
| POST | `/api/v1/{resources}` | Create new resource |
| PUT | `/api/v1/{resources}/{id}` | Full update |
| PATCH | `/api/v1/{resources}/{id}` | Partial update |
| DELETE | `/api/v1/{resources}/{id}` | Delete resource |

### API Response Format

```json
{
  "success": true,
  "data": { },
  "message": "Operation successful",
  "timestamp": "2025-11-27T10:30:00Z",
  "pagination": {
    "page": 1,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  },
  "timestamp": "2025-11-27T10:30:00Z"
}
```

### Phase I API Endpoints

#### Authentication
```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - User login
POST   /api/v1/auth/refresh           - Refresh access token
POST   /api/v1/auth/logout            - User logout
POST   /api/v1/auth/forgot-password   - Request password reset
POST   /api/v1/auth/reset-password    - Reset password
```

#### User Management
```
GET    /api/v1/users/me               - Get current user profile
PUT    /api/v1/users/me               - Update user profile
PATCH  /api/v1/users/me/password      - Change password
DELETE /api/v1/users/me               - Delete account
```

#### Transactions
```
GET    /api/v1/transactions           - List transactions (paginated, filtered)
GET    /api/v1/transactions/{id}      - Get transaction details
POST   /api/v1/transactions           - Create transaction
PUT    /api/v1/transactions/{id}      - Update transaction
DELETE /api/v1/transactions/{id}      - Delete transaction
POST   /api/v1/transactions/bulk      - Bulk create transactions
```

#### Categories
```
GET    /api/v1/categories             - List all categories
GET    /api/v1/categories/{id}        - Get category details
POST   /api/v1/categories             - Create custom category
PUT    /api/v1/categories/{id}        - Update category
DELETE /api/v1/categories/{id}        - Delete category
```

#### Liabilities
```
GET    /api/v1/liabilities            - List all liabilities
GET    /api/v1/liabilities/{id}       - Get liability details
POST   /api/v1/liabilities            - Create liability
PUT    /api/v1/liabilities/{id}       - Update liability
DELETE /api/v1/liabilities/{id}       - Delete liability
POST   /api/v1/liabilities/{id}/payments - Record payment
```

#### Analytics
```
GET    /api/v1/analytics/summary      - Financial summary
GET    /api/v1/analytics/cashflow     - Cash flow report
GET    /api/v1/analytics/expenses     - Expense breakdown
GET    /api/v1/analytics/income       - Income breakdown
GET    /api/v1/analytics/trends       - Trend analysis
GET    /api/v1/analytics/networth     - Net worth calculation
```

### Phase II API Endpoints

#### Portfolio Management
```
GET    /api/v1/portfolios             - List portfolios
POST   /api/v1/portfolios             - Create portfolio
GET    /api/v1/portfolios/{id}        - Get portfolio details
PUT    /api/v1/portfolios/{id}        - Update portfolio
DELETE /api/v1/portfolios/{id}        - Delete portfolio
GET    /api/v1/portfolios/{id}/performance - Portfolio performance
```

#### Holdings
```
GET    /api/v1/portfolios/{id}/holdings           - List holdings
POST   /api/v1/portfolios/{id}/holdings           - Add holding
PUT    /api/v1/portfolios/{id}/holdings/{hid}     - Update holding
DELETE /api/v1/portfolios/{id}/holdings/{hid}     - Remove holding
```

#### Market Data
```
GET    /api/v1/market/search          - Search assets
GET    /api/v1/market/quote/{symbol}  - Get current quote
GET    /api/v1/market/history/{symbol} - Get price history
GET    /api/v1/market/news/{symbol}   - Get related news
```

#### Watchlist
```
GET    /api/v1/watchlist              - Get watchlist
POST   /api/v1/watchlist              - Add to watchlist
DELETE /api/v1/watchlist/{symbol}     - Remove from watchlist
```

---

## Security Architecture

### Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  User   │         │ Frontend│         │ Backend │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │  1. Login Request │                   │                   │
     │──────────────────>│                   │                   │
     │                   │  2. POST /auth/login                  │
     │                   │──────────────────>│                   │
     │                   │                   │  3. Verify User   │
     │                   │                   │──────────────────>│
     │                   │                   │<──────────────────│
     │                   │                   │  4. Generate JWT  │
     │                   │  5. Access + Refresh Token            │
     │                   │<──────────────────│                   │
     │  6. Store Tokens  │                   │                   │
     │<──────────────────│                   │                   │
     │                   │                   │                   │
     │  7. API Request   │                   │                   │
     │──────────────────>│                   │                   │
     │                   │  8. Request + Bearer Token            │
     │                   │──────────────────>│                   │
     │                   │                   │  9. Validate JWT  │
     │                   │                   │                   │
     │                   │  10. Response     │                   │
     │                   │<──────────────────│                   │
     │  11. Display Data │                   │                   │
     │<──────────────────│                   │                   │
```

### Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | HTTPS/TLS | SSL certificate, force HTTPS |
| Authentication | JWT | Access token (15min), Refresh token (7 days) |
| Authorization | RBAC | Role-based access control |
| Password | Bcrypt | Password hashing with salt |
| API | Rate Limiting | 100 requests/minute per user |
| Input | Validation | Bean Validation, XSS prevention |
| Database | Parameterized Queries | JPA/Hibernate |
| CORS | Whitelist | Allowed origins configuration |
| Headers | Security Headers | CSP, X-Frame-Options, etc. |

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "roles": ["USER"],
    "iat": 1700000000,
    "exp": 1700000900
  }
}
```

---

## Deployment Architecture

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: moneytracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/moneytracker

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Production Architecture (AWS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS CLOUD                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Route 53 (DNS)                              │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│  ┌──────────────────────────────▼──────────────────────────────────────┐   │
│  │                      CloudFront (CDN)                                │   │
│  │                   + AWS Certificate Manager                          │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│         ┌───────────────────────┴───────────────────────┐                  │
│         ▼                                               ▼                  │
│  ┌─────────────────┐                          ┌─────────────────┐         │
│  │   S3 Bucket     │                          │ Application     │         │
│  │  (Static SPA)   │                          │ Load Balancer   │         │
│  └─────────────────┘                          └────────┬────────┘         │
│                                                        │                   │
│                    ┌───────────────────────────────────┼────────┐         │
│                    ▼                                   ▼        ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        ECS Fargate Cluster                           │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │  │
│  │  │   Backend   │    │   Backend   │    │   Backend   │             │  │
│  │  │  Container  │    │  Container  │    │  Container  │             │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                   │                                        │
│         ┌─────────────────────────┼─────────────────────────┐             │
│         ▼                         ▼                         ▼             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│  │    RDS          │    │  ElastiCache    │    │   Secrets       │       │
│  │  PostgreSQL     │    │     Redis       │    │   Manager       │       │
│  │  (Multi-AZ)     │    │   (Cluster)     │    │                 │       │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘       │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───>│  Build   │───>│   Test   │───>│  Deploy  │───>│Production│
│  to Git  │    │  Stage   │    │  Stage   │    │  Stage   │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ Compile  │   │  Unit    │   │  Dev     │
              │ Lint     │   │  Tests   │   │ Staging  │
              │ Audit    │   │  E2E     │   │  Prod    │
              └──────────┘   └──────────┘   └──────────┘
```

---

## Future Considerations

### Scalability Roadmap

1. **Horizontal Scaling**
   - Kubernetes orchestration for container management
   - Auto-scaling based on CPU/memory metrics
   - Database read replicas for analytics queries

2. **Performance Optimization**
   - GraphQL API for flexible data fetching
   - Server-Side Rendering (Next.js) for improved SEO
   - WebSocket connections for real-time price updates

3. **Feature Expansion**
   - Multi-currency support with automatic conversion
   - Recurring transaction automation
   - Budget goals and alerts
   - Export to accounting software (QuickBooks, etc.)
   - Mobile application (React Native)

### Potential Integrations

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Plaid | Bank account linking | High |
| Stripe | Payment processing | Medium |
| SendGrid | Email notifications | High |
| Twilio | SMS alerts | Medium |
| Google Sheets | Data export | Low |
| YNAB API | Budget import | Low |

### Technical Debt Prevention

- Regular dependency updates
- Code quality metrics monitoring
- Performance benchmarking
- Security vulnerability scanning
- Documentation maintenance

---

## Appendix

### Environment Variables

```properties
# Backend
SPRING_PROFILES_ACTIVE=dev|staging|prod
DATABASE_URL=jdbc:postgresql://localhost:5432/moneytracker
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secret
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-256-bit-secret
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# External APIs (Phase II)
ALPHA_VANTAGE_API_KEY=your-api-key
COINGECKO_API_KEY=your-api-key
YAHOO_FINANCE_API_KEY=your-api-key

# Frontend
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=MoneyTracker
```

### Glossary

| Term | Definition |
|------|------------|
| MVP | Minimum Viable Product |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| DTO | Data Transfer Object |
| ORM | Object-Relational Mapping |
| SPA | Single Page Application |
| CDN | Content Delivery Network |
| ETL | Extract, Transform, Load |

---

*Document Version: 1.0*
*Last Updated: November 2025*
*Author: MoneyTracker Team*
