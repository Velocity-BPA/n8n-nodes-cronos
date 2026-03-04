# n8n-nodes-cronos

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

An n8n community node for interacting with the Cronos blockchain network. This node provides 6 comprehensive resources for managing accounts, transactions, smart contracts, tokens, blocks, and network statistics, enabling seamless integration of Cronos blockchain operations into your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Cronos](https://img.shields.io/badge/Cronos-Blockchain-purple)
![Web3](https://img.shields.io/badge/Web3-Compatible-green)
![EVM](https://img.shields.io/badge/EVM-Compatible-orange)

## Features

- **Account Management** - Query account balances, transaction history, and token holdings
- **Transaction Operations** - Send transactions, query transaction details, and monitor confirmations
- **Smart Contract Integration** - Deploy contracts, call functions, and monitor events
- **Token Operations** - Transfer tokens, query metadata, and manage token approvals
- **Block Explorer** - Retrieve block data, transaction lists, and network information
- **Network Statistics** - Access real-time network stats, validator information, and staking data
- **EVM Compatibility** - Full Ethereum Virtual Machine compatibility for seamless dApp integration
- **Mainnet & Testnet Support** - Works with both Cronos mainnet and testnet environments

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
| API Key | Your Cronos API key for authenticated requests | Yes |
| Network | Select network (mainnet/testnet) | Yes |
| RPC Endpoint | Custom RPC endpoint URL (optional) | No |
| Private Key | Wallet private key for transaction signing | No* |

*Required only for operations that modify blockchain state

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Balance | Retrieve CRO balance for an account |
| Get Transaction History | List all transactions for an account |
| Get Token Holdings | Get all token balances for an account |
| Get Nonce | Get the current nonce for an account |
| Get Account Info | Retrieve comprehensive account information |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Send Transaction | Send CRO to another address |
| Get Transaction | Retrieve transaction details by hash |
| Get Receipt | Get transaction receipt and status |
| Estimate Gas | Estimate gas required for a transaction |
| Get Transaction Count | Get number of transactions for an address |
| Wait for Confirmation | Wait for transaction confirmation |

### 3. Smart Contract

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Deploy a new smart contract |
| Call Function | Call a read-only contract function |
| Send Transaction | Execute a state-changing contract function |
| Get Events | Retrieve contract events and logs |
| Get Code | Get contract bytecode |
| Estimate Gas | Estimate gas for contract interaction |

### 4. Token

| Operation | Description |
|-----------|-------------|
| Transfer | Transfer tokens between addresses |
| Get Balance | Get token balance for an address |
| Get Metadata | Retrieve token name, symbol, and decimals |
| Approve | Approve token spending allowance |
| Get Allowance | Check approved spending allowance |
| Get Total Supply | Get total token supply |

### 5. Block

| Operation | Description |
|-----------|-------------|
| Get Block | Retrieve block data by number or hash |
| Get Latest Block | Get the most recent block |
| Get Block Transactions | List all transactions in a block |
| Get Block Range | Retrieve multiple blocks in a range |
| Get Uncle Blocks | Get uncle blocks for a given block |

### 6. Stats

| Operation | Description |
|-----------|-------------|
| Get Network Stats | Retrieve current network statistics |
| Get Gas Price | Get current recommended gas prices |
| Get Validator Info | Get information about network validators |
| Get Staking Stats | Retrieve staking and delegation statistics |
| Get Network Health | Check overall network health metrics |

## Usage Examples

```javascript
// Get account balance
const balance = await this.helpers.request({
  method: 'GET',
  url: '/account/0x742d35Cc6323456A8014532E9da8f8E7f7D8C8E3/balance',
  headers: {
    'Authorization': `Bearer ${credentials.apiKey}`
  }
});

// Send CRO transaction
const transaction = await this.helpers.request({
  method: 'POST',
  url: '/transaction/send',
  headers: {
    'Authorization': `Bearer ${credentials.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    to: '0x8ba1f109551bD432803012645Hac136c22C07ce',
    value: '1000000000000000000', // 1 CRO in wei
    gasLimit: 21000
  }
});

// Query smart contract
const contractResult = await this.helpers.request({
  method: 'POST',
  url: '/contract/call',
  headers: {
    'Authorization': `Bearer ${credentials.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    method: 'balanceOf',
    params: ['0x742d35Cc6323456A8014532E9da8f8E7f7D8C8E3']
  }
});

// Get network statistics
const stats = await this.helpers.request({
  method: 'GET',
  url: '/stats/network',
  headers: {
    'Authorization': `Bearer ${credentials.apiKey}`
  }
});
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| 401 Unauthorized | Invalid or missing API key | Verify API key in credentials |
| 429 Rate Limited | Too many requests | Implement request throttling |
| 404 Not Found | Resource doesn't exist | Verify addresses and transaction hashes |
| 400 Bad Request | Invalid parameters | Check parameter format and values |
| 500 Network Error | Cronos network issues | Retry request or check network status |
| Gas Estimation Failed | Cannot estimate gas | Check contract address and method parameters |

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
- **Cronos Community**: [Cronos Discord](https://discord.gg/cronos)