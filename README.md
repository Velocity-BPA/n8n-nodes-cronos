# n8n-nodes-cronos

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

![License: BSL 1.1](https://img.shields.io/badge/license-BSL--1.1-blue)
![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Cronos](https://img.shields.io/badge/Cronos-EVM%20Chain-blue)

A comprehensive n8n community node for interacting with the Cronos blockchain. This node enables workflow automation for blockchain operations including account management, transactions, smart contracts, tokens, NFTs, DeFi protocols, and more.

## Features

### Resources & Operations

**Accounts**
- Get native CRO balance
- Get ERC-20 token balances
- Get NFT holdings (ERC-721/ERC-1155)
- Get transaction history
- Get token transfer history

**Transactions**
- Get transaction details
- Get transaction receipt
- Send transactions
- Estimate gas
- Get transaction status

**Blocks**
- Get block by number or hash
- Get latest block
- Get block transactions
- Find block by timestamp

**Smart Contracts**
- Get contract ABI (verified contracts)
- Read contract state
- Write to contracts
- Get contract source code
- Query contract events
- Deploy contracts

**Tokens (ERC-20)**
- Get token information
- Get token holders
- Get token transfers
- Get token price
- Get top tokens

**NFTs (ERC-721/ERC-1155)**
- Get NFT metadata
- Get NFT transfers
- Get collection information
- Get NFT owners

**DeFi**
- Get protocol TVL
- Get pool information
- Get DEX statistics
- Get yield farm data

**Network**
- Get network status
- Get gas prices
- Get validators
- Get chain statistics

**Events**
- Get logs with filters
- Subscribe to events
- Filter and decode events

**Utility**
- Convert units (Wei/Gwei/CRO)
- Encode function calls
- Decode data
- Check API health

### Triggers

- **New Block** - Trigger on new blocks
- **Transaction To Address** - Trigger on incoming transactions
- **Token Transfer** - Trigger on ERC-20 transfers
- **Contract Event** - Trigger on smart contract events
- **Large Transaction** - Trigger on transactions above threshold

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-cronos`
5. Accept the risks and install

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the node
pnpm install n8n-nodes-cronos

# Restart n8n
```

## Configuration

### Credentials Setup

1. Add new credentials: **Cronos API**
2. Configure:
   - **Network**: Select Mainnet or Testnet
   - **RPC Endpoint** (optional): Custom RPC URL
   - **Private Key** (optional): For signing transactions
   - **Cronos Scan API Key** (optional): For enhanced rate limits

### Network Information

| Network | Chain ID | RPC Endpoint | Explorer |
|---------|----------|--------------|----------|
| Mainnet | 25 | https://evm.cronos.org | https://cronoscan.com |
| Testnet | 338 | https://evm-t3.cronos.org | https://testnet.cronoscan.com |

## Usage Examples

### Get Account Balance

```javascript
// Configure Cronos node
Resource: Accounts
Operation: Get Balance
Address: 0x...your-address
```

### Read Smart Contract

```javascript
// Configure Cronos node
Resource: Smart Contracts
Operation: Read Contract
Contract Address: 0x...token-address
Function Name: balanceOf
Parameters: ["0x...holder-address"]
```

### Monitor Token Transfers

```javascript
// Configure Cronos Trigger node
Event: Token Transfer
Token Address: 0x...token-contract
To Address: 0x...your-address
```

## Known Contracts

The node includes pre-configured support for popular Cronos contracts:

| Token | Symbol | Address |
|-------|--------|---------|
| Wrapped CRO | WCRO | 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23 |
| USDC | USDC | 0xc21223249CA28397B4B6541dfFaEcC539BfF0c59 |
| USDT | USDT | 0x66e428c3f67a68878562e79A0234c1F83c208770 |
| DAI | DAI | 0xF2001B145b43032AAF5Ee2884e456CCd805F677D |
| WETH | WETH | 0xe44Fd7fCb2b1581822D0c862B68222998a0c299a |
| WBTC | WBTC | 0x062E66477Faf219F25D27dCED647BF57C3107d52 |

**DeFi Protocols:**
- VVS Finance Router: 0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae
- VVS Finance Factory: 0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15

## Development

### Prerequisites

- Node.js 18.10+
- pnpm 9.1+

### Setup

```bash
# Clone the repository
git clone https://github.com/velobpa/n8n-nodes-cronos.git
cd n8n-nodes-cronos

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

### Local Testing

```bash
# Link for local development
cd n8n-nodes-cronos
pnpm link --global

# In your n8n installation
cd ~/.n8n
pnpm link --global n8n-nodes-cronos

# Restart n8n
```

## API Rate Limits

- **Cronos RPC**: No strict limits, but be reasonable
- **Cronos Scan API**: 
  - Without API key: 5 requests/second
  - With API key: Higher limits (get key at https://cronoscan.com/apis)

## Troubleshooting

### Common Issues

**"Invalid JSON RPC response"**
- Check network connectivity
- Verify RPC endpoint URL
- Try alternative RPC endpoint

**"Execution reverted"**
- Contract function requirements not met
- Insufficient gas
- Invalid parameters

**"Rate limit exceeded"**
- Add Cronos Scan API key
- Reduce request frequency
- Implement delays between calls

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-cronos/issues)
- **Documentation**: [Cronos Docs](https://docs.cronos.org)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Cronos](https://cronos.org) for the EVM-compatible blockchain
- [n8n](https://n8n.io) for the workflow automation platform
- [Crypto.com](https://crypto.com) for the Cronos ecosystem

## Changelog

### 1.0.0

- Initial release
- 10 resources with 50+ operations
- 5 trigger event types
- Full Cronos mainnet and testnet support

---

Built with ❤️ by [Velocity BPA](https://velobpa.com)
