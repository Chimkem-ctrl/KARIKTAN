# KARIKTAN
### Web-based E-Commerce Platform for Philippine Leather Crafts

IT323 — Application Development and Emerging Technologies  
University of Science and Technology of Southern Philippines — Cagayan de Oro City Campus  
March 2026

---

## About

KARIKTAN (Filipino for *beauty and elegance*) is a web-based marketplace dedicated to 
Philippine leather crafts — bags, shoes, wallets, pouches, and jackets — connecting 
local artisans with buyers nationwide.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Python + Django REST Framework |
| Database | PostgreSQL + pgAdmin 4 |
| Authentication | Django Sessions |
| Payments | Stripe (test mode) |
| Styling | Custom CSS + Google Fonts |

---

## Features

**Buyer**
- Register and log in
- Browse products by category (Bags, Shoes, Wallets, Pouches, Jackets)
- View product details and add to cart
- Checkout with shipping and payment details
- View order history and track status
- Download/print order invoices
- Submit and manage customer inquiries
- Edit profile, upload profile picture, save card details

**Admin**
- Secure admin-only dashboard
- Product management — add, edit, delete with image upload
- Order management — view and update order status
- Customer inquiry management — reply and close tickets
- Registered user overview (data masked for privacy)
- Sales analytics and revenue overview
- View all order invoices

---

## Project Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- pgAdmin 4

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/KARIKTAN.git
cd KARIKTAN
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install django djangorestframework django-cors-headers pillow python-dotenv psycopg2-binary stripe
```

### 3. Create environment file
Create `backend/.env`:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=kariktan_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

### 4. Run migrations
```bash
python manage.py makemigrations users
python manage.py makemigrations products
python manage.py makemigrations orders
python manage.py makemigrations inquiries
python manage.py migrate
```

### 5. Create admin user
```bash
python manage.py shell
```
```python
from users.models import User
admin = User.objects.create_superuser(username='admin', email='admin@gmail.com', password='123admin')
admin.role = 'admin'
admin.save()
exit()
```

### 6. Frontend setup
```bash
cd frontend
npm install
```

### 7. Run the project
```bash
# Terminal 1 — Backend
cd backend
python manage.py runserver

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173**

---

## Team

| Name | Role |
|------|------|
| Samantha Grace Griño | Developer |
| John Michael Armero | Developer |
| Val Samuel Barcubero | Developer |
| John Lawrence Bongolto | Developer |

**Instructor:** Arlene A. Baldelovar, MAEd, MIT

---

## License

This project was developed for academic purposes under IT323 — Application Development 
and Emerging Technologies at USTP-CDO.