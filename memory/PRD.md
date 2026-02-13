# YoBroChat - Product Requirements Document

## Original Problem Statement
Clone the GitHub repository https://github.com/Sushant-Poudel/yobrochat 1:1 without testing.

## Credentials Provided
- ImgBB API: a7b8503e59593528f8cd58121653a4b2
- SMTP Gmail: gameshopnepal.buy@gmail.com
- SMTP App Password: bwut bhem tnoq epdb

## Tech Stack
- **Backend**: Python FastAPI + MongoDB
- **Frontend**: React 19 with Tailwind CSS, Radix UI components
- **Services**: Email (SMTP), Image upload (ImgBB), Google Drive/Sheets integration

## What's Been Implemented
- [2026-02-13] Full repository clone completed
- [2026-02-13] Analytics dashboard rework with dropdown time filters
- [2026-02-13] Customer order/spending aggregation fix
- [2026-02-13] Debug alerts removed from customer login
- [2026-02-13] Social links fix (backend + frontend)
- [2026-02-13] Complete credit system (admin settings, customer balance, checkout integration)
- [2026-02-13] Email OTP fix (SMTP_EMAIL env variable)
- [2026-02-13] "Login to use credits" button fix for guest users
- [2026-02-13] **Checkout form pre-fill for logged-in customers** - Both CheckoutPage.jsx and ProductPage.jsx order dialog now display user info as read-only instead of input fields
- [2026-02-13] **Store Credits in Product Page** - Added complete store credits section to ProductPage.jsx order dialog (was missing)
- [2026-02-13] **Auto credit award on order completion** - Credits are automatically awarded to customers when admin marks order as "Completed"
- [2026-02-13] **Customer phone in admin panel** - Phone numbers from orders are now shown in admin customer list
- [2026-02-13] **Fixed "Failed to load account data" error** - Removed duplicate get_current_customer function causing token validation issues
- [2026-02-13] **Deferred credit deduction** - Credits are only deducted when order is "Confirmed", not when placed. If total is Rs 0 (fully paid with credits), customer is redirected to WhatsApp directly without payment page

## Core Features (from cloned repo)
- E-commerce platform (GameShop Nepal)
- Admin dashboard with analytics, products, orders, customers management
- Customer authentication and account management
- Cart, checkout, payment processing
- Blog, FAQ, About pages
- Newsletter management
- Promo codes and flash sales
- Store credits system with cashback

## Prioritized Backlog
- P0: None (all requested features complete)
- P1: Additional enhancements as requested
- P2: Customize for specific needs

## Next Tasks
- None currently pending - awaiting user requests

## Admin Credentials
- Username: gsnadmin
- Password: gsnadmin
