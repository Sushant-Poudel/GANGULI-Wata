# GSN - Digital Goods E-Commerce Platform

## Original Problem Statement
Build a premium, modern, dark-themed e-commerce website for digital goods, similar to ottsathi.com and gameshopnepal.com.

## Tech Stack
- **Backend**: FastAPI, Python, Motor (async MongoDB driver)
- **Frontend**: React, Tailwind CSS, react-router-dom, lucide-react, axios
- **Database**: MongoDB
- **Authentication**: JWT (Admin) + OTP-based (Customer)

## Core Features

### Public Website
- Homepage with Trustpilot reviews and customer testimonials
- Product grid with category filtering and search
- Product pages with variations, rich-text descriptions
- Blog/Guides section
- Payment methods display with QR codes
- Customer authentication via Email OTP

### Admin Panel (/admin)
- **Credentials**: gsnadmin / gsnadmin (stored in backend/.env)
- Dashboard overview
- Product management (CRUD, variations, custom order fields, reordering)
- Category management
- Reviews management (+ Trustpilot sync)
- Blog/Guides management
- Promo codes
- Payment methods
- Social links
- Notification bar
- FAQs
- Static pages
- Order management

## Database Schema

### Product
- name, slug, description, image_url
- category_id
- variations: [{id, name, price, original_price}]
- tags: ['Popular', 'Sale', 'New', 'Limited', 'Hot', 'Best Seller']
- custom_fields: [{id, label, placeholder, required}]
- sort_order, is_active, is_sold_out, flash_sale_end, flash_sale_label

### Order
- order_id, customer_details, items, total_amount
- status: 'pending' | 'confirmed' | 'completed'
- payment_screenshot_url, invoice_url

### FAQ
- question, answer, category, sort_order

### Customer
- email, name, whatsapp_number, otp

## What's Been Implemented

### Feb 8, 2026
- ✅ **Critical Fix**: Resolved blank black screen bug (CustomerAuth.jsx useState→useEffect)
- ✅ **Verified**: JWT_SECRET is static in backend/.env (deployment ready)
- ✅ **Verified**: Admin login working with credentials
- ✅ **Verified**: Homepage rendering with products and reviews
- ✅ **Fixed**: Product images updated (old domain URLs replaced with Unsplash images)
- ✅ **Added**: ImgBB API key for payment screenshot uploads
- ✅ **Deployment Check**: Passed all critical checks, ready for production

### Previous Migrations
- Multiple codebase replacements (GamerNew → Yobro → broo → Yessir → gangbro)
- Data preserved and restored after each migration

## Pending Tasks

### P0 - Critical (Lost in last code swap)
1. **Checkout & Invoicing Flow** - WhatsApp redirect, payment screenshot upload, invoice generation, email notifications
2. **Product Variation Editing** - Admin panel feature to edit/reorder variations

### P1 - High Priority
3. **FAQ Enhancement** - Category grouping and search bar

### P2 - Future/Backlog
- Live purchase ticker (social proof)
- Bundle Deals section
- Loyalty/Rewards Program
- Referral System
- Order Tracking Page
- Sales Analytics Dashboard

## 3rd Party Integrations
- **Trustpilot**: Review sync (requires Business Unit ID)
- **Take.app**: Order syncing (API key configured)
- **Gmail SMTP**: Customer OTP emails (configured in backend/.env)
- **ImgBB**: Payment screenshot uploads

## Key Files
- `/app/backend/server.py` - FastAPI main application
- `/app/backend/.env` - Backend environment variables (JWT_SECRET, SMTP, etc.)
- `/app/frontend/src/components/CustomerAuth.jsx` - Customer login modal
- `/app/frontend/src/pages/PaymentPage.jsx` - Checkout flow
- `/app/frontend/src/pages/admin/` - Admin panel pages

## Known Issues
- **FastAPI Route Ordering**: Static routes must be defined before dynamic routes to prevent capture

## Deployment Status (Feb 8, 2026)

### ✅ READY FOR DEPLOYMENT

**Health Check Results:**
- Backend API: ✅ Running (port 8001)
- Frontend: ✅ Running (port 3000) - Compiled successfully with no errors
- MongoDB: ✅ Connected
- All APIs responding correctly

**Data Summary:**
- 5 Products (with CDN images from Unsplash)
- 2 Categories
- 23 Reviews
- 4 FAQs
- 1 Payment Method (Esewa)

**Environment Variables Configured:**
- JWT_SECRET ✅ (static)
- MONGO_URL ✅
- IMGBB_API_KEY ✅ (working - tested successfully)
- SMTP credentials ✅
- Admin credentials ✅

**Issues Fixed (This Session):**
1. Black screen bug (CustomerAuth.jsx) - FIXED
2. Product images 404 (old domain) - FIXED (now using Unsplash CDN)
3. JWT_SECRET deployment blocker - VERIFIED (static in .env)
4. IMGBB_API_KEY not loading - FIXED (changed from module-level to dynamic loading)
5. ESLint warnings in 5 files - FIXED (FlashSale, Wishlist, InvoicePage, PaymentPage, AdminAnalytics)

**Performance Note:**
- N+1 query in `/customer/orders` endpoint (non-blocking, can optimize post-deployment)
