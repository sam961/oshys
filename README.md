# Oshys CMS

A modern, multilingual Content Management System built with Laravel 12 and React + TypeScript.

## Features

- **Multilingual Support**: Built-in English and Arabic support with easy language switching
- **Admin Panel**: Comprehensive admin dashboard for content management
- **Content Modules**:
  - Products & Courses
  - Blog Posts
  - Events & Trips
  - Team Members
  - Banners
  - Dynamic Settings
- **Modern Stack**: Laravel 12 backend + React 18 with TypeScript frontend
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **RESTful API**: Clean API architecture for frontend-backend communication

## Tech Stack

### Backend
- Laravel 12
- PHP 8.2+
- MySQL Database
- RESTful API

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- i18next (Internationalization)

## Quick Start

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL database

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sam961/oshys.git
   cd oshys
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database** in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations**
   ```bash
   php artisan migrate
   ```

6. **Build frontend assets**
   ```bash
   npm run build
   ```

7. **Start development server**
   ```bash
   php artisan serve
   npm run dev
   ```

Visit: http://localhost:8000

## Deployment

### Deploy to Bluehost via FTP

For step-by-step deployment instructions using FTP (recommended for Bluehost shared hosting):

📖 **[FTP Deployment Guide for Mac](docs/FTP_DEPLOYMENT_MAC.md)**

This guide covers:
- Setting up FileZilla or Cyberduck
- Uploading files via FTP
- Post-upload configuration
- Database setup
- Running the automated setup script

### Deploy via GitHub + SSH

If you have SSH access to your server:

📖 **[GitHub Deployment Guide](docs/GITHUB_DEPLOYMENT.md)**

### General Deployment Reference

For comprehensive deployment options and troubleshooting:

📖 **[Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**

## Project Structure

```
oshys/
├── app/                      # Laravel application code
│   ├── Http/Controllers/    # API controllers
│   ├── Models/              # Database models
│   └── Traits/              # Reusable traits (Translatable)
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── public/                  # Public assets
│   ├── build/               # Compiled frontend assets
│   └── locales/             # Translation files (en, ar)
├── resources/
│   ├── js/                  # React application
│   │   ├── admin/           # Admin panel components
│   │   ├── components/      # Frontend components
│   │   ├── pages/           # Page components
│   │   └── i18n/            # Internationalization config
│   └── views/               # Laravel blade views
├── routes/
│   ├── api.php              # API routes
│   └── web.php              # Web routes
└── docs/                    # Documentation
```

## API Endpoints

All API endpoints are prefixed with `/api` and support localization via `?lang=en|ar` query parameter.

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get single course
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Blog Posts
- `GET /api/blog-posts` - List all blog posts
- `GET /api/blog-posts/{id}` - Get single post
- `POST /api/blog-posts` - Create post
- `PUT /api/blog-posts/{id}` - Update post
- `DELETE /api/blog-posts/{id}` - Delete post

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Trips
- `GET /api/trips` - List all trips
- `GET /api/trips/{id}` - Get single trip
- `POST /api/trips` - Create trip
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip

### Other Endpoints
- `GET /api/banners` - List banners
- `GET /api/team-members` - List team members
- `GET /api/categories` - List categories
- `GET /api/settings` - Get site settings

## Multilingual System

The CMS supports content in multiple languages through a flexible translation system:

- **Frontend translations**: Located in `public/locales/{lang}/`
- **Database translations**: Stored in `translations` table
- **Models**: Use the `Translatable` trait for automatic translation handling
- **Language switcher**: Built-in UI component for users to switch languages

### Adding a New Language

1. Create translation files in `public/locales/{lang}/`:
   - `common.json` - Common UI strings
   - `admin.json` - Admin panel strings

2. Update `resources/js/i18n/config.ts` to include the new language

3. Database content will automatically support the new language

## Development

### Commands

```bash
# Start dev server
php artisan serve

# Watch frontend changes
npm run dev

# Build for production
npm run build

# Run tests
php artisan test

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## License

This project is proprietary software. All rights reserved.

## Support

For deployment issues and technical support, refer to the documentation in the `docs/` folder.
