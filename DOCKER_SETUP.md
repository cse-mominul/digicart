# Docker Setup Guide for DigiCart (MERN)

## JWT Environment Variable Issue - FIXED ✅

The "secretOrPrivateKey must have a value" error occurred because your `.env` variables weren't being passed into the Docker container. This is now fixed!

---

## How It Works Now

### 1. **docker-compose.yml** loads your `.env` file
```yaml
env_file:
  - ./backend/.env
```
This tells Docker to read all variables from `backend/.env` and inject them into the app container.

### 2. **Server.js** verifies all variables are loaded
When the container starts, you'll see logs like:
```
✅ All required env variables loaded successfully
📦 Environment: NODE_ENV=production
📦 JWT_SECRET loaded: YES
📦 MONGO_URI: mongodb://mongodb:27017/digicart
```

If anything is missing:
```
❌ Missing required env variables in Docker: JWT_SECRET, MONGO_URI
```

### 3. **Variables in Production Docker**
- `JWT_SECRET` → Loaded from `backend/.env` ✅
- `MONGO_URI` → Overridden to `mongodb://mongodb:27017/digicart` (Docker internal network) ✅
- `PORT` → Set to `5000` (exposed as `8080` on host machine) ✅
- `NODE_ENV` → Set to `production` ✅

---

## How to Run with Docker

### Step 1: Ensure `.env` file exists
```bash
# backend/.env should have:
PORT=5000
JWT_SECRET=digicart_super_secret_key_change_in_production
MONGO_URI=mongodb://127.0.0.1:27017/digicart  # Local development
NODE_ENV=development
```

### Step 2: Build and start containers
```bash
cd d:\Vs Soft\digicart
docker compose up --build
```

### Step 3: Check logs for environment verification
```bash
docker compose logs app
```

You should see:
```
✅ All required env variables loaded successfully
📦 JWT_SECRET loaded: YES
```

### Step 4: Access your app
- Frontend: `http://localhost:8080`
- API: `http://localhost:8080/api`
- MongoDB: Runs inside container (not exposed for security)

---

## How to Verify Variables Inside Docker

When container is running:
```bash
# Check environment variables inside app container
docker exec digicart_app env | grep -E "JWT_SECRET|MONGO_URI|NODE_ENV"
```

Output should show:
```
JWT_SECRET=digicart_super_secret_key_change_in_production
MONGO_URI=mongodb://mongodb:27017/digicart
NODE_ENV=production
```

---

## Security Best Practices

### ⚠️ DO NOT commit `.env` to Git
- It's already in `.gitignore`
- Use `.env.example` as template
- Each team member has their own `.env`

### ✅ For Production
```env
JWT_SECRET=use_a_strong_random_string_here_64_chars_min
```

Generate a strong secret:
```bash
# On Windows PowerShell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object { [char]$_ })))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ✅ Environment Override (if needed)
In `docker-compose.yml`, you can override specific variables:
```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
  - MONGO_URI=mongodb://mongodb:27017/digicart
  - JWT_SECRET=custom_value_here  # ⚠️ Only for testing, not secure!
```

Better approach: Use Docker Secrets or `.env` file (already configured).

---

## Troubleshooting

### JWT_SECRET still not working?
1. Check `.env` file exists: `ls backend/.env`
2. Verify it has `JWT_SECRET` line
3. Rebuild: `docker compose up --build`
4. Check logs: `docker compose logs app`

### MONGO_URI connection fails?
1. Ensure MongoDB service is running: `docker compose ps`
2. Check MongoDB logs: `docker compose logs mongodb`
3. Container names must match: `mongodb://mongodb:27017` (not `localhost`)

### Need to rebuild without cache?
```bash
docker compose down
docker compose up --build --no-cache
```

### Clean everything (reset data)?
```bash
docker compose down -v  # -v removes named volumes
```

---

## Files Changed

✅ `docker-compose.yml` - Added `env_file: ./backend/.env`  
✅ `backend/server.js` - Added environment variable debugging logs  
✅ `backend/.env.example` - Created template for required variables  

Your setup is now production-ready! 🚀
