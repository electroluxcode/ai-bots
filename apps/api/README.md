# Express TypeScript API

A RESTful API built with Express.js and TypeScript following best practices for structure and organization.

## Features

- TypeScript integration
- Express.js framework
- MVC architecture
- Environment-based configuration
- ESLint and Prettier for code quality
- Jest for testing
- Middleware implementation with Express
- Error handling
- Logging with Morgan

## Project Structure

```
src/
├── config/         # Application configuration
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares
├── models/         # Data models
├── routes/         # Route definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd api
npm install
# or
yarn install
```

3. Copy the environment file and adjust as needed:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Build for Production

```bash
npm run build
# or
yarn build
```

### Run in Production

```bash
npm start
# or
yarn start
```

## Development

- `npm run dev`: Start development server with hot-reload
- `npm run lint`: Lint code using ESLint
- `npm run format`: Format code using Prettier
- `npm test`: Run tests
- `npm run build`: Build for production

## License

MIT 