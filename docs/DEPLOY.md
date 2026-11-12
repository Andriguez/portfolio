# Deploying and running andriguez.dev
 
How the production server is set up, how changes reach it, and how backups work. Commands assume Ubuntu on a Hetzner VPS, the user, and the repository at `/srv/portfolio`.
 
## Ground rules
 
- **Changes go one way: PC → GitHub → server.** Never edit files on the server by hand. Everything that changes the server goes through the repository and `deploy/deploy.sh`, so the site can always be rebuilt from the repo, `deploy/.env` and the latest backup.
- **Secrets never go in the repo.** They live only in `/srv/portfolio/deploy/.env` on the server and in the password manager.
| What | Where |
| --- | --- |
| Repository | `/srv/portfolio` |
| Compose files, Caddyfile, scripts | `/srv/portfolio/deploy/` |
| Secrets | `/srv/portfolio/deploy/.env` (mode `600`) |
| Local backups and the backup log | `/srv/backups/` |
| Off-site backups | Cloudflare R2, through the `r2crypt:` rclone remote |
 
All `docker compose` commands below are run from `/srv/portfolio/deploy`.
 
---
 
## 1. One-time server setup
 
### 1.1 Firewall
 
Allow SSH and web traffic, then turn the firewall on. **Allow SSH before enabling it**, or you lock yourself out.
 
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```
 
Docker writes its own firewall rules for published ports, which bypass ufw. That's fine here because only Caddy publishes ports (80 and 443); MySQL and the backend are only on the internal Docker network.
 
### 1.2 Automatic security updates and fail2ban
 
```bash
sudo apt install -y unattended-upgrades fail2ban
sudo dpkg-reconfigure -plow unattended-upgrades   # answer "Yes" to enable automatic updates
```
 
- `unattended-upgrades` installs security updates every day.
- `fail2ban` blocks IP addresses after repeated failed SSH logins.
### 1.3 Swap
 
A small VPS can run out of memory while building images. A 2 GB swap file prevents crashes:
 
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # keep it after a reboot
free -h                                                       # check: Swap shows 2.0Gi
```
 
### 1.4 Docker
 
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker <user>      # run docker without sudo
```
 
Log out and back in for the group change to take effect, then check with `docker ps`.
 
### 1.5 Access to the repository (deploy key)
 
The server pulls the repository with its own SSH key, which has read-only access to this one repo.
 
```bash
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""
chmod 600 ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub        # add this on GitHub: repo → Settings → Deploy keys (read-only)
```
 
Tell SSH to use that key for GitHub:
 
```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
    IdentityFile ~/.ssh/deploy_key
    IdentitiesOnly yes
EOF
```
 
Clone the repository:
 
```bash
sudo mkdir -p /srv/portfolio
sudo chown <user>: /srv/portfolio
git clone git@github.com:Andriguez/portfolio.git /srv/portfolio
```
 
### 1.6 Secrets (`deploy/.env`)
 
Create the file with strict permissions **before** writing anything into it:
 
```bash
cd /srv/portfolio/deploy
umask 077 && touch .env && chmod 600 .env
```
 
Generate the secrets. Each line creates a random value and appends it to `.env`:
 
```bash
echo "MYSQL_ROOT_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')" >> .env
echo "MYSQL_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')" >> .env
echo "JWT_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" >> .env
echo "TOTP_ENC_KEY=$(python3 -c 'import base64,os; print(base64.urlsafe_b64encode(os.urandom(32)).decode())')" >> .env
echo "COOKIE_SECURE=true" >> .env
echo "GITHUB_REPO=Andriguez/portfolio" >> .env
```
 
| Setting | What it's for |
| --- | --- |
| `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` | Database passwords; the MySQL container creates its users from these on first start. |
| `JWT_SECRET` | Signs the login tokens. Changing it logs everyone out. |
| `TOTP_ENC_KEY` | Encrypts the stored 2FA secret. **Changing it means enrolling 2FA again.** |
| `COOKIE_SECURE` | Login cookies are only sent over HTTPS. Must be `true` in production. |
| `GITHUB_REPO`, `GITHUB_TOKEN` | Used by the backend to read data from GitHub (the trash feature). |
 
Add the GitHub token by hand (`nano .env`). Use a **fine-grained token** with read-only access to this repository's contents:
 
```
GITHUB_TOKEN='...'
```
 
### 1.7 Admin password
 
Create a bcrypt hash of the admin password. Caddy's image has a tool for it, so nothing extra needs installing:
 
```bash
docker run --rm -it caddy:2 caddy hash-password
```
 
Type the password twice, then add the hash to `.env` (`nano .env`), **in single quotes**:
 
```
ADMIN_PASSWORD_HASH='$2a$14$...'
```
 
The single quotes matter: a bcrypt hash contains `$` signs, which would otherwise be read as variables.
 
Save every value from `.env` in the password manager. Then check that Compose can read everything:
 
```bash
docker compose -f docker-compose.prod.yml config -q   # no output means OK
```
 
### 1.8 First start
 
<!-- TODO: describe how frontend/dist gets onto the server (built on the PC and copied with scp, or built by deploy.sh) -->
 
```bash
mkdir -p /srv/portfolio/frontend/dist     # Caddy serves the built frontend from here
cd /srv/portfolio/deploy
./deploy.sh
```
 
Then:
 
1. Open `https://andriguez.dev` and check that the site loads (Caddy gets the TLS certificate automatically on first start).
2. Log in at `/admin` with the admin password.
3. **Enroll 2FA right away** from the CMS, and store the recovery codes in the password manager, not on your phone.
---
 
## 2. Deploying changes
 
1. Commit and push on the PC; wait for CI to be green on `main`.
2. On the server:
```bash
cd /srv/portfolio/deploy
./deploy.sh
```
 
`deploy.sh` takes a backup first, then pulls the latest code and rebuilds and restarts the containers. Database migrations run automatically when the backend container starts (`alembic upgrade head`).
<!-- TODO: check this summary against what deploy.sh actually does, and add the frontend step -->
 
Check afterwards:
 
```bash
docker compose -f docker-compose.prod.yml ps        # every service "Up"
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```
 
---
 
## 3. Caddy (web server and TLS)
 
Caddy's config is `deploy/caddy/Caddyfile`. Change it in the repo and deploy; use these commands to check and apply it on the server:
 
```bash
cd /srv/portfolio/deploy
 
# show the config Caddy is actually using
docker compose -f docker-compose.prod.yml exec caddy cat /etc/caddy/Caddyfile
 
# check it for errors before applying
docker compose -f docker-compose.prod.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
 
# apply it without downtime
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
 
# if a reload doesn't pick up the change, recreate the container
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
```
 
To tidy the Caddyfile's formatting, run `caddy fmt` on the PC and commit the result, rather than formatting it on the server.
 
Check the headers from outside after any change:
 
```bash
curl -sI https://andriguez.dev/ | grep -iE 'strict-transport|content-security|x-frame|permissions-policy'
curl -sI https://andriguez.dev/.env | head -1      # should be 404
```
 
---
 
## 4. Backups
 
### 4.1 What happens
 
Every night, `deploy/backup.sh`:
 
1. dumps the database (`mysqldump`) and archives the uploads and CV files;
2. checks the archives;
3. copies them to Cloudflare R2 through the **`r2crypt:`** remote, which encrypts file contents and names before upload;
4. deletes copies older than 14 days.
### 4.2 Setup
 
**Folder for local backups:**
 
```bash
sudo mkdir -p /srv/backups
sudo chown <user>:<user> /srv/backups
chmod 700 /srv/backups
```
 
**rclone** (installed from rclone.org, because the Ubuntu package is older):
 
```bash
curl https://rclone.org/install.sh | sudo bash
rclone config
```
 
In `rclone config`, create two remotes:
 
1. **`re-cloudflare`**: type S3, provider Cloudflare, with an R2 API token that can only access the `<bucket>` bucket.
2. **`r2crypt`**: type `crypt`, wrapping `re-cloudflare:<bucket>`, with file-name encryption on. Save **both crypt passwords** in the password manager. Without them, the backups can't be read.
Check:
 
```bash
rclone lsd re-cloudflare:                         # the bucket is listed
rclone lsl r2crypt: | tail -n 5                   # readable names = decryption works
```
 
**Cron job:** `crontab -e` as <user> (not root, so rclone finds its config), and add:
 
```
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
15 3 * * * /bin/bash /srv/portfolio/deploy/backup.sh >> /srv/backups/backup.log 2>&1
```
 
- `PATH` because cron starts with an almost empty environment.
- `/bin/bash` so the job doesn't depend on the script's execute bit.
### 4.3 Checking that backups run
 
```bash
tail -n 20 /srv/backups/backup.log                       # last run ends with "done"
ls -l --time-style=full-iso /srv/backups | tail -n 3
rclone lsl r2crypt: | sort -k2,3 | tail -n 3             # the same files in R2
```
 
To run a backup by hand, the way cron does:
 
```bash
env -i HOME=/home/<user> PATH=/usr/bin:/bin /bin/bash /srv/portfolio/deploy/backup.sh
```
 
### 4.4 Restoring a backup
 
<!-- TODO: fill in after the restore test, with the commands that actually worked -->
 
1. Download a dump: `rclone copy r2crypt:db-YYYY-MM-DD-HHMM.sql.gz /tmp/restore/`
2. Check the archive: `gunzip -t /tmp/restore/db-*.sql.gz`
3. Load it into a **scratch** MySQL container (never the live one) and check the tables.
4. Restore uploads: `rclone copy r2crypt:files-YYYY-MM-DD-HHMM.tgz /tmp/restore/`, then unpack into the uploads volume.
---
 
## 5. Monitoring
 
- An external uptime monitor checks `https://andriguez.dev` and the API, and emails on downtime.
- To check the server from outside: `nmap -p 3306,8000 <server IP>` should show both ports closed.
---
 
## 6. Troubleshooting
 
| Problem | Where to look |
| --- | --- |
| Site down | `docker compose -f docker-compose.prod.yml ps`, then `logs --tail=100 <service>` |
| Backend errors | `docker compose -f docker-compose.prod.yml logs --tail=100 backend` |
| Backup didn't run | `tail /srv/backups/backup.log`; `grep CRON /var/log/syslog \| grep backup` |
| Locked out of SSH | Hetzner Cloud Console → server → Console (web terminal) |
<!-- TODO after WireGuard: add the WireGuard setup and how to get back in if the tunnel breaks -->
 