# Camosnoop

**See the Invisible. Create the Unseen.**

Camosnoop is an AI-powered color palette generator. It analyzes images, satellite imagery, and hybrid contexts to extract harmonious color palettes, complete with Golden® Acrylic and Pantone® matches.

![Camosnoop App](https://via.placeholder.com/800x400?text=Camosnoop+Preview)

## Features

- **Image Analysis**: Upload photos to extract dominant colors focused on the main subject.
- **Satellite Recon**: Analyze the color palette of any real-world location using satellite imagery.
- **Hybrid Mode**: Combine visual inspiration (photos) with physical context (location) for site-specific design.
- **Smart Matching**: Perceptual color matching algorithms (CIELAB Delta E) for Golden Acrylics and Pantone.
- **Export**: Share palettes via unique URLs or export to professional PDF sheets.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI**: Google Gemini API (Gemini 2.5 Flash)
- **Mapping**: Google Maps Embed API
- **PDF Generation**: jsPDF

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/camosnoop.git
    cd camosnoop
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Deployment

This project is optimized for deployment on **Vercel**.

1.  Push to GitHub.
2.  Import project into Vercel.
3.  Add the `API_KEY` in the Vercel Project Settings > Environment Variables.
4.  Deploy.

## License

MIT
