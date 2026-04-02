/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-cronos/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Cronos implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cronos',
    name: 'cronos',
    icon: 'file:cronos.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Cronos API',
    defaults: {
      name: 'Cronos',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'cronosApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Block',
            value: 'block',
          },
          {
            name: 'SmartContract',
            value: 'smartContract',
          },
          {
            name: 'Token',
            value: 'token',
          },
          {
            name: 'Network',
            value: 'network',
          },
          {
            name: 'Stats',
            value: 'stats',
          }
        ],
        default: 'account',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['account'],
    },
  },
  options: [
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get CRO balance for a single address',
      action: 'Get CRO balance for a single address',
    },
    {
      name: 'Get Multiple Balances',
      value: 'getMultipleBalances',
      description: 'Get CRO balance for multiple addresses',
      action: 'Get CRO balance for multiple addresses',
    },
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'Get list of normal transactions by address',
      action: 'Get list of normal transactions by address',
    },
    {
      name: 'Get Internal Transactions',
      value: 'getInternalTransactions',
      description: 'Get list of internal transactions by address',
      action: 'Get list of internal transactions by address',
    },
    {
      name: 'Get Token Transactions',
      value: 'getTokenTransactions',
      description: 'Get list of ERC-20 token transfer events by address',
      action: 'Get list of ERC-20 token transfer events by address',
    },
    {
      name: 'Get Transaction Count',
      value: 'getTransactionCount',
      description: 'Get nonce/transaction count for address',
      action: 'Get transaction count',
    },
    {
      name: 'Get Code',
      value: 'getCode',
      description: 'Get contract code at address',
      action: 'Get code',
    },
  ],
  default: 'getBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
    },
  },
  options: [
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Returns transaction information for given transaction hash',
      action: 'Get transaction',
    },
    {
      name: 'Get Transaction Receipt',
      value: 'getTransactionReceipt',
      description: 'Returns transaction receipt for given transaction hash',
      action: 'Get transaction receipt',
    },
    {
      name: 'Get Transaction Status',
      value: 'getTransactionStatus',
      description: 'Returns transaction execution status',
      action: 'Get transaction status',
    },
    {
      name: 'Send Raw Transaction',
      value: 'sendRawTransaction',
      description: 'Submits a pre-signed transaction for broadcast',
      action: 'Send raw transaction',
    },
    {
      name: 'Estimate Gas',
      value: 'estimateGas',
      description: 'Estimate gas required for transaction',
      action: 'Estimate gas',
    },
    {
      name: 'Get Gas Price',
      value: 'getGasPrice',
      description: 'Get current gas price',
      action: 'Get gas price',
    },
  ],
  default: 'getTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
    },
  },
  options: [
    {
      name: 'Get Contract ABI',
      value: 'getContractAbi',
      description: 'Get contract ABI for verified contract addresses',
      action: 'Get contract ABI',
    },
    {
      name: 'Get Source Code',
      value: 'getSourceCode',
      description: 'Get contract source code for verified contract addresses',
      action: 'Get source code',
    },
    {
      name: 'Verify Source Code',
      value: 'verifySourceCode',
      description: 'Verify and publish contract source code',
      action: 'Verify source code',
    },
    {
      name: 'Check Verification Status',
      value: 'checkVerificationStatus',
      description: 'Check source code verification status',
      action: 'Check verification status',
    },
    {
      name: 'Call Contract',
      value: 'callContract',
      description: 'Execute a message call transaction against a contract',
      action: 'Call contract',
    },
    {
      name: 'Call',
      value: 'call',
      description: 'Execute read-only contract function',
      action: 'Call contract function',
    },
    {
      name: 'Get Logs',
      value: 'getLogs',
      description: 'Get contract event logs with filters',
      action: 'Get contract event logs',
    },
    {
      name: 'Get Storage At',
      value: 'getStorageAt',
      description: 'Get contract storage value at position',
      action: 'Get contract storage value',
    },
  ],
  default: 'getContractAbi',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['token'],
    },
  },
  options: [
    {
      name: 'Get Token Balance',
      value: 'getTokenBalance',
      description: 'Get ERC-20 token account balance',
      action: 'Get token balance',
    },
    {
      name: 'Get Token Transfers',
      value: 'getTokenTransfers',
      description: 'Get list of ERC-20 token transfer events',
      action: 'Get token transfers',
    },
    {
      name: 'Get NFT Transfers',
      value: 'getNftTransfers',
      description: 'Get list of ERC-721 token transfer events',
      action: 'Get NFT transfers',
    },
    {
      name: 'Get Token Info',
      value: 'getTokenInfo',
      description: 'Get ERC-20 token information by contract address',
      action: 'Get token info',
    },
    {
      name: 'Get Token Holders',
      value: 'getTokenHolders',
      description: 'Get token holder list by contract address',
      action: 'Get token holders',
    },
    {
      name: 'Get Balance',
      value: 'getBalance',
      description: 'Get token balance via contract call',
      action: 'Get token balance via contract call',
    },
    {
      name: 'Get Token Metadata',
      value: 'getMetadata',
      description: 'Get token metadata (name, symbol, decimals)',
      action: 'Get token metadata',
    },
    {
      name: 'Get Transfer Events',
      value: 'getTransferEvents',
      description: 'Get token transfer events from logs',
      action: 'Get transfer events',
    },
  ],
  default: 'getTokenBalance',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['block'],
    },
  },
  options: [
    {
      name: 'Get Latest Block',
      value: 'getLatestBlock',
      description: 'Returns the number of most recent block',
      action: 'Get latest block number',
    },
    {
      name: 'Get Block By Number',
      value: 'getBlockByNumber',
      description: 'Returns information about a block by block number',
      action: 'Get block by number',
    },
    {
      name: 'Get Block Reward',
      value: 'getBlockReward',
      description: 'Get block and uncle rewards by block number',
      action: 'Get block reward',
    },
    {
      name: 'Get Block By Timestamp',
      value: 'getBlockByTimestamp',
      description: 'Get block number by timestamp',
      action: 'Get block by timestamp',
    },
    {
      name: 'Get Uncle Block',
      value: 'getUncleBlock',
      description: 'Returns information about uncle block',
      action: 'Get uncle block',
    },
    {
      name: 'Get Block Number',
      value: 'getBlockNumber',
      description: 'Get latest block number',
      action: 'Get latest block number via RPC',
    },
    {
      name: 'Get Block',
      value: 'getBlock',
      description: 'Get block details by number or hash',
      action: 'Get block details',
    },
    {
      name: 'Get Block Transaction Count',
      value: 'getBlockTransactionCount',
      description: 'Get transaction count in block',
      action: 'Get block transaction count',
    },
  ],
  default: 'getLatestBlock',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['stats'],
    },
  },
  options: [
    {
      name: 'Get Total Supply',
      value: 'getTotalSupply',
      description: 'Get total supply of CRO tokens',
      action: 'Get total supply of CRO tokens',
    },
    {
      name: 'Get Cronos Supply',
      value: 'getCronosSupply',
      description: 'Get total CRO supply',
      action: 'Get total CRO supply',
    },
    {
      name: 'Get Crono Price',
      value: 'getCronoPrice',
      description: 'Get latest CRO price',
      action: 'Get latest CRO price',
    },
    {
      name: 'Get Node Count',
      value: 'getNodeCount',
      description: 'Get total node count',
      action: 'Get total node count',
    },
    {
      name: 'Get Gas Price',
      value: 'getGasPrice',
      description: 'Returns current gas price in wei',
      action: 'Get current gas price',
    },
  ],
  default: 'getTotalSupply',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['network'] } },
  options: [
    { name: 'Get Chain ID', value: 'getChainId', description: 'Get Cronos chain ID', action: 'Get chain ID' },
    { name: 'Get Sync Status', value: 'syncing', description: 'Get node synchronization status', action: 'Get sync status' },
    { name: 'Get Protocol Version', value: 'getProtocolVersion', description: 'Get Ethereum protocol version', action: 'Get protocol version' }
  ],
  default: 'getChainId',
},
      // Parameter definitions
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance'],
    },
  },
  default: '',
  description: 'The Cronos address to get balance for',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getBalance'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'The block parameter to retrieve balance from',
},
{
  displayName: 'Addresses',
  name: 'addresses',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getMultipleBalances'],
    },
  },
  default: '',
  description: 'Comma-separated list of addresses to get balances for (max 20)',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getMultipleBalances'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'The block parameter to retrieve balances from',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactions'],
    },
  },
  default: '',
  description: 'The address to get transactions for',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number (0 = genesis block)',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number (99999999 = latest block)',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactions'],
    },
  },
  default: 1,
  description: 'Page number (1-based)',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions displayed per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getInternalTransactions'],
    },
  },
  default: '',
  description: 'The address to get internal transactions for',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number (0 = genesis block)',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number (99999999 = latest block)',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 1,
  description: 'Page number (1-based)',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getInternalTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions displayed per page (max 10000)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getInternalTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  default: '',
  description: 'The address to get token transactions for',
},
{
  displayName: 'Contract Address',
  name: 'contractaddress',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  default: '',
  description: 'The token contract address (optional - leave empty for all tokens)',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 1,
  description: 'Page number (1-based)',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 10,
  description: 'Number of transactions displayed per page (max 10000)',
},
{
  displayName: 'Start Block',
  name: 'startblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 0,
  description: 'Starting block number (0 = genesis block)',
},
{
  displayName: 'End Block',
  name: 'endblock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  default: 99999999,
  description: 'Ending block number (99999999 = latest block)',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTokenTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['account'], operation: ['getTransactionCount', 'getCode'] } },
  default: '',
  description: 'The address to query (must be a valid hex string)',
},
{
  displayName: 'Block',
  name: 'block',
  type: 'string',
  displayOptions: { show: { resource: ['account'], operation: ['getTransactionCount', 'getCode'] } },
  default: 'latest',
  description: 'Block number as hex, "latest", "earliest", or "pending"',
},
{
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash to lookup',
},
{
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionReceipt'],
    },
  },
  default: '',
  description: 'The transaction hash to get receipt for',
},
{
  displayName: 'Transaction Hash',
  name: 'txhash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionStatus'],
    },
  },
  default: '',
  description: 'The transaction hash to check status for',
},
{
  displayName: 'Raw Transaction Hex',
  name: 'hex',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['sendRawTransaction'],
    },
  },
  default: '',
  description: 'The signed transaction hex string to broadcast',
},
{
  displayName: 'Signed Transaction',
  name: 'signedTransaction',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['transaction'], operation: ['sendRawTransaction'] } },
  default: '',
  description: 'The signed transaction data as a hex string',
  placeholder: '0x...',
},
{
  displayName: 'Transaction Hash',
  name: 'transactionHash',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['transaction'], operation: ['getTransaction', 'getTransactionReceipt'] } },
  default: '',
  description: 'The transaction hash to retrieve',
  placeholder: '0x...',
},
{
  displayName: 'From Address',
  name: 'fromAddress',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['transaction'], operation: ['estimateGas'] } },
  default: '',
  description: 'The address the transaction is sent from',
  placeholder: '0x...',
},
{
  displayName: 'To Address',
  name: 'toAddress',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['transaction'], operation: ['estimateGas'] } },
  default: '',
  description: 'The address the transaction is directed to',
  placeholder: '0x...',
},
{
  displayName: 'Value',
  name: 'value',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['transaction'], operation: ['estimateGas'] } },
  default: '',
  description: 'Integer of the value sent with this transaction (in wei)',
  placeholder: '0x0',
},
{
  displayName: 'Gas',
  name: 'gas',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['transaction'], operation: ['estimateGas'] } },
  default: '',
  description: 'Integer of the gas provided for the transaction execution',
  placeholder: '0x5208',
},
{
  displayName: 'Gas Price',
  name: 'gasPrice',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['transaction'], operation: ['estimateGas'] } },
  default: '',
  description: 'Integer of the gasPrice used for each paid gas',
  placeholder: '0x9184e72a000',
},
{
  displayName: 'Data',
  name: 'data',
  type: 'string',
  required: false,
  displayOptions: { show: { resource: ['transaction'], operation: ['estimateGas'] } },
  default: '',
  description: 'Hash of the method signature and encoded parameters',
  placeholder: '0x...',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['getContractAbi', 'getSourceCode'],
    },
  },
  default: '',
  description: 'The contract address to retrieve ABI or source code for',
},
{
  displayName: 'Contract Address',
  name: 'contractaddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifySourceCode'],
    },
  },
  default: '',
  description: 'The contract address to verify',
},
{
  displayName: 'Source Code',
  name: 'sourceCode',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifySourceCode'],
    },
  },
  default: '',
  description: 'The contract source code',
  typeOptions: {
    rows: 10,
  },
},
{
  displayName: 'Contract Name',
  name: 'contractname',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifySourceCode'],
    },
  },
  default: '',
  description: 'The name of the contract',
},
{
  displayName: 'Compiler Version',
  name: 'compilerversion',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['verifySourceCode'],
    },
  },
  default: '',
  description: 'The compiler version used (e.g., v0.8.19+commit.7dd6d404)',
},
{
  displayName: 'GUID',
  name: 'guid',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['checkVerificationStatus'],
    },
  },
  default: '',
  description: 'The GUID returned from the verification request',
},
{
  displayName: 'To Address',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['callContract'],
    },
  },
  default: '',
  description: 'The contract address to call',
},
{
  displayName: 'Data',
  name: 'data',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['callContract'],
    },
  },
  default: '',
  description: 'The encoded function call data',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['smartContract'],
      operation: ['callContract'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
      description: 'Latest block',
    },
    {
      name: 'Earliest',
      value: 'earliest',
      description: 'Earliest block',
    },
    {
      name: 'Pending',
      value: 'pending',
      description: 'Pending block',
    },
  ],
  default: 'latest',
  description: 'The block tag to execute the call against',
},
{
  displayName: 'Transaction Object',
  name: 'transaction',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['smartContract'], operation: ['call'] } },
  default: '{"to":"0x...","data":"0x..."}',
  description: 'The transaction call object with to, data, from (optional), gas (optional), gasPrice (optional), value (optional)',
},
{
  displayName: 'Block Parameter',
  name: 'block',
  type: 'string',
  displayOptions: { show: { resource: ['smartContract'], operation: ['call'] } },
  default: 'latest',
  description: 'Block number (hex), "latest", "earliest", or "pending"',
},
{
  displayName: 'From Block',
  name: 'fromBlock',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['smartContract'], operation: ['getLogs'] } },
  default: 'latest',
  description: 'Starting block number (hex), "latest", "earliest", or "pending"',
},
{
  displayName: 'To Block',
  name: 'toBlock',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['smartContract'], operation: ['getLogs'] } },
  default: 'latest',
  description: 'Ending block number (hex), "latest", "earliest", or "pending"',
},
{
  displayName: 'Contract Address',
  name: 'address',
  type: 'string',
  displayOptions: { show: { resource: ['smartContract'], operation: ['getLogs', 'getStorageAt'] } },
  default: '',
  description: 'Contract address to filter logs from or get storage from',
},
{
  displayName: 'Topics',
  name: 'topics',
  type: 'json',
  displayOptions: { show: { resource: ['smartContract'], operation: ['getLogs'] } },
  default: '[]',
  description: 'Array of 32-byte DATA topics. Topics are order-dependent',
},
{
  displayName: 'Storage Position',
  name: 'position',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['smartContract'], operation: ['getStorageAt'] } },
  default: '0x0',
  description: 'The position (hex string) in the storage',
},
{
  displayName: 'Contract Address',
  name: 'contractAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalance', 'getTokenTransfers', 'getNftTransfers', 'getTokenInfo', 'getTokenHolders'],
    },
  },
  default: '',
  description: 'The token contract address',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalance', 'getTokenTransfers', 'getNftTransfers'],
    },
  },
  default: '',
  description: 'The wallet address',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenBalance'],
    },
  },
  options: [
    {
      name: 'Latest',
      value: 'latest',
    },
    {
      name: 'Earliest',
      value: 'earliest',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'latest',
  description: 'The block parameter',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenTransfers', 'getNftTransfers', 'getTokenHolders'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenTransfers', 'getNftTransfers', 'getTokenHolders'],
    },
  },
  default: 10,
  description: 'Number of items per page (max 10000)',
},
{
  displayName: 'Start Block',
  name: 'startBlock',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenTransfers', 'getNftTransfers'],
    },
  },
  default: 0,
  description: 'Starting block number',
},
{
  displayName: 'End Block',
  name: 'endBlock',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenTransfers', 'getNftTransfers'],
    },
  },
  default: 'latest',
  description: 'Ending block number or "latest"',
},
{
  displayName: 'Sort',
  name: 'sort',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['token'],
      operation: ['getTokenTransfers', 'getNftTransfers'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'Sort order for results',
},
{
	displayName: 'Contract Address',
	name: 'contractAddress',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getBalance', 'getMetadata'],
		},
	},
	default: '',
	placeholder: '0x...',
	description: 'The ERC-20/CRC-20 token contract address',
},
{
	displayName: 'Method Call',
	name: 'methodCall',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getBalance', 'getMetadata'],
		},
	},
	default: '',
	placeholder: '0x...',
	description: 'The encoded method call data for the contract function',
},
{
	displayName: 'Block',
	name: 'block',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getBalance', 'getMetadata'],
		},
	},
	default: 'latest',
	placeholder: 'latest, earliest, pending, or hex block number',
	description: 'Block number to query (latest, earliest, pending, or hex number)',
},
{
	displayName: 'From Block',
	name: 'fromBlock',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getTransferEvents'],
		},
	},
	default: 'latest',
	placeholder: 'latest, earliest, or hex block number',
	description: 'Starting block number for log search',
},
{
	displayName: 'To Block',
	name: 'toBlock',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getTransferEvents'],
		},
	},
	default: 'latest',
	placeholder: 'latest, earliest, or hex block number',
	description: 'Ending block number for log search',
},
{
	displayName: 'Contract Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getTransferEvents'],
		},
	},
	default: '',
	placeholder: '0x...',
	description: 'Token contract address to filter logs',
},
{
	displayName: 'Transfer Topics',
	name: 'transferTopics',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['token'],
			operation: ['getTransferEvents'],
		},
	},
	default: '["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]',
	description: 'Topics array for filtering transfer events (JSON array format)',
},
{
  displayName: 'Block Number',
  name: 'tag',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber'],
    },
  },
  default: 'latest',
  description: 'The block number in hex format or "latest"',
},
{
  displayName: 'Full Transaction Objects',
  name: 'boolean',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByNumber'],
    },
  },
  default: false,
  description: 'Whether to return full transaction objects or just transaction hashes',
},
{
  displayName: 'Block Number',
  name: 'blockno',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockReward'],
    },
  },
  default: '',
  description: 'The block number to get rewards for',
},
{
  displayName: 'Timestamp',
  name: 'timestamp',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByTimestamp'],
    },
  },
  default: '',
  description: 'The timestamp in Unix time format',
},
{
  displayName: 'Closest',
  name: 'closest',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockByTimestamp'],
    },
  },
  options: [
    {
      name: 'Before',
      value: 'before',
    },
    {
      name: 'After',
      value: 'after',
    },
  ],
  default: 'before',
  description: 'Find the closest block before or after the given timestamp',
},
{
  displayName: 'Block Number',
  name: 'tag',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getUncleBlock'],
    },
  },
  default: 'latest',
  description: 'The block number in hex format or "latest"',
},
{
  displayName: 'Uncle Index',
  name: 'index',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getUncleBlock'],
    },
  },
  default: '0x0',
  description: 'The uncle block index position in hex format',
},
{
  displayName: 'Block Number/Hash',
  name: 'blockNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlock']
    }
  },
  default: 'latest',
  description: 'Block number (hex format), hash, or one of: "latest", "earliest", "pending"',
},
{
  displayName: 'Include Transactions',
  name: 'includeTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlock']
    }
  },
  default: false,
  description: 'Whether to include full transaction objects or just transaction hashes',
},
{
  displayName: 'Block Number/Hash',
  name: 'blockNumber',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['block'],
      operation: ['getBlockTransactionCount']
    }
  },
  default: 'latest',
  description: 'Block number (hex format), hash, or one of: "latest", "earliest", "pending"',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'smartContract':
        return [await executeSmartContractOperations.call(this, items)];
      case 'token':
        return [await executeTokenOperations.call(this, items)];
      case 'block':
        return [await executeBlockOperations.call(this, items)];
      case 'stats':
        return [await executeStatsOperations.call(this, items)];
      case 'network':
        return [await executeNetworkOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('cronosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          
          const queryParams = new URLSearchParams({
            module: 'account',
            action: 'balance',
            address: address,
            tag: tag,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${queryParams.toString()}`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getMultipleBalances': {
          const addresses = this.getNodeParameter('addresses', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          
          const queryParams = new URLSearchParams({
            module: 'account',
            action: 'balancemulti',
            address: addresses,
            tag: tag,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${queryParams.toString()}`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;
          
          const queryParams = new URLSearchParams({
            module: 'account',
            action: 'txlist',
            address: address,
            startblock: startblock.toString(),
            endblock: endblock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: sort,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${queryParams.toString()}`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getInternalTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;
          
          const queryParams = new URLSearchParams({
            module: 'account',
            action: 'txlistinternal',
            address: address,
            startblock: startblock.toString(),
            endblock: endblock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: sort,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${queryParams.toString()}`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTokenTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const startblock = this.getNodeParameter('startblock', i) as number;
          const endblock = this.getNodeParameter('endblock', i) as number;
          const sort = this.getNodeParameter('sort', i) as string;
          
          const queryParams = new URLSearchParams({
            module: 'account',
            action: 'tokentx',
            address: address,
            page: page.toString(),
            offset: offset.toString(),
            startblock: startblock.toString(),
            endblock: endblock.toString(),
            sort: sort,
            apikey: credentials.apiKey,
          });
          
          if (contractaddress) {
            queryParams.append('contractaddress', contractaddress);
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${queryParams.toString()}`,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactionCount': {
          const address = this.getNodeParameter('address', i) as string;
          const block = this.getNodeParameter('block', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [address, block],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://evm.cronos.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCode': {
          const address = this.getNodeParameter('address', i) as string;
          const block = this.getNodeParameter('block', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [address, block],
            id: 1,
          };

          const options: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://evm.cronos.org',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }
  
  return returnData;
}

async function executeTransactionOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('cronosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://cronos.org/explorer/api';
      
      switch (operation) {
        case 'getTransaction': {
          const txhash = this.getNodeParameter('txhash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/api`,
            qs: {
              module: 'proxy',
              action: 'eth_getTransactionByHash',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionReceipt': {
          const txhash = this.getNodeParameter('txhash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/api`,
            qs: {
              module: 'proxy',
              action: 'eth_getTransactionReceipt',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getTransactionStatus': {
          const txhash = this.getNodeParameter('txhash', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/api`,
            qs: {
              module: 'transaction',
              action: 'gettxreceiptstatus',
              txhash: txhash,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'sendRawTransaction': {
          const hex = this.getNodeParameter('hex', i, '') as string;
          const signedTransaction = this.getNodeParameter('signedTransaction', i, '') as string;
          
          // Use hex parameter if available, otherwise use signedTransaction
          const transactionHex = hex || signedTransaction;
          
          let rpcId = Math.floor(Math.random() * 10000);

          const baseOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://evm.cronos.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            baseOptions.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          baseOptions.body = {
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [transactionHex],
            id: rpcId,
          };

          result = await this.helpers.httpRequest(baseOptions) as any;
          break;
        }

        case 'estimateGas': {
          const fromAddress = this.getNodeParameter('fromAddress', i) as string;
          const toAddress = this.getNodeParameter('toAddress', i, '') as string;
          const value = this.getNodeParameter('value', i, '0x0') as string;
          const gas = this.getNodeParameter('gas', i, '') as string;
          const gasPrice = this.getNodeParameter('gasPrice', i, '') as string;
          const data = this.getNodeParameter('data', i, '') as string;

          const transactionObject: any = {
            from: fromAddress,
          };

          if (toAddress) transactionObject.to = toAddress;
          if (value) transactionObject.value = value;
          if (gas) transactionObject.gas = gas;
          if (gasPrice) transactionObject.gasPrice = gasPrice;
          if (data) transactionObject.data = data;
          
          let rpcId = Math.floor(Math.random() * 10000);

          const baseOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://evm.cronos.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            baseOptions.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          baseOptions.body = {
            jsonrpc: '2.0',
            method: 'eth_estimateGas',
            params: [transactionObject],
            id: rpcId,
          };

          result = await this.helpers.httpRequest(baseOptions) as any;
          break;
        }

        case 'getGasPrice': {
          let rpcId = Math.floor(Math.random() * 10000);

          const baseOptions: any = {
            method: 'POST',
            url: credentials.baseUrl || 'https://evm.cronos.org',
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            baseOptions.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          baseOptions.body = {
            jsonrpc: '2.0',
            method: 'eth_gasPrice',
            params: [],
            id: rpcId,
          };

          result = await this.helpers.httpRequest(baseOptions) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result && result.status === '0' && result.message) {
        throw new NodeApiError(this.getNode(), { message: result.message, result });
      }

      if (result && result.error) {
        throw new NodeOperationError(
          this.getNode(),
          `Cronos RPC Error: ${result.error.message}`,
          { itemIndex: i },
        );
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }
  return returnData;
}

async function executeSmartContractOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('cronosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getContractAbi': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'contract',
              action: 'getabi',
              address: address,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          
          if (result.status !== '1') {
            throw new NodeApiError(this.getNode(), result, {
              message: result.message || 'Failed to get contract ABI',
              description: `Error retrieving ABI for contract ${address}`,
            });
          }
          break;
        }

        case 'getSourceCode': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'contract',
              action: 'getsourcecode',
              address: address,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          
          if (result.status !== '1') {
            throw new NodeApiError(this.getNode(), result, {
              message: result.message || 'Failed to get source code',
              description: `Error retrieving source code for contract ${address}`,
            });
          }
          break;
        }

        case 'verifySourceCode': {
          const contractaddress = this.getNodeParameter('contractaddress', i) as string;
          const sourceCode = this.getNodeParameter('sourceCode', i) as string;
          const contractname =