# Car Selling API

A comprehensive REST API built with NestJS for managing car sales reports, user authentication, and price estimation. This project demonstrates modern backend development practices including authentication, authorization, data validation, caching, and email services.

## 🚀 Features

### 🔐 Authentication & Authorization

- **User Registration & Login**: Secure user account creation with email verification
- **Session Management**: Cookie-based session handling for user authentication
- **Email Verification**: Automated email verification system with verification codes
- **Role-based Access Control**: Admin and regular user roles with different permissions
- **Password Security**: Bcrypt hashing for secure password storage

### 🚗 Car Reports Management

- **Create Reports**: Submit car sale reports with detailed vehicle information
- **Price Estimation**: Get estimated car values based on make, model, year, mileage, and location
- **Report Approval**: Admin-controlled approval system for car reports
- **Geographic Data**: Location-based reporting with latitude/longitude coordinates
- **Report Filtering**: Advanced filtering and search capabilities

### 👥 User Management

- **User Profiles**: Complete user profile management with personal information
- **User Search**: Search and filter users with pagination
- **Profile Updates**: Update user information and settings
- **User Administration**: Admin tools for user management

### 📧 Email Services

- **Verification Emails**: Automated email verification system
- **Template Engine**: Handlebars-based email templates
- **SMTP Integration**: Configurable email service integration

### 🗄️ Data Management

- **SQLite Database**: Lightweight, file-based database for development
- **TypeORM Integration**: Object-Relational Mapping with TypeScript
- **Data Validation**: Comprehensive input validation using class-validator
- **Caching**: Redis-compatible caching for improved performance

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: Cookie-based sessions with bcrypt
- **Validation**: class-validator & class-transformer
- **Email**: Nodemailer with Handlebars templates
- **Caching**: NestJS Cache Manager
- **Testing**: Jest for unit and e2e testing
- **Code Quality**: ESLint & Prettier

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite3

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd car-selling-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create environment files for different environments:

   ```bash
   # Development
   touch .env.development

   # Test
   touch .env.test

   # Production
   touch .env.production
   ```

4. **Environment Variables**
   Add the following variables to your `.env.development` file:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_NAME=db.sqlite
   COOKIE_KEY=your-secret-cookie-key
   EMAIL_HOST=your-smtp-host
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

### Watch Mode

```bash
npm run test:watch
```

## 📚 API Endpoints

### Authentication (`/auth`)

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/verify` - Email verification
- `POST /auth/verification-code` - Resend verification code
- `GET /auth/whoami` - Get current user info

### Users (`/users`)

- `GET /users` - Get all users (with pagination and search)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `DELETE /users` - Delete all users

### Reports (`/reports`)

- `GET /reports/estimate` - Get car price estimate
- `POST /reports` - Create new report
- `GET /reports` - Get all reports (with pagination and filtering)
- `GET /reports/:id` - Get report by ID
- `PATCH /reports/:id` - Update report
- `PATCH /reports/:id/approve` - Approve report (Admin only)
- `DELETE /reports/:id` - Delete report (Admin only)
- `DELETE /reports` - Delete all reports (Admin only)

### Application (`/app`)

- `GET /app` - Health check endpoint

## 📊 Data Models

### User Entity

```typescript
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  verified: boolean;
  verificationCode: string;
  verificationCodeExpiresAt: Date;
  isAdmin: boolean;
  fullName: string; // Virtual field
  createdAt: Date;
  updatedAt: Date;
}
```

### Report Entity

```typescript
{
  id: number;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  lng: number;
  lat: number;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
```

## 🔧 Configuration

The application uses environment-based configuration with the following structure:

- `.env.development` - Development environment
- `.env.test` - Test environment
- `.env.production` - Production environment

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dtos/            # Data Transfer Objects
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # User management module
│   ├── dtos/
│   ├── decorators/
│   ├── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── reports/             # Reports module
│   ├── dtos/
│   ├── report.entity.ts
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   └── reports.module.ts
├── email/               # Email service module
│   ├── email.service.ts
│   └── email.module.ts
├── guards/              # Authentication guards
├── interceptors/        # Response interceptors
├── templates/           # Email templates
├── app.module.ts        # Main application module
├── main.ts             # Application entry point
└── app.controller.ts   # Main controller
```

## 🚦 Request/Response Format

All API responses follow a consistent format:

```typescript
{
  message: string;
  data: any;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
  other?: any;
}
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using class-validator
- **Password Hashing**: Bcrypt for secure password storage
- **Session Security**: Secure cookie-based session management
- **SQL Injection Protection**: TypeORM query builder prevents SQL injection
- **CORS Configuration**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: Built-in request rate limiting capabilities

## 🎯 Key Features Explained

### Price Estimation

The API provides intelligent car price estimation based on:

- Vehicle make and model
- Manufacturing year
- Mileage
- Geographic location (latitude/longitude)
- Market trends and historical data

### Admin Controls

Administrators have special privileges:

- Approve/reject car reports
- Delete reports and users
- Access to all user data
- System-wide management capabilities

### Email Verification System

- Automated verification code generation
- Email templates with Handlebars
- Configurable SMTP settings
- Development mode shows verification codes in response

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED License - see the package.json file for details.

## 👨‍💻 Author

Built as part of a NestJS course by Stephen Grider on Udemy.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a learning project demonstrating modern backend development practices with NestJS, TypeScript, and various enterprise-level features.
