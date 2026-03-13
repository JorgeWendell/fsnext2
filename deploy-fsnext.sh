#!/usr/bin/env bash
set -euo pipefail

# ====== CONFIGURAÇÕES BÁSICAS (EDITE ANTES DE RODAR) ======
APP_DIR="/var/www/fsnext"        # pasta onde o projeto vai ficar no servidor
DOMAIN="fs.adelbr.tech"         # troque pelo seu domínio real
APP_PORT=3000                    # porta onde o Next.js vai rodar

# ====== ATUALIZAÇÃO DO SISTEMA ======
sudo apt update && sudo apt upgrade -y

# ====== PACOTES BÁSICOS ======
sudo apt install -y curl git nginx python3-certbot-nginx

# ====== POSTGRESQL ======
sudo apt install -y postgresql postgresql-contrib

sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql <<'EOF'
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_user WHERE usename = 'fsnext_user'
   ) THEN
      CREATE USER fsnext_user WITH PASSWORD 'Lucas120908';
   END IF;

   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'fsnext'
   ) THEN
      CREATE DATABASE fsnext OWNER fsnext_user;
   END IF;

   GRANT ALL PRIVILEGES ON DATABASE fsnext TO fsnext_user;
END
$$;
EOF

# ====== NVM + NODE.JS 24.x ======
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 24
nvm use 24
nvm alias default 24

# ====== NPM (ATUALIZAR PARA A VERSÃO MAIS RECENTE) ======
npm install -g npm@latest

# ====== PM2 GLOBAL ======
npm install -g pm2

# ====== CÓDIGO DA APLICAÇÃO ======
# Cria pasta da aplicação, se não existir
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

cd "$APP_DIR"

# Se quiser clonar o repo aqui, descomente e ajuste:
# git clone https://github.com/JorgeWendell/fsnext2 .
# git checkout main

# Se você já copiou os arquivos do projeto para $APP_DIR,
# pode comentar a parte de clone acima e o script só vai instalar e subir.

# ====== ARQUIVO .env (usa a DATABASE_URL combinada) ======
if [ ! -f .env ]; then
  cat <<EOF > .env
DATABASE_URL="postgres://fsnext_user:Lucas120908@localhost:5432/fsnext"
EOF
  echo "Arquivo .env criado com DATABASE_URL padrão. Ajuste se necessário."
else
  echo "Arquivo .env já existe, não foi modificado."
fi

# ====== INSTALAR DEPENDÊNCIAS, MIGRAÇÕES E BUILDAR ======
npm install
npx drizzle-kit push
npm run build

# ====== PM2: INICIAR E CONFIGURAR NO BOOT ======
export PORT=$APP_PORT

pm2 start npm --name "fsnext" -- start
pm2 save

sudo env "PATH=$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"

# ====== NGINX (REVERSE PROXY) ======
sudo tee /etc/nginx/sites-available/fsnext > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/fsnext /etc/nginx/sites-enabled/fsnext
sudo nginx -t
sudo systemctl reload nginx

# ====== CERTBOT (HTTPS) ======
echo "Agora o Certbot será executado. Certifique-se de que o domínio aponta para este servidor."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" || true

echo "Deploy finalizado. Verifique o site em http://$DOMAIN e depois em https://$DOMAIN"

