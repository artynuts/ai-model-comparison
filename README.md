# AI Model Comparison

A web application that allows you to compare responses from multiple AI models side by side. Send a single query and get responses from GPT-4, Claude, and Gemini simultaneously.

This tool helps you evaluate and compare the performance of different AI models by:

- Sending the same prompt to multiple models simultaneously
- Viewing responses side-by-side for easy comparison
- Rating responses across different categories (accuracy, clarity, etc.)
- Tracking your rating history and model performance
- Analyzing which models perform better in specific categories
- Flexible storage options with PostgreSQL or localStorage
- Data validation and cleanup tools
- Bulk data deletion capabilities

## Interface Showcase

### Main Comparison View

![Main Comparison View](images/aimc-compare.png)
The main interface where you can enter queries and view responses from different AI models side by side.

![Main Comparison View](images/aimc-response.png)
Compare responses from different models in a clean, organized layout.

### Rating System

![Rating System](images/aimc-ratings.png)
Interactive rating controls for evaluating responses across different categories.

### Query History

![Query History](images/aimc-history.png)
Access and manage your past queries and their responses.

### Ratings Summary

![Ratings Summary](images/aimc-ratings-by-model.png)
Comprehensive view of all ratings, organized by model.

![Ratings Summary](images/aimc-ratings-by-category.png)
Comprehensive view of all ratings, organized by category.

### Settings

![Settings](images/aimc-settings.png)
Add the ability to support different storage providers: Local Storage & PostgreSQL.

![Data Validation and Migration](images/aimc-settings-2.png)
Add the ability to migrate data from one storage to another, validate the data in a storage, delete all the data in a storage layer.

## Features

- Compare responses from multiple AI models in real-time
- View response latency for each model
- Markdown formatting support for responses
- Query history with easy access to past comparisons
- Flexible storage options:
  - PostgreSQL database for persistent storage
  - Browser localStorage for offline usage
  - Easy switching between storage types
- Data management tools:
  - Data validation and automatic fixing
  - Bulk data deletion
  - Storage-specific operations
- Responsive design for desktop and mobile
- Dark/light mode support
- Enhanced UI with:
  - Sticky header for easy navigation
  - Light blue response sections for better readability
  - Consistent card styling with subtle borders
  - Full-width layout for better space utilization
  - Improved query history display
  - Unified storage selector in sidebar
- Rating system for responses:
  - Thumbs up/down ratings for multiple categories
  - Rating summary tables by model and category
  - Visual indicators with color-coded backgrounds
  - Interactive rating controls with hover effects
  - Percentage-based rating summaries

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
- PostgreSQL database (optional, for persistent storage)
- API keys for the following services:
  - OpenAI API key
  - Anthropic API key
  - Google AI (Gemini) API key

## Setup

### Local Development Setup

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
DATABASE_URL=your_postgres_connection_string  # Optional, for PostgreSQL storage
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Running PostgreSQL in Docker

1. Make sure you have Docker installed on your system.

2. Create a `.env` file in the root directory with your database configuration:

```env
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=aimc_db
DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/aimc_db
```

3. Start the PostgreSQL container:

```bash
docker run --name aimc-postgres \
  -e POSTGRES_USER=your_db_user \
  -e POSTGRES_PASSWORD=your_db_password \
  -e POSTGRES_DB=aimc_db \
  -p 5432:5432 \
  -d postgres:latest
```

4. Verify the container is running:

```bash
docker ps
```

5. To stop the container:

```bash
docker stop aimc-postgres
```

6. To start the container again:

```bash
docker start aimc-postgres
```

7. To remove the container:

```bash
docker rm aimc-postgres
```

Note: Make sure to replace `your_db_user` and `your_db_password` with secure values of your choice. The database will be accessible on port 5432.

### Data Management

The application includes tools for managing your data:

1. **Data Validation**

   - Located in the Settings page
   - Checks for missing IDs, incorrect ordering, and other issues
   - Automatically fixes common problems
   - Works with both PostgreSQL and localStorage

2. **Data Deletion**
   - Located in the Settings page
   - Allows bulk deletion of all data
   - Storage-specific deletion (PostgreSQL or localStorage)
   - Confirmation dialog to prevent accidental deletion

## Usage

1. Enter your query in the text area
2. Click "Compare Models" to send the query to all AI models
3. View the responses side by side
4. Rate responses using thumbs up/down for different categories
5. Access your query history in the sidebar
6. View rating summaries in the dedicated ratings page
7. Click on past queries to view previous comparisons
8. Choose your preferred storage method (PostgreSQL or localStorage) from the sidebar

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- DaisyUI
- PostgreSQL (optional)
- OpenAI API
- Anthropic API
- Google Generative AI API

## Project Structure

```
ai-model-comparison/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   │   ├── ThumbsIcon.tsx     # Shared rating icon component
│   │   ├── ThumbsRating.tsx   # Rating control component
│   │   ├── StorageSelector.tsx # Storage type selector
│   │   ├── DataValidation.tsx # Data validation component
│   │   ├── DataDeletion.tsx   # Data deletion component
│   │   └── ...
│   ├── context/      # React context
│   │   ├── StorageContext.tsx # Storage management
│   │   └── ...
│   ├── lib/
│   │   ├── storage/  # Storage providers
│   │   │   ├── PostgresStorageProvider.ts
│   │   │   ├── LocalStorageProvider.ts
│   │   │   └── StorageProvider.ts
│   │   └── utils/    # Utility functions
│   │       └── storage.ts
│   ├── history/      # History page
│   ├── ratings/      # Ratings summary page
│   ├── settings/     # Settings page
│   ├── types/        # TypeScript types
│   └── page.tsx      # Main page
├── docker/           # Docker configuration files
├── public/           # Static assets
├── docker-compose.yml # Docker Compose configuration
└── package.json      # Dependencies and scripts
```

## Rating Categories

The application supports rating responses across multiple categories:

- Accuracy: Were there any factual errors?
- Relevance: Did it fully answer the question?
- Completeness: Was anything missing?
- Conciseness: Was the response straight to the point?
- Unbiased: Did you detect any bias in the response?

Each category can be rated with thumbs up or down, and ratings are summarized in:

- Per-model view: Shows ratings grouped by AI model
- Per-category view: Shows ratings grouped by category

## Storage Options

The application supports two storage methods:

1. **PostgreSQL Database**

   - Persistent storage across sessions
   - Suitable for production use
   - Requires database setup

2. **Browser localStorage**
   - Works offline
   - No setup required
   - Data persists in the browser

Switch between storage options using the selector in the sidebar. Your preference is remembered across sessions.

### Data Migration Between Storage Types

The application provides functionality to migrate data between PostgreSQL and localStorage:

1. **Manual Migration**

   - Use the Data Migration tool in the Settings page
   - Select the target storage type
   - Click "Migrate Data" to start the process
   - The tool will:
     - Copy data from the source storage to the target storage
     - Skip any duplicate entries
     - Show progress and results of the migration
     - List any queries that were skipped due to duplicates

2. **Data Validation**

   - After migration, use the Data Validation tool to ensure:
     - All records were transferred correctly
     - Data integrity is maintained
     - No duplicate entries exist
     - All required fields are present

3. **Troubleshooting**
   - If migration fails, check the browser console for error messages
   - Use the Data Validation tool to identify and fix any issues
   - The original data remains intact in the source storage

Note: When migrating large datasets, the process may take a few moments. The application will show a progress indicator during migration.

## Development

### Testing and Code Coverage

This project enforces 100% test coverage for all code. This ensures high code quality and reliability.

#### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Check if coverage meets 100% threshold
npm run check-coverage
```

#### Coverage Requirements

- All new code must have 100% test coverage for:
  - Statements
  - Branches
  - Functions
  - Lines

#### Pre-commit Hooks

The project uses Husky to enforce test coverage requirements:

- Pre-commit hook automatically runs tests and checks coverage
- Commits will be blocked if coverage is below 100%
- The hook will show which files need additional test coverage

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
