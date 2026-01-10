# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## AWS Amplify Deployment (Static Hosting with S3 + CloudFront)

This project is configured for deployment to AWS Amplify Hosting.

### Prerequisites

- AWS Account
- AWS CLI configured with appropriate credentials
- @aws-amplify/cli installed globally

### Deployment Steps

1. **Initialize Amplify project:**
   ```bash
   cd line-mini-app
   amplify init
   ```
   Follow the prompts:
   - Enter a name for your environment: `prod`
   - Choose your default editor: `Visual Studio Code`
   - Select the AWS region: `ap-northeast-1` (Tokyo)
   - Choose the type of app that you're building: `javascript`
   - What JavaScript framework are you using: `react`
   - Source directory path: `src`
   - Distribution directory path: `dist`
   - Build command: `npm run build`
   - Start command: `npm run dev`

2. **Add hosting:**
   ```bash
   amplify add hosting
   ```
   Select:
   - Hosting with Amplify Console: `No`
   - Amazon S3 and Amazon CloudFront: `Yes`

3. **Deploy:**
   ```bash
   amplify publish
   ```

### CI/CD Setup (Optional)

For automatic deployments:
1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Sign in to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Connect your repository
4. Amplify will automatically detect the build settings from `.amplify-hosting/config`

### AWS Amplify Console Setup (S3 + CloudFront via Console)

1. **Push code to Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/line-mini-app.git
   git push -u origin main
   ```

2. **Connect to Amplify Console:**
   - Sign in to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click "New app" → "Connect app"
   - Select your Git provider and repository
   - Click "Next"

3. **Configure build settings:**
   - Build settings will be auto-detected from `.amplify-hosting/config`
   - Verify:
     - Build command: `npm run build`
     - Base directory: `/`
   - Click "Next"

4. **Review and deploy:**
   - Review all settings
   - Click "Save and deploy"
   - Amplify will provision S3 bucket and CloudFront distribution

5. **Custom domain (optional):**
   - Go to "Domain management" in Amplify Console
   - Add your custom domain
   - Amplify will automatically configure SSL certificate

### LINE Mini App Configuration

For LINE Mini App integration, configure your liffId in the environment:
```bash
# In amplify/backend.ts or environment variables
```
