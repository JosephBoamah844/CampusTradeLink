# 🚀 Deployment Guide

This guide covers deploying Campus Trade Link to production.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Supabase account (for storage and auth)
- Domain name (optional)

## 🗄️ Database Setup

### Option 1: Supabase (Recommended for MVP)

1. Create a new Supabase project
2. Copy the database URL from Settings > Database
3. Run migrations:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### Option 2: Self-hosted PostgreSQL

1. Set up PostgreSQL server
2. Create database: `CREATE DATABASE campus_trade_link;`
3. Update `DATABASE_URL` in environment variables
4. Run migrations

## 🔐 Environment Variables

### Backend (.env)
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/campus_trade_link
JWT_SECRET=your-super-secret-jwt-key-256-bits-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-256-bits-long
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=4000
```

### Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_WS_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=Campus Trade Link
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
EXPO_PUBLIC_WS_URL=https://your-api-domain.com
EXPO_PUBLIC_APP_NAME=Campus Trade Link
```

## 🌐 Backend Deployment

### Option 1: Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Deploy from the `backend` folder
3. Add environment variables in Railway dashboard
4. Railway will automatically detect and deploy using `Dockerfile`

### Option 2: Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Option 3: DigitalOcean App Platform

1. Create new app from GitHub
2. Configure build settings:
   - Build command: `npm install && npm run build`
   - Run command: `npm start`
3. Add environment variables
4. Deploy

### Option 4: Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
cd backend
docker build -t campus-trade-link-api .
docker run -p 4000:4000 --env-file .env campus-trade-link-api
```

## 🌍 Frontend Deployment

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set root directory to `web`
3. Vercel will auto-detect Next.js and deploy
4. Add environment variables in Vercel dashboard

### Option 2: Netlify

1. Connect your GitHub repository
2. Set build settings:
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables

### Option 3: Static Export

```bash
cd web
npm run build
npm run export
# Deploy the `out` folder to any static hosting
```

## 📱 Mobile Deployment

### Expo Application Services (EAS)

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure project:
```bash
cd mobile
eas build:configure
```

4. Build for app stores:
```bash
# Build for both platforms
eas build --platform all

# Build for Android only
eas build --platform android

# Build for iOS only
eas build --platform ios
```

5. Submit to app stores:
```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

### Development Builds

For testing during development:

```bash
# Create development build
eas build --profile development

# Create preview build (internal distribution)
eas build --profile preview
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Campus Trade Link

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Railway deployment commands
          
  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          # Vercel deployment commands

  deploy-mobile:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: EAS Build
        run: |
          # EAS build commands
```

## 🔧 Production Optimizations

### Backend

1. **Enable compression**:
```bash
npm install compression
```

2. **Add rate limiting**:
```bash
npm install express-rate-limit
```

3. **Security headers**:
```bash
npm install helmet
```

4. **Monitoring**:
```bash
npm install @sentry/node
```

### Frontend

1. **Enable image optimization** in `next.config.js`
2. **Add analytics** (Google Analytics, Mixpanel, etc.)
3. **Enable PWA** features
4. **Add error monitoring** (Sentry)

### Database

1. **Connection pooling** (already configured with drizzle-orm)
2. **Database indexing** (already included in schema)
3. **Regular backups**
4. **Performance monitoring**

## 📊 Monitoring & Analytics

### Application Monitoring

1. **Sentry** for error tracking
2. **LogRocket** for session replay
3. **New Relic** for APM

### Infrastructure Monitoring

1. **Railway/Render** built-in monitoring
2. **Vercel** analytics
3. **Supabase** dashboard

## 🔐 Security Checklist

- [ ] Environment variables are secure and not in code
- [ ] JWT secrets are properly generated (256-bit)
- [ ] Database credentials are rotated
- [ ] HTTPS is enabled everywhere
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] File upload limits are enforced
- [ ] Email verification is required

## 📈 Scaling Considerations

### Immediate (10-100 users)
- Current setup is sufficient
- Monitor database performance
- Consider Redis for caching

### Medium Scale (100-1000 users)
- Add Redis for sessions and caching
- Implement database read replicas
- Add CDN for static assets
- Consider horizontal scaling

### Large Scale (1000+ users)
- Microservices architecture
- Load balancers
- Database sharding
- Message queue (Bull/Agenda)
- Separate media storage

## 🚨 Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check `DATABASE_URL` format
   - Verify network connectivity
   - Check firewall settings

2. **File upload failures**:
   - Verify Supabase storage bucket exists
   - Check file size limits
   - Validate file types

3. **Authentication issues**:
   - Verify JWT secrets are set
   - Check token expiration
   - Validate email verification flow

4. **Socket.io connection issues**:
   - Check WebSocket support
   - Verify CORS configuration
   - Test with fallback polling

### Logs and Debugging

```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# Check health endpoint
curl https://your-api-domain.com/api/health
```

## 📞 Support

- Check [GitHub Issues](https://github.com/yourusername/campus-trade-link/issues)
- Review [API Documentation](./api.md)
- Contact: support@campustradelink.com