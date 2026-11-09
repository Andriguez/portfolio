sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443
sudo ufw enable

sudo apt install -y unattended-upgrade
sudo apt install -y unattended-upgrades fail2ban
sudo dpkg-reconfigure -plow unattended-upgrades

sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

curl -fsSl https://get.docker.com | sudo sh

ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""
chmod 600 ~/.ssh/deploy_key

cat >> ~/.ssh/config <<'EOF'
Host github.com
IdentityFIle ~/.ssh/deploy_key
IdentitiesOnly yes
EOF

sudo mkdir -p /srv/portfolio && sudo chown andi: /srv/portfolio
git close git@github.com:Andriguez/portfolio.git /srv/portfolio

python3 -c "import secrets; priint(secrets.token_urlsafe(48))"
python3 -c "import base64, os; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
sudo mkdir /srv/portfolio/.env
echo "MYSQL_ROOT_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')" >> .env
echo "MYSQL_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')" >> .env
echo "JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" >> .env
echo "TOTP_ENC_KEY=$(python3 -c 'import base64,os; print(base64.urlsafe_b64encode(os.urandom(32)).decode())')" >> .env
echo "COOKIE_SECURE=true" >> .env
echo "GITHUB_REPO=Andriguez/portfolio" >> .env
echo "GITHUB_TOKEN='token'" >> .env
chmod 600 .env

cd /srv/portfolio
sudo docker run --rm -it caddy:2 caddy hash-password
echo "ADMIN_PASSWORD_HASH='hashed password'" >> .env

mkdir -p ./frontend/dist

cd backend/
docker compose -f docker-compose.prod.yml config -q

getent group docker
sudo usermod -aG docker andi

crontab -e 15 3 * * * /srv/portfolio/backend/backup.sh >> /srv/backups/backup.log 2>&1
sudo mkdir -p /srv/backups
sudo chown andi:andi /srv/backups
chmod 700 /srv/backups

sudo apt nstall -y rclone
rclone config
rclone lsd re-cloudflare:portfolio-backups
rclone ls re-cloudflare:portfolio-backups
rclone copy /srv/backups  re-cloudflare:portfolio-backups --s3-no-check-bucket
curl https://rclone.org/install.sh | sudo bash
rclone config

cd /srv/portfolio/backend
docker compose -f docker-compose.prod.yml exec caddy cat /etc/caddy/Caddyfile

docker compose -f docker-compose.prod.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose -f docker-compose.prod.yml exec caddy caddy fmt --overwrite
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

