#!/usr/bin/env bash
# Run once on CPU EC2 to set up helmio-web
set -e

REPO_DIR="/home/ubuntu/helmio-web"
NODE_VERSION="20"

# --- Node.js ---
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# --- Build ---
cd "$REPO_DIR"
npm ci
npm run build

# --- .env.local ---
if [ ! -f "$REPO_DIR/.env.local" ]; then
  cat > "$REPO_DIR/.env.local" <<EOF
NEXT_PUBLIC_API_URL=http://18.207.13.85:8001
EOF
  echo ".env.local created"
fi

# --- systemd service ---
sudo tee /etc/systemd/system/helmio-web.service > /dev/null <<EOF
[Unit]
Description=Helmio Web (Next.js)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=$REPO_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=$(which node) node_modules/.bin/next start -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable helmio-web
sudo systemctl start helmio-web

echo "helmio-web is running on port 3000"
echo "App: http://18.207.13.85:3000"
