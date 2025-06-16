# GitHub Pages Deployment Guide

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js 18+ installed

## 🚀 Quick Deployment Steps

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `ms-internal-qa` (or your preferred name)
3. **Important**: Make sure it's public (GitHub Pages requires public repos for free accounts)
4. Don't initialize with README (we already have one)

### 2. Connect Local Repository to GitHub

```bash
# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/ms-internal-qa.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The deployment will start automatically!

### 4. Access Your Site

After deployment (usually 2-5 minutes), your site will be available at:
```
https://YOUR_USERNAME.github.io/ms-internal-qa/
```

## 🔧 Configuration Details

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Triggers** on every push to `main` branch
2. **Builds** the static site using `npm run build`
3. **Deploys** to GitHub Pages
4. **Handles** base path configuration for subdirectory deployment

### Build Configuration

- **Adapter**: `@sveltejs/adapter-static` for static site generation
- **Output**: `build/` directory contains deployable files
- **Base Path**: Automatically configured for GitHub Pages subdirectory
- **Prerendering**: Enabled for all pages

### Local Testing

Test the production build locally:

```bash
# Build for production
npm run build

# Preview the built site
npm run preview

# Build specifically for GitHub Pages
npm run build:ghpages
```

## 🛠️ Troubleshooting

### Common Issues

1. **Site not loading**: Ensure GitHub Pages is enabled in repository settings
2. **404 errors**: Check that the repository is public
3. **Build failures**: Check GitHub Actions logs in the "Actions" tab
4. **Missing CSS/JS**: Verify base path configuration in `svelte.config.js`

### GitHub Actions Logs

Monitor deployment progress:
1. Go to your repository
2. Click **Actions** tab
3. View the latest workflow run for detailed logs

### Repository Settings

Ensure these settings in your GitHub repository:
- **Visibility**: Public (for free GitHub Pages)
- **Pages Source**: GitHub Actions
- **Actions**: Enabled

## 📝 Customization

### Change Repository Name

If you change the repository name, update:
1. GitHub Actions workflow: `BASE_PATH` environment variable
2. `build:ghpages` script in `package.json`
3. README links

### Custom Domain

To use a custom domain:
1. Add `CNAME` file to `static/` directory with your domain
2. Configure DNS settings
3. Enable custom domain in GitHub Pages settings

## 🔒 Security Notes

- **API Keys**: Never commit real API keys to the repository
- **Environment Variables**: Use GitHub Secrets for sensitive data
- **CORS**: Configure API endpoints to allow requests from your domain

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [SvelteKit Static Adapter](https://kit.svelte.dev/docs/adapter-static)
- [GitHub Actions](https://docs.github.com/en/actions)

---

🎉 **Your MomentScience QA Tools are now ready for deployment!**
