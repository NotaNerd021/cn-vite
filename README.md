**تغییرات نسبت به نسخه اصلی :**

- حذف زبان های عربی ، روسی و چینی
  - حذف کلاینت اپلیکیشن های flclash ، v2box و سینگ باکس
  - اضافه شدن کلاینت اپلیکیشن Happ برای آیفون و IOS
  - تغییر رنگ پوسته
  - حذف بازه زمانی ۶ ماه و یک سال از چارت مصرف صفحه ساب
  - ویرایش فایل های ترجمه زبان انگلیسی و فارسی


## مراحل نصب

### مرزبان

۱. **قالب رو با دستور زیر دانلود کنید**
   ```sh
   sudo wget -N -P /var/lib/marzban/templates/subscription/ https://github.com/MatinDehghanian/CNsubscribtion/releases/latest/download/index.html
   ```

۲. **دستورات زیر رو تو ترمینال سرورتون بزنید**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzban/templates/"' | sudo tee -a /opt/marzban/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /opt/marzban/.env
   ```
   یا مقادیر زیر رو در فایل `.env` در پوشه `/opt/marzban` با پاک کردن `#` اول آنها از حالت کامنت در بیارید.
   ```
   CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzban/templates/"
   SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
   ```

۳. **ریستارت کردن مرزبان**
   ```sh
   marzban restart
   ```

### مرزنشین

۱. **قالب رو با دستور زیر دانلود کنید**
   ```sh
   sudo wget -N -P /var/lib/marzneshin/templates/subscription/ https://github.com/MatinDehghanian/CNsubscribtion/releases/latest/download/index.html
   ```

۲. **دستورات زیر رو تو ترمینال سرورتون بزنید**
   ```sh
   echo 'CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzneshin/templates/"' | sudo tee -a /etc/opt/marzneshin/.env
   echo 'SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"' | sudo tee -a /etc/opt/marzneshin/.env
   ```
   یا مقادیر زیر رو در فایل `.env` در پوشه `/etc/opt/marzneshin` با پاک کردن `#` اول آنها از حالت کامنت در بیارید.
   ```
   CUSTOM_TEMPLATES_DIRECTORY="/var/lib/marzneshin/templates/"
   SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
   ```

۳. **ریستارت کردن مرزنشین**
   ```sh
   marzneshin restart
   ```
