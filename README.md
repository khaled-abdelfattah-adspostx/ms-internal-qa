# MomentScience QA Tools

A comprehensive SvelteKit-based internal web tool designed for the MomentScience testing team. This application provides an API Request Builder with additional testing utilities for QA and development teams.

## 🌐 Live Demo

The application is automatically deployed to GitHub Pages: [View Live Demo](https://yourusername.github.io/ms-internal-qa/)

## 🚀 Features

### API Request Builder
- **Predefined API Presets**: Quick access to common MomentScience endpoints (Moments API, Perkswall API, USP Session APIs)
- **Environment Switching**: Seamless switching between staging and production environments  
- **Token Management**: Save and manage multiple API key and SDK ID configurations
- **Real-time JSON Validation**: Instant feedback on JSON request body formatting
- **Response Display**: Formatted response display with syntax highlighting and status indicators

### Enhanced User Experience
- **Tooltips**: Contextual help on all input fields for better UX
- **Save/Load Presets**: Persistent browser storage for configurations and history
- **Request History**: Track and review previous API requests with full details
- **Responsive Design**: Fully responsive design that works on desktop and mobile
- **Error Handling**: Comprehensive error handling with inline warnings and validation

### Testing Utilities
- **Token Manager**: Centralized management of API credentials
- **Request History**: Detailed logging of all API requests and responses
- **Configuration Presets**: Save frequently used API configurations
- **Clipboard Integration**: Easy copying of requests, responses, and configurations

## 🛠️ Technology Stack

- **Frontend Framework**: SvelteKit with TypeScript for type safety and performance
- **Styling**: Tailwind CSS with custom component classes following MomentScience design system
- **Icons**: Lucide Svelte for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds
- **Package Manager**: npm

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── ApiRequestBuilder.svelte
│   │   ├── RequestHistory.svelte
│   │   ├── TokenManager.svelte
│   │   ├── InputField.svelte
│   │   ├── SelectField.svelte
│   │   ├── Button.svelte
│   │   ├── Modal.svelte
│   │   └── Tooltip.svelte
│   ├── types.ts             # TypeScript type definitions
│   ├── storage.ts           # LocalStorage utilities
│   └── api-utils.ts         # API helper functions
├── routes/                  # SvelteKit pages and layouts
│   ├── +layout.svelte       # Global layout
│   └── +page.svelte         # Main application page
├── app.css                  # Global styles with Tailwind directives
└── app.html                 # HTML template
```

## 🚦 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd ms-internal-qa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Building for Production

```bash
# Create a production build
npm run build

# Preview the production build
npm run preview
```

## 📖 Usage Guide

### API Request Builder
1. **Configure Environment**: Select staging or production and set base URLs
2. **Set Credentials**: Enter your SDK ID and API Key
3. **Choose Preset**: Select from predefined MomentScience API endpoints
4. **Customize Request**: Modify path, method, and JSON body as needed
5. **Send Request**: Click "Send Request" to execute and view response

### Token Manager
1. **Add Configuration**: Click "Add Token Config" to create new API credential sets
2. **Manage Tokens**: Edit or delete existing configurations as needed
3. **Copy Credentials**: Use copy buttons to quickly access API keys and SDK IDs

### Request History
1. **View History**: All requests are automatically logged with full details
2. **Search Requests**: Use the search bar to filter by path, URL, status, or environment
3. **Review Details**: Click "Details" on any request to see full request/response data
4. **Clear History**: Use "Clear All" to reset request history

## 🎨 Brand Guidelines

The application follows MomentScience brand guidelines:
- **Font**: Inter font family for clean, professional typography
- **Colors**: Indigo primary (#6366f1), emerald accent (#10b981), with gray neutral tones
- **Logo**: MS placeholder until official logo integration
- **Design**: Clean, modern interface with consistent spacing and styling

## 🔧 Configuration

### API Endpoints
The tool supports these MomentScience API endpoints:
- **Moments API**: `/native/v2/offers.json`
- **Perkswall API**: `/native/v4/perkswall.json`
- **USP Session APIs**: `/sdk/v4/usp/...` (various session management endpoints)

### Default Configuration
- **Staging URL**: `https://api-staging.adspostx.com`
- **Production URL**: `https://api.adspostx.com`
- **Default SDK ID**: `8c7efcd41c82b20e`
- **Default API Key**: `124a5528-6db7-4373-b278-7605c2719d0f`

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Instructions

1. **Push to GitHub**: Push your repository to GitHub
2. **Enable GitHub Pages**: 
   - Go to Settings > Pages in your GitHub repository
   - Select "GitHub Actions" as the source
3. **Automatic Deployment**: The site will automatically deploy on every push to the main branch

#### Manual Build

To build for GitHub Pages locally:

```bash
npm run build:ghpages
```

The built files will be in the `build/` directory.

### Other Platforms
The application can be deployed to any static hosting platform that supports SvelteKit.

## 🤝 Contributing

This is an internal tool for the MomentScience team. When contributing:

1. Follow the established coding standards in `.github/copilot-instructions.md`
2. Use TypeScript for all new code
3. Follow the component patterns established in the codebase
4. Test thoroughly with both staging and production environments
5. Ensure responsive design works across devices

## 📝 Development Notes

### Code Style
- Use TypeScript with strict type checking
- Follow Svelte component best practices
- Use Tailwind CSS utility classes
- Implement proper error handling
- Write helpful comments for complex logic

### Testing
- Test API requests with both environments
- Validate responsive design on mobile and desktop
- Ensure proper error handling for network failures
- Test localStorage functionality across browser sessions

## 📄 License

Internal tool for MomentScience team use only.

## 📞 Support

For questions or issues, contact the MomentScience development team.
