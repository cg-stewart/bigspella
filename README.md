# Big Spella

A multiplayer spelling bee game application that combines educational value with competitive gameplay.

## Overview

Big Spella is a modern, interactive spelling bee platform that supports both web and mobile interfaces. Players can engage in solo practice sessions, multiplayer matches, and organized tournaments while improving their spelling skills through various game modes.

## Features

### Game Modes
- **Solo Practice**: Practice spelling with AI-generated pronunciations
- **Group Games**: Real-time multiplayer matches (2-32 players)
- **Tournaments**: Scheduled competitions with brackets and elimination rules

### Input Methods
- Text-based spelling input
- Voice input with AI validation

### Game Types
- Points-based matches
- Elimination rounds
- Tournament brackets

### Social Features
- One-on-one chat
- Game room chat
- Friend system
- Global and in-game leaderboards

### Premium Features
- Tournament creation and management
- Advanced performance analytics
- Email/SMS notifications
- Custom word sets
- Daily word learning
- Match recording and replay

## Tech Stack

- **Frontend**: Next.js (Web), React Native (Mobile)
- **Backend**: SST + AWS
- **Database**: PostgreSQL
- **Real-time**: WebSocket via AWS IoT
- **Storage**: AWS S3
- **Authentication**: AWS Cognito
- **State Management**: Redis
- **AI/ML**: OpenAI for voice processing

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bigspella.git
   cd bigspella
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file with the following variables
   cp .env.example .env
   ```

4. Start the development environment:
   ```bash
   # Start SST development
   pnpm sst dev

   # In a new terminal, start the web app
   cd apps/web
   pnpm dev

   # In another terminal, start the mobile app
   cd apps/mobile
   pnpm start
   ```

## Project Structure

```
bigspella/
├─ apps/
│  ├─ web/                 # Next.js web application
│  └─ mobile/             # React Native mobile app
├─ packages/
│  ├─ core/               # Shared business logic
│  ├─ database/           # Database schemas and migrations
│  └─ config/            # Shared configuration
├─ infra/                # Infrastructure code
└─ sst.config.ts        # SST configuration
```

## Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. Push your changes and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Deployment

1. Deploy to staging:
   ```bash
   pnpm sst deploy --stage staging
   ```

2. Deploy to production:
   ```bash
   pnpm sst deploy --stage prod
   ```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
