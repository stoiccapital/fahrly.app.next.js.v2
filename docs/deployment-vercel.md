# Vercel Deployment Guide for Fahrly v2

This guide walks you through deploying Fahrly v2 to Vercel.

## Prerequisites

Before starting, ensure you have:

- ✅ Repository pushed to GitHub, GitLab, or Bitbucket
- ✅ Vercel account created ([vercel.com](https://vercel.com))
- ✅ Node.js 18+ installed locally (for testing builds)

## Step-by-Step Deployment

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"** or **"New Project"**
3. Import your repository from your Git provider (GitHub/GitLab/Bitbucket)
4. Select the `fahrly.app.next.js.v2` repository

### 2. Configure Project Settings

Vercel should automatically detect Next.js. Verify these settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (project root)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default, don't change)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x or 20.x (LTS recommended)

### 3. Environment Variables

Currently, Fahrly v2 uses mock data and **does not require environment variables**.

If you need to add environment variables in the future:

1. In the Vercel project settings, go to **Settings** → **Environment Variables**
2. Add variables from `.env.example` (if any)
3. Use the following naming:
   - `NEXT_PUBLIC_*` for variables accessible in the browser
   - Regular names for server-only variables
4. Add variables for all environments (Production, Preview, Development)

**Important**: Never commit actual secrets to the repository. Always use Vercel's environment variable interface.

### 4. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (typically 2-5 minutes)
3. Vercel will show build logs in real-time

### 5. After Deployment

Once deployment succeeds:

- **Production URL**: You'll receive a production URL like `fahrly-v2.vercel.app`
- **Preview Deployments**: Every push to non-main branches creates a preview URL
- **Custom Domain**: Add your domain in **Settings** → **Domains**

### 6. Promote Preview to Production

If you want to promote a preview deployment:

1. Go to the **Deployments** tab
2. Find the preview deployment you want to promote
3. Click the **"..."** menu → **"Promote to Production"**

## Common Issues

### Missing Environment Variables

**Symptom**: Build fails with "process.env.X is undefined" or runtime errors

**Solution**: 
- Check `.env.example` for required variables
- Add missing variables in Vercel **Settings** → **Environment Variables**
- Redeploy after adding variables

### Type Errors During Build

**Symptom**: `npm run build` fails with TypeScript errors

**Solution**:
- Run `npm run build` locally first to catch errors
- Fix TypeScript errors before pushing
- Ensure `tsconfig.json` is properly configured
- Check that all imports are correct

### Incorrect Node Version

**Symptom**: Build fails with Node version errors

**Solution**:
- Vercel uses Node.js 18.x or 20.x by default (LTS)
- If you need a specific version, add `engines` to `package.json`:
  ```json
  {
    "engines": {
      "node": ">=18.0.0"
    }
  }
  ```

### Build Timeout

**Symptom**: Build exceeds time limit

**Solution**:
- Check for large dependencies or slow build steps
- Optimize images and assets
- Consider using Vercel's build cache
- Check build logs for bottlenecks

### Module Not Found Errors

**Symptom**: Build fails with "Cannot find module" errors

**Solution**:
- Ensure all dependencies are in `package.json` (not just `package-lock.json`)
- Run `npm install` locally to verify
- Check that imports use correct paths (especially `@/` aliases)

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches
- **Pull Requests**: Preview deployments for PRs

## Monitoring

After deployment:

- Check **Analytics** tab for performance metrics
- Review **Logs** for runtime errors
- Monitor **Functions** if using API routes

## Rollback

To rollback to a previous deployment:

1. Go to **Deployments** tab
2. Find the deployment you want to restore
3. Click **"..."** menu → **"Promote to Production"**

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

