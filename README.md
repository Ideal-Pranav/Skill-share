# 🎓 Skill-Sharing Platform

A modern, full-featured skill-sharing application where users can connect, learn, and teach various skills. Built with cutting-edge web technologies for a seamless user experience.

## ✨ Features

### 🔐 Authentication & User Management
- Secure authentication with Supabase Auth
- Role-based access (Learner, Mentor, Dual, Admin)
- User profile management with avatars and bios
- Profile verification system with trust scores

### 📚 Skill Management
- Browse and discover thousands of skills
- Skill difficulty levels (Beginner to Expert)
- Categorized skill organization
- Teaching and learning skill tracking

### 👥 Mentorship System
- Mentor profiles with expertise and experience levels
- Hourly rates and certifications
- Mentor discovery and filtering
- Direct messaging between users

### 📅 Session Management
- Create and book learning sessions
- One-time and recurring session support
- Session types for different learning styles
- Status tracking (pending, confirmed, completed, cancelled)
- Video meeting links and location-based sessions

### 💬 Real-time Messaging
- Conversation management
- Direct messaging with mentors/learners
- Message read receipts
- Organized conversation history

### ⭐ Reviews & Ratings
- Rate mentors and learners after sessions
- Detailed review feedback
- Trust score calculation based on reviews
- Visible review management

### 📊 Dashboard & Analytics
- Personalized dashboard with stats
- Session history
- Upcoming sessions
- Notifications and alerts
- Performance metrics

### 🎨 UI/UX Features
- Dark/Light theme support with system preference detection
- Responsive design (Mobile, Tablet, Desktop)
- Smooth animations and transitions
- Accessibility features
- Toast notifications

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router with Turbopack)
- **React**: 19.2.0 with Server Components
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: Supabase Auth with Row-Level Security
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com) + Radix UI
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toast Notifications**: Sonner
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router pages
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── auth/                     # Authentication routes
│   ├── dashboard/                # User dashboard
│   ├── explore/                  # Skill discovery
│   ├── mentors/                  # Mentor profiles
│   ├── sessions/                 # Session management
│   ├── skills/                   # Individual skill pages
│   ├── messages/                 # Messaging
│   ├── profile/                  # User profile
│   ├── admin/                    # Admin panel
│   ├── onboarding/               # User onboarding
│   └── cities/                   # City pages
├── components/
│   ├── layout/                   # Layout components (navbar, sidebar)
│   ├── ui/                       # Shadcn UI components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard components
│   ├── explore/                  # Explore page components
│   ├── mentors/                  # Mentor components
│   ├── sessions/                 # Session components
│   ├── skills/                   # Skill components
│   ├── messages/                 # Messaging components
│   ├── profile/                  # Profile components
│   ├── onboarding/               # Onboarding components
│   └── admin/                    # Admin components
├── hooks/
│   └── use-mobile.ts             # Mobile device detection
├── lib/
│   ├── supabase/                 # Supabase client & server setup
│   ├── context/                  # React context providers
│   ├── types/                    # TypeScript type definitions
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions
├── middleware.ts                 # Next.js middleware for auth
└── public/                       # Static assets
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 20.x or higher
- **npm**: Latest version (or pnpm/yarn)
- **Git**: For version control
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Ideal-Pranav/Skill-share.git
cd Skill-share
```

### 2. Install Dependencies

```bash
npm install
```

Or with pnpm/yarn:
```bash
pnpm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to get these values:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select or create a project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon (public) key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

The development server uses Turbopack for lightning-fast compilation and supports hot module replacement (HMR) for instant feedback.

## 📦 Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm start

# Run ESLint for code quality
npm run lint
```

## 🧪 Demo Credentials

Test the application with these demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Learner & Mentor | fiyah69289@pazuric.com | password@123 |

Use this account to explore all features including booking sessions, messaging, and viewing dashboards.

## 🌐 Deployment on Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com), the creators of Next.js.

### Prerequisites
- ✅ GitHub account with repository created
- ✅ Vercel account (signup free at [vercel.com](https://vercel.com))
- ✅ Supabase project with credentials

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Orchids Skill-Sharing Platform"

# Add the GitHub repository as remote
git remote add origin https://github.com/Ideal-Pranav/Skill-share.git

# Set main branch and push
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

#### Option A: Dashboard Deployment (Recommended for Beginners)

1. Visit [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Select the **Skill-share** repository
4. Vercel auto-detects Next.js configuration ✨
5. Click **"Configure Project"** (optional, usually not needed)
6. Click **"Environment Variables"** and add:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://xxx.supabase.co`
   - Click **"Add"**
   - Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click **"Deploy"** button
8. Wait for deployment to complete (2-3 minutes)
9. Your live URL will be provided

#### Option B: CLI Deployment (Faster)

```bash
# Install Vercel CLI globally (one time only)
npm install -g vercel

# Deploy from project root
vercel --prod
```

Follow the interactive prompts:
- Link to existing Vercel project or create new
- Confirm project settings (Next.js, Node 20)
- Add environment variables when prompted
- Deployment begins automatically

### Step 3: Configure Environment Variables on Vercel

After initial deployment, add/update environment variables:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **Skill-share** project
3. Navigate to **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add two variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL` → **Value**: Your Supabase URL
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Value**: Your Supabase Anon Key
6. Click **"Save"**
7. The application automatically redeploys with new variables

### Vercel Features Utilized

- ⚡ **Turbopack**: Ultra-fast builds (10x faster than webpack)
- 🚀 **Automatic Deployments**: Deploy on every GitHub push
- 👀 **Preview URLs**: Automatic preview for pull requests
- 🔄 **Fast Refresh**: Instant code updates during development
- 🌍 **Global CDN**: Automatic content distribution worldwide
- 🔒 **HTTPS**: All domains get automatic SSL certificates
- ♻️ **Automatic Rollbacks**: Quick revert if deployment fails

### Monitoring Your Deployment

Visit your Vercel dashboard to:
- View deployment history
- Check build logs and analytics
- Configure custom domains
- Manage environment variables
- View performance metrics

## 🔒 Security Best Practices

- ✅ Never commit `.env.local` or private keys (`.gitignore` prevents this)
- ✅ Use `NEXT_PUBLIC_` prefix only for client-safe keys
- ✅ Supabase Row-Level Security (RLS) enforces database access control
- ✅ Authentication tokens securely managed by Supabase
- ✅ Sensitive data stored server-side only

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Vercel Docs**: https://vercel.com/docs
- **Turbopack**: https://turbo.build/pack

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. Create a **feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a **Pull Request** with a description of changes

### Development Guidelines
- Follow existing code style
- Test changes before submitting PR
- Update documentation if needed
- Keep commits focused and atomic

## 📄 License

This project is private. All rights reserved to Ideal-Pranav.

## 💡 Troubleshooting

### Issue: Build fails on Vercel
- **Solution**: Check environment variables are correctly set in Vercel dashboard
- Verify Supabase URL and keys are valid
- Check build logs in Vercel for specific errors

### Issue: 404 errors on dynamic routes
- **Solution**: Ensure `.env.local` is set in development
- Restart dev server after changing environment variables

### Issue: Supabase connection errors
- **Solution**: Verify project is running and healthy in Supabase dashboard
- Check network connectivity
- Confirm NEXT_PUBLIC_SUPABASE_URL is correct

### Issue: Authentication not working
- **Solution**: Clear browser cache and cookies
- Check user exists in Supabase Authentication section
- Verify RLS policies are set correctly

For more issues, check [GitHub Issues](https://github.com/Ideal-Pranav/Skill-share/issues).

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Ideal-Pranav/Skill-share/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ideal-Pranav/Skill-share/discussions)
- **Demo Email**: fiyah69289@pazuric.com

## 🎉 Acknowledgments

- [Vercel](https://vercel.com) for Next.js and excellent hosting
- [Supabase](https://supabase.com) for real-time database and auth
- [Shadcn/ui](https://ui.shadcn.com) for beautiful component library
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- All open-source contributors and the community

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**
