#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Task Manager - AWS EC2 Setup Script
# Run this on a fresh Ubuntu 24.04 EC2 instance
# ============================================================

REPO_URL="${1:-https://github.com/YOUR_USER/task-manager.git}"
APP_DIR="$HOME/task-manager"

echo ">>> Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

echo ">>> Installing Docker & dependencies..."
sudo apt-get install -y -qq ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo ">>> Adding current user to docker group..."
sudo usermod -aG docker "$USER"

echo ">>> Enabling Docker on boot..."
sudo systemctl enable docker

echo ">>> Cloning repository..."
if [ ! -d "$APP_DIR" ]; then
    git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

echo ">>> Creating .env from example..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ">>> IMPORTANT: Edit .env to set your SECRET_KEY and ADMIN_PASSWORD!"
fi

echo ">>> Building and starting containers..."
sudo docker compose up -d --build

echo ">>> Setup complete!"
echo ">>> Your app should be running at http://$(curl -s http://checkip.amazonaws.com)"
echo ">>>"
echo ">>> Default login: admin / admin123"
echo ">>> CHANGE YOUR PASSWORD in .env and re-run: docker compose up -d"
