# راهنمای راه‌اندازی اولیه و استقرار بدون گیت‌هاب روی سرور `irVPS2-Linux`

این راهنما برای استقرار نسخه استاتیک فاز ۱ وب‌سایت **گروه صنعتی سپنتا** (`sepanta-web:phase1`) روی سرور لینوکسی Ubuntu 24.04 با منابع ۱ هسته CPU و ۲ گیگابایت رم تدوین شده است. در این معماری، بیلد کد و فشرده‌سازی دارایی‌ها در سیستم محلی انجام شده و تنها تصویر سبک Nginx Alpine (~30MB) به سرور منتقل می‌شود.

---

## ۱. تنظیم فایروال UFW روی سرور
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

---

## ۲. نصب Docker Engine و Docker Compose روی Ubuntu 24.04
در صورت محدودیت شبکه یا سرعت بهتر در سرورهای ایران، می‌توان از مخازن رسمی یا میرورهای معتبر داکر استفاده کرد:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg rsync

# نصب مخزن رسمی Docker (یا تنظیم میرور در /etc/docker/daemon.json)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"
```

---

## ۳. تنظیم Nginx میزبان (Reverse Proxy + SSL) یا اتصال مستقیم پورت
کانتینر `sepanta-web` به‌طور پیش‌فرض پورت `127.0.0.1:8080` یا `8080:80` را گوش می‌دهد. برای اتصال دامنه `sepanta-co.ir` با گواهی SSL رایگان Let's Encrypt:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

فایل `/etc/nginx/sites-available/sepanta-co`:

```nginx
server {
    listen 80;
    server_name sepanta-co.ir www.sepanta-co.ir;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

فعال‌سازی و صدور گواهی SSL:

```bash
sudo ln -sf /etc/nginx/sites-available/sepanta-co /etc/nginx/sites-enabled/sepanta-co
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d sepanta-co.ir -d www.sepanta-co.ir
```

---

## ۴. ایجاد مخزن پشتیبان Bare Git روی سرور (بدون نیاز به GitHub)
```bash
sudo mkdir -p /srv/git/sepanta-co.git
sudo chown -R "$USER":"$USER" /srv/git/sepanta-co.git
git init --bare /srv/git/sepanta-co.git
```

در سیستم محلی خودتان برای افزودن مخزن پشتیبان:
```bash
git remote add vps ssh://<VPS_USER>@<VPS_HOST>/srv/git/sepanta-co.git
git push vps main
```

---

## ۵. اجرای استقرار خودکار با `scripts/deploy-vps.sh`
روی سیستم محلی (پس از اطمینان از عبور `npm run build` و `npm run audit:phase1`):

```bash
VPS_USER=<ssh-user> VPS_HOST=<vps-ip-or-domain> ./scripts/deploy-vps.sh
```

این اسکریپت تصویر `sepanta-web:phase1` را بیلد کرده، به فایل فشرده `.tar.gz` تبدیل و از طریق `rsync` منتقل می‌کند، کانتینر را با `docker compose up -d --remove-orphans` راه‌اندازی مجدد کرده، `/healthz` را تست می‌کند و ایمیج‌های بلااستفاده را پاکسازی می‌نماید.
