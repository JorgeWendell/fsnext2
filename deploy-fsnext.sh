#!/usr/bin/env bash
set -euo pipefail

APP_NAME="fsnext"
APP_USER="${SUDO_USER:-$USER}"
APP_DIR="/var/www/fsnext2"
DOMAIN="fs.adelbr.tech"
APP_PORT=3000
NODE_MAJOR=22
NODE_MAX_OLD_SPACE=1536
SERVICE_MEMORY_MAX="2500M"
POSTGRES_DB="fsnext"
POSTGRES_USER="fsnext_user"
POSTGRES_PASSWORD="lucas120908"
BETTER_AUTH_SECRET="3L8AKwGUZa+VMTQc472p2FqT0UTyfNG8aBgAH+LfSMw="
BETTER_AUTH_URL="https://${DOMAIN}"

sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git nginx python3-certbot-nginx postgresql postgresql-contrib

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q "^v${NODE_MAJOR}\."; then
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null
  sudo apt update
  sudo apt install -y nodejs
fi

NODE_PATH="$(command -v node)"
if [ -z "$NODE_PATH" ]; then
  echo "Node.js não encontrado após instalação."
  exit 1
fi

sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql -v ON_ERROR_STOP=1 <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USER}') THEN
    CREATE ROLE ${POSTGRES_USER} LOGIN PASSWORD '${POSTGRES_PASSWORD}';
  ELSE
    ALTER ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
  END IF;
END
\$\$;
EOF

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'" | grep -q "1"; then
  sudo -u postgres createdb -O "${POSTGRES_USER}" "${POSTGRES_DB}"
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 <<EOF
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
EOF

export PGPASSWORD="${POSTGRES_PASSWORD}"
if ! psql -h 127.0.0.1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT 1;" >/dev/null 2>&1; then
  echo "Falha ao validar conexão com PostgreSQL usando usuário/senha do deploy."
  exit 1
fi
unset PGPASSWORD

sudo mkdir -p "${APP_DIR}"
sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
cd "${APP_DIR}"

if [ ! -f package.json ]; then
  echo "package.json não encontrado em ${APP_DIR}. Copie o projeto antes de executar."
  exit 1
fi

if [ ! -f .env ]; then
  cat > .env <<EOF
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB}
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
BETTER_AUTH_URL=${BETTER_AUTH_URL}
NEXT_PUBLIC_APP_URL=${BETTER_AUTH_URL}
NODE_ENV=production
PORT=${APP_PORT}
EOF
fi

required_envs=("DATABASE_URL" "BETTER_AUTH_SECRET" "BETTER_AUTH_URL")
for env_key in "${required_envs[@]}"; do
  if ! grep -q "^${env_key}=" .env; then
    echo "Variável obrigatória ausente no .env: ${env_key}"
    exit 1
  fi
done

npm install
npx drizzle-kit push
npm run build

sudo tee /etc/systemd/system/${APP_NAME}.service >/dev/null <<EOF
[Unit]
Description=FSNext Next.js app
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
Environment=NODE_OPTIONS=--max-old-space-size=${NODE_MAX_OLD_SPACE}
EnvironmentFile=${APP_DIR}/.env
ExecStart=${NODE_PATH} ${APP_DIR}/node_modules/next/dist/bin/next start -p ${APP_PORT}
Restart=always
RestartSec=5
MemoryMax=${SERVICE_MEMORY_MAX}

[Install]
WantedBy=multi-user.target
EOF

if ! swapon --show | grep -q "/swapfile"; then
  if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
  fi
  sudo swapon /swapfile
  if ! grep -q "^/swapfile" /etc/fstab; then
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null
  fi
fi

sudo tee /etc/nginx/sites-available/${APP_NAME} >/dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /healthz {
        proxy_pass http://127.0.0.1:${APP_PORT}/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}
if [ -f /etc/nginx/sites-enabled/default ]; then
  sudo rm -f /etc/nginx/sites-enabled/default
fi
sudo nginx -t
sudo systemctl reload nginx

sudo systemctl daemon-reload
sudo systemctl enable ${APP_NAME}.service
sudo systemctl restart ${APP_NAME}.service
sudo systemctl status ${APP_NAME}.service --no-pager -l

sudo certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN#*.}" || true

echo "Deploy finalizado."
echo "Serviço: sudo systemctl status ${APP_NAME}.service -l"
echo "Logs: sudo journalctl -u ${APP_NAME}.service -f"
echo "Healthcheck: curl -I http://127.0.0.1:${APP_PORT}/api/health"