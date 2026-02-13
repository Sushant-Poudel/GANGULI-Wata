# GSN - GameShop Nepal E-Commerce Platform

## Original Problem Statement
Build a premium, dark-themed e-commerce website for digital goods (GameShop Nepal).

## Latest Repository
Cloned from: https://github.com/gamerbolte/ganguli (Feb 13, 2026)

## Tech Stack
- **Backend**: Python FastAPI + MongoDB (Motor async driver)
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Database**: MongoDB
- **Authentication**: JWT (Admin) + OTP-based (Customer)

## What's Been Implemented

### Feb 13, 2026 - Bug Fixes
- ✅ Fixed duplicate `hash_password` function
- ✅ Fixed duplicate `CustomerProfile` class (renamed to `CustomerProfileUpdate`)
- ✅ Fixed bare `except` clause (changed to `except Exception`)
- ✅ Fixed unused `formatted_phone` variable (now used in order creation)
- ✅ Fixed sitemap missing categories (added category URLs)
- ✅ All APIs verified working

### Previous Fixes
- ✅ Numbers rounded to integers (no decimals like Rs 873.86)
- ✅ Profit analytics fixed (case-insensitive status matching)
- ✅ Customer order status display fixed
- ✅ Multiple QR codes support for payment methods
- ✅ Staff permissions system
- ✅ Google Sheets integration moved to env vars

## Core Features
- Homepage with products, reviews, Trustpilot integration
- Product pages with variations, custom fields
- Admin dashboard with analytics, orders, products management
- Customer authentication (Email OTP)
- Store credits system
- Promo codes
- Blog/FAQ pages
- Payment screenshot upload (ImgBB)
- WhatsApp order redirect

## Admin Credentials
- **URL**: /admin/login
- **Username**: gsnadmin
- **Password**: gsnadmin

## Environment Variables (backend/.env)
- MONGO_URL, DB_NAME
- JWT_SECRET (static)
- ADMIN_USERNAME, ADMIN_PASSWORD
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
- IMGBB_API_KEY
- GOOGLE_SERVICE_ACCOUNT_JSON
- GOOGLE_SHEETS_SPREADSHEET_ID
- TAKEAPP_API_KEY

## API Endpoints Status
- ✅ /api/products - Working
- ✅ /api/categories - Working
- ✅ /api/reviews - Working
- ✅ /api/payment-methods - Working
- ✅ /api/faqs - Working
- ✅ /api/blog - Working
- ✅ /api/orders - Working (auth required)
- ✅ /api/analytics/overview - Working
- ✅ /api/analytics/profit - Working
- ✅ /api/sitemap.xml - Working

## Data Summary
- Products: 5
- Categories: 2
- Reviews: 23
- Orders: 21
- FAQs: 4
- Payment Methods: 1

## Known Minor Issues (Non-blocking)
- 2 unused variables in server.py (credits_used, credits_awarded) - cosmetic only

## Next Tasks
- Deploy the application
- Set cost prices on products for profit tracking
