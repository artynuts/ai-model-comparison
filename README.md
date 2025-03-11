# AI Model Comparison

A web application that allows you to compare responses from multiple AI models side by side. Send a single query and get responses from GPT-4, Claude, and Gemini simultaneously.

## Features

- Compare responses from multiple AI models in real-time
- View response latency for each model
- Markdown formatting support for responses
- Query history with easy access to past comparisons
- Responsive design for desktop and mobile
- Dark/light mode support

## Supported Models

- **GPT-4** (OpenAI)

  - Most capable OpenAI model
  - Version: gpt-4

- **Claude 3 Opus** (Anthropic)

  - Latest Claude model
  - Version: claude-3-opus-20240229

- **Gemini Flash** (Google)
  - Quick response model
  - Version: gemini-2.0-flash

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- API keys for the following services:
  - OpenAI API key
  - Anthropic API key
  - Google AI (Gemini) API key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/artynuts/ai-model-comparison.git
cd ai-model-comparison
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your API keys:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_google_api_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your query in the text area
2. Click "Compare Models" to send the query to all AI models
3. View the responses side by side
4. Access your query history in the sidebar
5. Click on past queries to view previous comparisons

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- DaisyUI
- OpenAI API
- Anthropic API
- Google Generative AI API

## Project Structure

```
ai-model-comparison/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── context/       # React context
│   ├── history/       # History page
│   ├── types/        # TypeScript types
│   └── page.tsx      # Main page
├── public/           # Static assets
└── package.json     # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

Never commit your `.env.local` file or expose your API keys. They should be kept secret and secure.
