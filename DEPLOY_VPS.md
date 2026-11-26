# راهنمای راه‌اندازی و استقرار امن فاز ۲ روی سرور `irVPS2-Linux`

این راهنما برای استقرار نسخه داینامیک فاز ۲ وب‌سایت **گروه صنعتی سپنتا** (`sepanta-app:phase2` + `sepanta-proxy` با دیتابیس SQLite WAL) روی سرور Ubuntu 24.04 (۱ هسته CPU، ۲ گیگابایت رم، ۴۰ گیگابایت SSD و ۵۰ گیگابایت فضای پشتیبان) تهیه شده است.

---

## ۱. تنظیم فایروال UFW و نصب Docker Engine
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg rsync nginx certbot python3-certbot-nginx
```
(در صورت نیاز، Docker Engine و پلاگین `docker-compose-plugin` را از مخزن رسمی یا میرور معتبر نصب کنید.)

---

## ۲. تنظیم متغیرهای محیطی و امنیت سشن ادمین (`.env`)
روی سرور در مسیر `/opt/sepanta-co/.env`، فایل `.env.example` را کپی کرده و مقادیر واقعی را تنظیم کنید:

```bash
cd /opt/sepanta-co
cp .env.example .env
chmod 600 .env
```

تولید `SESSION_SECRET` قدرتمند (حداقل ۶۴ کاراکتر هگز):
```bash
openssl rand -hex 32
```

**الزامات مهم در `.env` تولیدی (پشت HTTPS):**
- `ADMIN_USERNAME` و `ADMIN_PASSWORD` قوی و غیرقابل‌حدس تعیین شوند.
- `SESSION_SECRET` خروجی دستور `openssl rand -hex 32` باشد.
- `COOKIE_SECURE=true` تنظیم شود تا کوکی سشن ادمین فقط روی HTTPS ارسال گردد.
- در صورت فعال‌سازی پیامک (`SMS_PROVIDER=kavenegar` یا `smsir`)، کلید `SMS_API_KEY` و شماره فروش کارخانه (`FACTORY_SALES_PHONE`) را تکمیل کنید.

---

## ۳. تنظیم Nginx میزبان (Reverse Proxy + SSL)
فایل `/etc/nginx/sites-available/sepanta-co`:

```nginx
server {
    listen 80;
    server_name sepanta-co.ir www.sepanta-co.ir;

    client_max_body_size 15m;

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

## ۴. اجرای استقرار بدون گیت‌هاب از سیستم محلی
```bash
VPS_USER=<ssh-user> VPS_HOST=<vps-ip-or-domain> ./scripts/deploy-vps.sh
```
این اسکریپت قبل از جایگزینی سرویس، در صورت فعال‌بودن `sepanta-app` نسخه پشتیبان آنلاین از SQLite می‌گیرد و بدون پاک‌کردن ولوم‌های `sepanta_data` و `sepanta_uploads` کانتینرها را بروزرسانی می‌کند.

---

## ۵. پشتیبان‌گیری شبانه SQLite روی فضای ۵۰ گیگابایتی
در `crontab -e` سرور، اجرای خودکار بکاپ شبانه (ساعت ۰۳:۱۵ بامداد) و انتقال به فضای پشتیبان (مثلاً `/mnt/backup/sepanta`):

```cron
15 3 * * * cd /opt/sepanta-co && ./scripts/backup-sqlite.sh && mkdir -p /mnt/backup/sepanta && cp -f ./backups/sepanta-*.db.gz /mnt/backup/sepanta/ && find ./backups -type f -name "*.db.gz" -mtime +7 -delete
```
