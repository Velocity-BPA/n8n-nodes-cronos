# n8n-nodes-cronos

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the Cronos blockchain ecosystem. This node provides 6 resources with full CRUD capabilities, enabling seamless integration with accounts, transactions, blocks, smart contracts, tokens, and network operations for building powerful blockchain automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Cronos](https://img.shields.io/badge/Cronos-Blockchain-purple)
![Web3](https://img.shields.io/badge/Web3-Compatible-green)
![DeFi](https://img.shields.io/badge/DeFi-Ready-orange)

## Features

- **Account Management** - Create, query, and manage Cronos blockchain accounts with balance tracking
- **Transaction Operations** - Send, monitor, and analyze blockchain transactions with full details
- **Block Explorer** - Access and query block data, including block height, timestamps, and transaction lists
- **Smart Contract Integration** - Deploy, interact with, and monitor smart contracts on Cronos network
- **Token Operations** - Manage CRC-20 tokens, transfers, and balance queries across the ecosystem
- **Network Monitoring** - Real-time network status, gas prices, and validator information
- **Comprehensive Error Handling** - Robust error management with detailed blockchain-specific error codes
- **High Performance** - Optimized for high-throughput blockchain operations with connection pooling

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-cronos`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-cronos
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-cronos.git
cd n8n-nodes-cronos
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-cronos
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Cronos API key for blockchain access | Yes |
| API Endpoint | Custom RPC endpoint (optional, defaults to mainnet) | No |
| Network | Network selection (mainnet, testnet) | Yes |
| Timeout | Request timeout in seconds (default: 30) | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve account balance in CRO and other tokens |
| Get Account Info | Fetch detailed account information including nonce and transaction history |
| Create Account | Generate new Cronos account with private/public key pair |
| Import Account | Import existing account using private key or mnemonic |
| Get Transaction History | List all transactions for a specific account |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send Transaction | Send CRO or tokens to another address |
| Get Transaction | Retrieve transaction details by hash |
| Get Transaction Receipt | Get transaction receipt and execution status |
| List Transactions | Query transactions with filters (block range, address, etc.) |
| Estimate Gas | Calculate gas costs for transaction execution |
| Get Transaction Status | Check if transaction is pending, confirmed, or failed |

### 3. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block information by number or hash |
| Get Latest Block | Fetch the most recent block on the network |
| Get Block Transactions | List all transactions within a specific block |
| Get Block Range | Retrieve multiple blocks within a specified range |
| Search Blocks | Search blocks by timestamp or transaction count |

### 4. SmartContract

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Deploy smart contract bytecode to Cronos network |
| Call Function | Execute read-only smart contract function |
| Send Transaction | Execute state-changing smart contract function |
| Get Contract Info | Retrieve contract details including ABI and bytecode |
| Get Contract Events | Query contract event logs with filtering |
| Verify Contract | Verify contract source code on block explorer |

### 5. Token

| Operation | Description |
|-----------|-------------|
| Get Token Info | Retrieve token metadata (name, symbol, decimals, supply) |
| Get Token Balance | Check token balance for specific address |
| Transfer Tokens | Send CRC-20 tokens between addresses |
| Get Token Transactions | List token transfer history |
| Get Token Holders | Retrieve list of token holders and balances |
| Get Token Price | Fetch current token price and market data |

### 6. Network

| Operation | Description |
|-----------|-------------|
| Get Network Status | Current network health and sync status |
| Get Gas Price | Current recommended gas prices for transactions |
| Get Validator Info | Information about network validators and staking |
| Get Network Stats | Network statistics including total transactions and accounts |
| Get Chain Info | Chain ID, network version, and protocol details |

## Usage Examples

```javascript
// Get account balance
{
  "resource": "account",
  "operation": "getBalance",
  "address": "0x1234567890123456789012345678901234567890"
}
```

```javascript
// Send CRO transaction
{
  "resource": "transaction",
  "operation": "sendTransaction",
  "from": "0xSenderAddress",
  "to": "0xRecipientAddress", 
  "amount": "1.5",
  "gasLimit": "21000"
}
```

```javascript
// Call smart contract function
{
  "resource": "smartContract",
  "operation": "callFunction",
  "contractAddress": "0xContractAddress",
  "functionName": "balanceOf",
  "parameters": ["0xUserAddress"],
  "abi": [{"name": "balanceOf", "type": "function", "inputs": [{"name": "account", "type": "address"}]}]
}
```

```javascript
// Get token information
{
  "resource": "token",
  "operation": "getTokenInfo",
  "tokenAddress": "0xTokenContractAddress"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided API key | Verify API key in credentials and check permissions |
| Insufficient Funds | Account balance too low for transaction | Check account balance and reduce transaction amount |
| Gas Limit Exceeded | Transaction requires more gas than specified | Increase gas limit or optimize contract call |
| Network Timeout | Request timed out waiting for network response | Check network connectivity and increase timeout setting |
| Invalid Address | Provided address format is incorrect | Verify address format and checksum |
| Contract Not Found | Smart contract does not exist at specified address | Confirm contract address and network selection |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-cronos/issues)
- **Cronos Documentation**: [Cronos Developer Docs](https://docs.cronos.org/)
- **Cronos Community**: [Cronos Discord](https://discord.com/invite/cronos)