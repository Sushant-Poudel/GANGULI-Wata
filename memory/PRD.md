# GSN - Digital Goods E-Commerce Platform

## Original Problem Statement
Build a premium, modern, dark-themed e-commerce website for digital goods, similar to ottsathi.com and gameshopnepal.com.

## Tech Stack
- **Backend**: FastAPI, Python, Motor (async MongoDB driver)
- **Frontend**: React, Tailwind CSS, react-router-dom, lucide-react, axios
- **Database**: MongoDB
- **Authentication**: JWT (hardcoded credentials - needs migration to env vars)

## Core Features

### Public Website
- Homepage with customer reviews in sliding marquee
- Product grid with category filtering and search
- Product pages with variations, rich-text descriptions
- Blog/Guides section
- Payment methods display
- Trust & Safety section

### Admin Panel (/admin)
- **Credentials**: gsnadmin / gsnadmin (needs to move to env vars)
- Dashboard overview
- Product management (CRUD, variations, custom order fields, reordering)
- Category management
- Reviews management
- Blog/Guides management
- Promo codes
- Payment methods
- Social links
- Notification bar
- FAQs
- Static pages
- Take.app integration (view 10 most recent orders)

## Database Schema

### Product
- name, slug, description, image_url
- category_id
- variations: [{id, name, price, original_price}]
- tags: ['Popular', 'Sale', 'New', 'Limited', 'Hot', 'Best Seller']
- custom_fields: [{id, label, placeholder, required}]
- sort_order, is_active, is_sold_out

### Category
- name, slug, image_url

### Review
- customer_name, review_text, rating, created_at

### BlogPost
- title, slug, content, excerpt, image_url, is_published, created_at

## What's Been Implemented

### Feb 1, 2026
- **Product Card Styling**: Added visible border outline and green glow/shadow effect on hover
- **Admin Variant Editing**: Added ability to edit and reorder product variations in admin panel

### Previous Work
- Codebase migrated from gamerbolte/GamerNew repository
- Take.app integration (view recent orders)
- Customizable order forms per product
- Blog page bug fixes (route ordering, ObjectId serialization)
- Review management fixes (permanent deletion)
- UI/UX improvements (scrollable best sellers, iOS zoom fix, etc.)
- Site-wide search bar

## Pending Issues

### P0 - Deployment Blockers
1. Hardcoded admin credentials in server.py → Move to ADMIN_USERNAME/ADMIN_PASSWORD env vars
2. .env files not in .gitignore → Security risk
3. Bloated requirements.txt → Clean unused AI/ML dependencies

### P1 - Feature Requests
- (None currently)

### P2 - Stability
- Full admin panel regression test needed

## Future/Backlog
- Recent purchases ticker (social proof)
- Flash sales/promotional banners
- Combo deals section
- Analytics dashboard

## 3rd Party Integrations
- **Take.app**: REST API for viewing orders (requires TAKE_APP_API_KEY in backend/.env)

## Key Files
- `/app/backend/server.py` - FastAPI main application
- `/app/backend/.env` - Backend environment variables
- `/app/frontend/src/lib/api.js` - Axios API client
- `/app/frontend/src/pages/admin/` - Admin panel pages
- `/app/frontend/src/components/ProductCard.jsx` - Product card component

## Known Issues
- **FastAPI Route Ordering**: Static routes must be defined before dynamic routes to prevent capture
