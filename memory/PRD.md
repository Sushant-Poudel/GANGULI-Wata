# GSN - Digital Goods E-Commerce Platform

## Original Problem Statement
Clone https://github.com/Sushant-Poudel/gangan repository - a premium digital goods e-commerce website.

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
- **Credentials**: gsnadmin / gsnadmin
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
- Staff management

## What's Been Implemented

### Feb 9, 2026
- ✅ Cloned entire repository from GitHub
- ✅ Backend and Frontend services running
- ✅ Added 1 product: Netflix Premium (4 pricing tiers)
- ✅ Added 1 payment method: eSewa with QR code
- ✅ Fixed babel plugin issue (disabled visual edits plugin)

## Current Data
- 1 Category: Streaming Services
- 1 Product: Netflix Premium (Rs 350 - Rs 3,200)
- 1 Payment Method: eSewa QR

## Pending Tasks / Backlog

### P0 - Critical
- Configure real eSewa QR code with merchant details
- Set up SMTP for email notifications

### P1 - High Priority  
- Add more products (Spotify, PUBG UC, Steam, etc.)
- Add customer reviews
- Configure Trustpilot sync

### P2 - Future
- Flash Sale functionality
- Bundle Deals section
- Loyalty/Rewards Program
- Order Tracking improvements
- Analytics Dashboard

## Key Files
- `/app/backend/server.py` - FastAPI main application
- `/app/backend/.env` - Backend environment variables
- `/app/frontend/src/App.js` - React router and providers
- `/app/frontend/src/pages/` - All page components
- `/app/frontend/src/components/` - UI components
