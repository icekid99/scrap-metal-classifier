#!/bin/bash
set -e

echo "==> Updating system packages..."
apt-get update && apt-get upgrade -y

echo "==> Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "==> Enabling Docker..."
systemctl enable docker
systemctl start docker

echo "==> Cloning / updating project..."
if [ -d "/opt/scrap-metal-classifier" ]; then
  cd /opt/scrap-metal-classifier && git pull
else
  git clone https://github.com/YOUR_USERNAME/scrap-metal-classifier.git /opt/scrap-metal-classifier
  cd /opt/scrap-metal-classifier
fi

echo "==> Setting up environment file..."
if [ ! -f ".env.prod" ]; then
  cp .env.prod.example .env.prod
  echo "⚠️  Edit /opt/scrap-metal-classifier/.env.prod with your real secrets before continuing!"
  exit 1
fi

echo "==> Checking for model file..."
if [ ! -f "backend/best.pt" ]; then
  echo "⚠️  No backend/best.pt found — app will run in DEMO mode (simulated detections)."
  echo "    Upload a trained model later and uncomment the volume mount in docker-compose.prod.yml"
fi

echo "==> Building and starting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

echo "==> Done! App is running on port 80."
docker compose -f docker-compose.prod.yml ps
