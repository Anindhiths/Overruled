# Legal Battle Arena

A blockchain-based legal game where players take on the role of a lawyer defending clients in various cases. The game combines blockchain technology with AI-powered interactions to create an engaging and educational experience.

## Features

- Interactive courtroom gameplay
- AI-powered judge and opposing counsel
- Multiple case scenarios with varying difficulty
- Blockchain-based scoring and achievements
- Real-time chat-based interactions
- Dynamic case progression

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- A Groq API key for AI interactions
- MetaMask or another Web3 wallet

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd legal-battle-arena
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

4. Start the local blockchain:
```bash
yarn chain
```

5. Deploy the smart contracts:
```bash
yarn deploy
```

6. Start the frontend:
```bash
yarn start
```

## Gameplay

1. Select a case to defend from the available options
2. Enter the courtroom and begin your defense
3. Interact with the AI judge and opposing counsel through chat
4. Present evidence and make arguments
5. Score points based on your performance
6. Win the case by convincing the judge of your client's innocence

## Smart Contract

The game uses a smart contract (`LegalGame.sol`) to manage:
- Case creation and management
- Evidence submission
- Scoring system
- Game state progression

## AI Integration

The game uses Groq's AI models to power:
- Judge responses and decisions
- Opposing counsel arguments
- Witness testimonies
- Dynamic case progression

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.