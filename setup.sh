#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Task Manager - AWS EC2 Setup Script
# Run this on a fresh Ubuntu EC2 instance or reuse it for updates
# ============================================================

REPO_URL="${1:-https://github.com/catbug0x1/TaskManager.git}"
APP_DIR="/home/ubuntu/task-manager"
SYNC_SCRIPT="/usr/local/bin/task-manager-sync"
SERVICE_FILE="/etc/systemd/system/task-manager-sync.service"
TIMER_FILE="/etc/systemd/system/task-manager-sync.timer"

echo ">>> Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

echo ">>> Installing Docker & dependencies..."
sudo apt-get install -y -qq ca-certificates curl git docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu || true

echo ">>> Cloning or updating repository..."
if [ ! -d "$APP_DIR/.git" ]; then
    sudo rm -rf "$APP_DIR"
    sudo -u ubuntu git clone "$REPO_URL" "$APP_DIR"
else
    sudo -u ubuntu git -C "$APP_DIR" fetch origin main
    sudo -u ubuntu git -C "$APP_DIR" reset --hard origin/main
fi

echo ">>> Creating .env from example if needed..."
if [ ! -f "$APP_DIR/.env" ]; then
    sudo cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    sudo chown ubuntu:ubuntu "$APP_DIR/.env"
    echo ">>> IMPORTANT: Update $APP_DIR/.env for production secrets when ready."
fi

echo ">>> Installing auto-sync script..."
sudo tee "$SYNC_SCRIPT" > /dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ubuntu/task-manager"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone https://github.com/catbug0x1/TaskManager.git "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin main
git reset --hard origin/main
docker compose up -d --build --remove-orphans
docker image prune -f
EOF
sudo chmod 755 "$SYNC_SCRIPT"

echo ">>> Installing systemd service and timer..."
sudo tee "$SERVICE_FILE" > /dev/null <<'EOF'
[Unit]
Description=Task Manager EC2 sync
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/task-manager-sync
EOF

sudo tee "$TIMER_FILE" > /dev/null <<'EOF'
[Unit]
Description=Run Task Manager sync every minute

[Timer]
OnBootSec=30s
OnUnitActiveSec=60s
Unit=task-manager-sync.service

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now task-manager-sync.timer

echo ">>> Running initial sync..."
sudo "$SYNC_SCRIPT"

echo ">>> Setup complete!"
echo ">>> Your app should be running at http://$(curl -s http://checkip.amazonaws.com)"
echo ">>> Auto-sync timer is enabled and will keep the EC2 host updated from main."
