# Dokugen Dashboard 📊

## Overview
The Dokugen Dashboard is a modern, responsive web application built with **Next.js 15**, **React 19**, and **TypeScript**. It serves as an interactive documentation and metrics platform for the Dokugen CLI tool, showcasing active user data, usage counts, and comprehensive guides for seamless integration and utilization.

## Features
- ✨ **Interactive Documentation Search**: Quickly find relevant information within the Dokugen documentation.
- 📈 **Real-time Usage Metrics**: Visualize active users and their usage patterns through dynamic charts.
- 📖 **Comprehensive Guides**: Step-by-step instructions for installation, usage, and customization of Dokugen.
- 🎨 **Modern User Interface**: A sleek, dark-themed design powered by Tailwind CSS and Shadcn/ui.
- 🚀 **Performance Optimized**: Built with Next.js for fast loading times and an excellent user experience.
- 🌐 **SEO Friendly**: Configured with `next-sitemap` and robust metadata for better search engine visibility.

## Getting Started

### Installation
To get this project up and running on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Dokugen-dashboard.git # Assuming a dedicated repo for the dashboard
    cd Dokugen-dashboard
    ```

2.  **Install Dependencies**:
    Install the necessary packages using npm:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env.local` file in the root of your project and add the following required environment variables:
    ```
    # Supabase Credentials (for fetching active user data)
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"

    # Server URL for API routes (e.g., Vercel deployment URL or local)
    SERVER_URL="https://your-deployment-domain.com" # Example: http://localhost:3000
    ```

### Running the Development Server
Once installed, you can run the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard. The page will hot-reload as you make changes.

### Building for Production
To build the application for production:

```bash
npm run build
```
This command compiles the application into the `.next` folder.

### Starting the Production Server
To start the production server after building:

```bash
npm run start
```

## Usage
The Dokugen Dashboard provides an intuitive interface for exploring Dokugen's capabilities and monitoring its usage.

- **Navigate through Documentation**: Use the search bar to find specific topics or browse through the Getting Started, Features, and FAQs sections.
- **View Metrics**: The "Dokugen Metrics" section displays a table of active users and their command usage counts, along with a responsive line chart for visual insights.
- **Contribute to Dokugen**: Find links to the main Dokugen GitHub repository for contributions.

A demo video, if available locally, would be displayed on the homepage to showcase Dokugen in action. You can see it in action by visiting the deployed site.

## Technologies Used

| Technology         | Description                                                          |
| :----------------- | :------------------------------------------------------------------- |
| **Next.js 15**     | React framework for production-grade web applications.               |
| **React 19**       | UI library for building interactive user interfaces.                 |
| **TypeScript**     | Superset of JavaScript that adds static type definitions.            |
| **Tailwind CSS**   | Utility-first CSS framework for rapid UI development.                |
| **Shadcn/ui**      | Reusable UI components built on Radix UI and styled with Tailwind CSS. |
| **Supabase**       | Open-source Firebase alternative for database and authentication.    |
| **React Query**    | Powerful library for fetching, caching, and updating asynchronous data. |
| **Framer Motion**  | Production-ready motion library for React.                           |
| **Recharts**       | Composable charting library built on React components.               |
| **Geist Fonts**    | High-quality, open-source fonts for modern interfaces.               |
| **Lucide React**   | Beautiful and customizable open-source icon set.                     |
| **next-sitemap**   | Generates sitemaps for Next.js projects.                             |

## Contributing
We welcome contributions to the Dokugen Dashboard! Whether it's bug fixes, new features, or improvements to documentation, your input is valuable.

1.  🍴 **Fork the Repository**: Start by forking the project to your GitHub account.
2.  🌿 **Create a New Branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  ✏️ **Make Your Changes**: Implement your feature or fix.
4.  🧪 **Test Your Changes**: Ensure everything works as expected.
5.  ⬆️ **Commit Your Changes**:
    ```bash
    git commit -m "feat: Add new awesome feature"
    ```
6.  🚀 **Push to Your Branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
7.  🤝 **Open a Pull Request**: Submit a detailed pull request to the `main` branch of this repository.

## Author
**Samuel Tuoyo**
-   📧 **Email**: [samueltuoyo9082@gmail.com](mailto:samueltuoyo9082@gmail.com)
-   🐦 **Twitter**: [@TuoyoS26091](https://x.com/TuoyoS26091?t=cauMkLaDHxTX_oieHzVjkw&s=09)
-   💼 **LinkedIn**: [Samuel Tuoyo](https://www.linkedin.com/in/samuel-tuoyo-8568b62b6)
-   📘 **Facebook**: [Samuel Tuoyo](https://www.facebook.com/share/18XqXawpGj/)
-   ▶️ **YouTube**: [Samuel Tuoyo](https://youtube.com/@samuel-tuoyo?si=PtUHcfICRye1wvuk)

---
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)