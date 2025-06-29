# RegIntel Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Linux/macOS/Windows with WSL2
- 2GB+ RAM recommended
- Domain name (optional)

## Production Deployment

### 1. Server Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE regintel;
CREATE USER regintel_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE regintel TO regintel_user;
\q
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/yourusername/regintel.git
cd regintel

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with production values
nano .env
```

Required `.env` values:
```
DATABASE_URL="postgresql://regintel_user:your_secure_password@localhost:5432/regintel"
SESSION_SECRET="generate-32-character-random-string"
NODE_ENV="production"
```

### 4. Build and Deploy

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "regintel" -- start
pm2 save
pm2 startup
```

### 5. Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/regintel`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/regintel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Setup (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/regintel
      - SESSION_SECRET=your-32-character-secret
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=regintel
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Deploy with Docker

```bash
docker-compose up -d
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: 32+ character secret for sessions
- `NODE_ENV`: Set to "production"

### Optional (Future)
- `SMTP_HOST`: Email server for notifications
- `SMTP_PORT`: Email server port
- `SMTP_USER`: Email username
- `SMTP_PASS`: Email password

## Monitoring

### Application Logs
```bash
# PM2 logs
pm2 logs regintel

# Docker logs
docker-compose logs -f app
```

### Database Backup
```bash
# Create backup script
cat > /home/user/backup-regintel.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U regintel_user -h localhost regintel > /backups/regintel_$DATE.sql
# Keep only last 7 days of backups
find /backups -name "regintel_*.sql" -mtime +7 -delete
EOF

chmod +x /home/user/backup-regintel.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/user/backup-regintel.sh
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (ufw/iptables)
- [ ] Set up SSL certificates
- [ ] Configure secure headers in nginx
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitor logs for suspicious activity
- [ ] Restrict database access to localhost

## Troubleshooting

### Application won't start
- Check logs: `pm2 logs regintel`
- Verify database connection: `npx prisma db push`
- Check port 3000 is available: `sudo lsof -i :3000`

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in .env
- Test connection: `psql -U regintel_user -d regintel -h localhost`

### Performance issues
- Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=2048"`
- Enable database query logging
- Monitor with PM2: `pm2 monit`

## Support

For issues and questions:
- Check logs first
- Review documentation in `/docs`
- Create GitHub issue with details

---

Remember: This is a private intelligence system. Keep it secure!