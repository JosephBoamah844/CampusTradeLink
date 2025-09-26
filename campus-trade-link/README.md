# 🚀 Campus Trade Link

A full-stack social network app for university students to buy, sell, and connect on campus.

## 🏗️ Project Structure

```
campus-trade-link/
├── backend/                 # Node.js API server
├── web/                    # React web frontend
├── mobile/                 # Expo React Native app
├── shared/                 # Shared types and utilities
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd campus-trade-link
npm run install:all
```

2. **Environment Setup**
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env

# Update with your credentials
```

3. **Database Setup**
```bash
cd backend
npm run db:migrate
npm run db:seed
```

4. **Run Development Servers**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Web Frontend
cd web && npm run dev

# Terminal 3: Mobile App
cd mobile && npm start
```

## 🌐 Deployment

### Backend (Railway/Render)
```bash
cd backend
npm run build
npm run deploy
```

### Web (Vercel/Netlify)
```bash
cd web
npm run build
npm run deploy
```

### Mobile (Expo)
```bash
cd mobile
expo build
```

## 🎯 Features

- ✅ Student email authentication (@st.ug.edu.gh)
- ✅ Social feed with posts, likes, comments
- ✅ Marketplace for buying/selling
- ✅ Direct messaging
- ✅ Follow system
- ✅ Profile management
- ✅ Photo uploads
- ✅ Real-time notifications

## 🔧 Tech Stack

- **Backend**: Node.js, Express, GraphQL, PostgreSQL
- **Web**: React, Next.js, Tailwind CSS
- **Mobile**: Expo, React Native
- **Auth**: JWT + OpenID Connect
- **Storage**: S3-compatible (Supabase/AWS S3)
- **Database**: PostgreSQL (portable schema)

## 📱 Testing

- Limited to 10 registered accounts for prototype
- Test with @st.ug.edu.gh email addresses
- Full feature testing available immediately

## 🔄 Scaling

To scale beyond 10 users:
1. Remove user limit in backend config
2. Upgrade Supabase/Auth0 free tier
3. Switch to production storage (AWS S3/Cloudflare R2)
4. Run database migrations on production Postgres

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## 🛠️ Development

### Database Migrations
```bash
cd backend
npm run db:migrate:create <migration-name>
npm run db:migrate:up
npm run db:migrate:down
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Web tests
cd web && npm test

# Mobile tests
cd mobile && npm test
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.