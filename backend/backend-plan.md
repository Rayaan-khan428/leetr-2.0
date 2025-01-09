# LeetTracker Backend Implementation Plan

## Database Setup

### PostgreSQL Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY,
    leetcode_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard'),
    url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User_Problems table
CREATE TABLE user_problems (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    problem_id UUID REFERENCES problems(id),
    attempts INT DEFAULT 1,
    last_attempted TIMESTAMP,
    next_scheduled TIMESTAMP,
    notes TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id)
);
```

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   └── email.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── problemController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── rateLimit.ts
│   ├── services/
│   │   ├── userService.ts
│   │   ├── problemService.ts
│   │   ├── notificationService.ts
│   │   └── spacedRepetitionService.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   └── types/
│       ├── problem.ts
│       └── user.ts
├── prisma/
│   └── schema.prisma
├── tests/
└── package.json
```

## Implementation Steps

### 1. Initial Setup (2 days)
- Initialize Node.js project with TypeScript
- Configure ESLint and Prettier
- Set up PostgreSQL database
- Configure Prisma ORM
- Set up environment variables
- Configure logging system

### 2. Authentication System (3 days)
```typescript
// Example JWT Configuration
interface JWTConfig {
  accessTokenExpiry: '15m';
  refreshTokenExpiry: '7d';
  secretKey: process.env.JWT_SECRET;
}

// Example Auth Middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError();
    
    const decoded = verifyToken(token);
    req.user = await prisma.user.findUnique({ where: { id: decoded.userId }});
    next();
  } catch (error) {
    next(error);
  }
};
```

### 3. Core Features (4 days)

#### Spaced Repetition Algorithm
```typescript
class SpacedRepetitionService {
  calculateNextReview(attempts: number, lastSuccess: boolean): Date {
    const baseInterval = 1; // day
    const growthFactor = lastSuccess ? 2 : 0.5;
    const interval = baseInterval * Math.pow(growthFactor, attempts - 1);
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + Math.round(interval));
    return nextDate;
  }
}
```

### 4. API Endpoints

#### Problem Tracking
```typescript
router.post('/problems/submit', authMiddleware, async (req, res) => {
  const { problemId, success, timeComplexity, spaceComplexity, notes } = req.body;
  
  const result = await problemService.submitSolution({
    userId: req.user.id,
    problemId,
    success,
    timeComplexity,
    spaceComplexity,
    notes
  });
  
  res.json(result);
});
```

### 5. Testing Strategy (2 days)
- Unit tests for services
- Integration tests for API endpoints
- Load testing for critical endpoints
- Test coverage monitoring

### 6. Security Implementation
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Problem Endpoints
```typescript
GET /api/problems
POST /api/problems/submit
GET /api/problems/stats
GET /api/problems/next-review
```

## Deployment Checklist
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Set up database backup strategy
- [ ] Configure application monitoring
- [ ] Set up error tracking
- [ ] Configure automated backups

## Performance Considerations
1. Implement caching strategy
2. Optimize database queries
3. Implement connection pooling
4. Set up database indexing
5. Configure rate limiting

## Monitoring and Logging
1. Set up error tracking with Sentry
2. Implement structured logging
3. Set up performance monitoring
4. Configure alert systems
5. Set up uptime monitoring
