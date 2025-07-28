# WAGUS Agents

A Solana-based dApp for AI agent management with integrated wallet functionality and token payments.

## Features

- 🔗 **Solana Wallet Integration** - Connect with Phantom, Solflare, and other wallets
- 💰 **Real-time Token Balances** - View SOL, USDC, and WAGUS token balances
- 🛒 **Credit Purchase System** - Buy credits using WAGUS tokens
- 🤖 **AI Command Interface** - Execute AI commands with token-based payments
- 📊 **Transaction History** - Track all payments and purchases
- ⚙️ **Settings Management** - Configure OpenAI API keys and preferences

## Setup

### Prerequisites

- Node.js 18+ (see `.nvmrc`)
- A Solana wallet (Phantom recommended)
- Helius RPC API key (for reliable blockchain access)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wagus-agents
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
# Get your API key from https://helius.xyz
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
VITE_HELIUS_WS_URL=wss://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# Solana Network (mainnet-beta for production)
VITE_SOLANA_NETWORK=mainnet-beta

# WAGUS Token Configuration (update if needed)
VITE_WAGUS_MINT=7BMxgTQhTthoBcQizzFoLyhmSDscM56uMramXGMhpump
VITE_WAGUS_TREASURY=DZuJUNmVxNQwq55wrrrpFeE4PES1cyBv2bxuSqm7UXdj
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `VITE_HELIUS_RPC_URL` | Helius RPC endpoint with API key | Yes |
| `VITE_HELIUS_WS_URL` | Helius WebSocket endpoint | No |
| `VITE_SOLANA_NETWORK` | Solana network (mainnet-beta/devnet) | No |
| `VITE_WAGUS_MINT` | WAGUS token mint address | No |
| `VITE_WAGUS_TREASURY` | Treasury wallet for payments | No |

## Getting Helius API Key

1. Visit [helius.xyz](https://helius.xyz)
2. Sign up for a free account
3. Create a new project
4. Copy your API key to the `.env` file

## Token Information

- **SOL**: Native Solana token
- **USDC**: USD Coin on Solana
- **WAGUS**: Custom token for premium features

### Getting WAGUS Tokens

Visit [swap.wagus.app](https://swap.wagus.app) to acquire WAGUS tokens for premium features.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run check` - Type check without emitting

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AuthProvider.tsx # Authentication context
│   ├── Layout.tsx       # Main layout component
│   └── SolanaProvider.tsx # Solana wallet provider
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── PaymentPortal.tsx # Token management
│   ├── CommandInterface.tsx # AI command interface
│   └── Settings.tsx    # User settings
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
└── assets/             # Static assets
```

## Deployment

The app is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Security Notes

- Never commit `.env` files to version control
- Keep your Helius API key secure
- Use environment variables for all sensitive data
- The app connects to Solana Mainnet by default

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details