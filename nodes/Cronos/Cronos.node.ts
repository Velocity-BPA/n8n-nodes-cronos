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
            name: 'SmartContract',
            value: 'smartContract',
          },
          {
            name: 'Token',
            value: 'token',
          },
          {
            name: 'Block',
            value: 'block',
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
      name: 'Get Transaction Count',
      value: 'getTransactionCount',
      description: 'Returns number of transactions sent from an address',
      action: 'Get transaction count',
    },
    {
      name: 'Send Raw Transaction',
      value: 'sendRawTransaction',
      description: 'Submits a pre-signed transaction for broadcast',
      action: 'Send raw transaction',
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
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionCount'],
    },
  },
  default: '',
  description: 'The address to get transaction count for',
},
{
  displayName: 'Tag',
  name: 'tag',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactionCount'],
    },
  },
  default: 'latest',
  description: 'The block tag (latest, earliest, pending, or block number)',
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
        
        case 'getTransactionCount': {
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/api`,
            qs: {
              module: 'proxy',
              action: 'eth_getTransactionCount',
              address: address,
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'sendRawTransaction': {
          const hex = this.getNodeParameter('hex', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/api`,
            qs: {
              module: 'proxy',
              action: 'eth_sendRawTransaction',
              hex: hex,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result && result.status === '0' && result.message) {
        throw new NodeApiError(this.getNode(), { message: result.message, result });
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
          const contractname = this.getNodeParameter('contractname', i) as string;
          const compilerversion = this.getNodeParameter('compilerversion', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/api`,
            form: {
              module: 'contract',
              action: 'verifysourcecode',
              contractaddress: contractaddress,
              sourceCode: sourceCode,
              contractname: contractname,
              compilerversion: compilerversion,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          
          if (result.status !== '1') {
            throw new NodeApiError(this.getNode(), result, {
              message: result.message || 'Failed to verify source code',
              description: `Error verifying source code for contract ${contractaddress}`,
            });
          }
          break;
        }

        case 'checkVerificationStatus': {
          const guid = this.getNodeParameter('guid', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'contract',
              action: 'checkverifystatus',
              guid: guid,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'callContract': {
          const to = this.getNodeParameter('to', i) as string;
          const data = this.getNodeParameter('data', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'proxy',
              action: 'eth_call',
              to: to,
              data: data,
              tag: tag,
              apikey: credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          
          if (result.error) {
            throw new NodeApiError(this.getNode(), result, {
              message: result.error.message || 'Contract call failed',
              description: `Error calling contract ${to}`,
            });
          }
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
        throw error;
      }
    }
  }

  return returnData;
}

async function executeTokenOperations(
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
        case 'getTokenBalance': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const tag = this.getNodeParameter('tag', i) as string;

          const params = new URLSearchParams({
            module: 'account',
            action: 'tokenbalance',
            contractaddress: contractAddress,
            address: address,
            tag: tag,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${params.toString()}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenTransfers': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const startBlock = this.getNodeParameter('startBlock', i) as number;
          const endBlock = this.getNodeParameter('endBlock', i) as string;
          const sort = this.getNodeParameter('sort', i) as string;

          const params = new URLSearchParams({
            module: 'account',
            action: 'tokentx',
            contractaddress: contractAddress,
            address: address,
            page: page.toString(),
            offset: offset.toString(),
            startblock: startBlock.toString(),
            endblock: endBlock,
            sort: sort,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${params.toString()}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getNftTransfers': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const address = this.getNodeParameter('address', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const startBlock = this.getNodeParameter('startBlock', i) as number;
          const endBlock = this.getNodeParameter('endBlock', i) as string;
          const sort = this.getNodeParameter('sort', i) as string;

          const params = new URLSearchParams({
            module: 'account',
            action: 'tokennfttx',
            contractaddress: contractAddress,
            address: address,
            page: page.toString(),
            offset: offset.toString(),
            startblock: startBlock.toString(),
            endblock: endBlock,
            sort: sort,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${params.toString()}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenInfo': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;

          const params = new URLSearchParams({
            module: 'token',
            action: 'tokeninfo',
            contractaddress: contractAddress,
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${params.toString()}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTokenHolders': {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const params = new URLSearchParams({
            module: 'token',
            action: 'tokenholderlist',
            contractaddress: contractAddress,
            page: page.toString(),
            offset: offset.toString(),
            apikey: credentials.apiKey,
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://cronos.org/explorer/api'}?${params.toString()}`,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      if (result.status === '0') {
        throw new NodeApiError(this.getNode(), result, {
          message: result.message || 'API request failed',
        });
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeBlockOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('cronosApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = 'https://cronos.org/explorer/api';

      switch (operation) {
        case 'getLatestBlock': {
          const options: any = {
            method: 'GET',
            url: baseUrl,
            qs: {
              module: 'proxy',
              action: 'eth_blockNumber',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockByNumber': {
          const tag = this.getNodeParameter('tag', i) as string;
          const fullTx = this.getNodeParameter('boolean', i) as boolean;
          
          const options: any = {
            method: 'GET',
            url: baseUrl,
            qs: {
              module: 'proxy',
              action: 'eth_getBlockByNumber',
              tag: tag,
              boolean: fullTx.toString(),
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockReward': {
          const blockno = this.getNodeParameter('blockno', i) as string;
          
          const options: any = {
            method: 'GET',
            url: baseUrl,
            qs: {
              module: 'block',
              action: 'getblockreward',
              blockno: blockno,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBlockByTimestamp': {
          const timestamp = this.getNodeParameter('timestamp', i) as string;
          const closest = this.getNodeParameter('closest', i) as string;
          
          const options: any = {
            method: 'GET',
            url: baseUrl,
            qs: {
              module: 'block',
              action: 'getblocknobytime',
              timestamp: timestamp,
              closest: closest,
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getUncleBlock': {
          const tag = this.getNodeParameter('tag', i) as string;
          const index = this.getNodeParameter('index', i) as string;
          
          const options: any = {
            method: 'GET',
            url: baseUrl,
            qs: {
              module: 'proxy',
              action: 'eth_getUncleByBlockNumberAndIndex',
              tag: tag,
              index: index,
              apikey: credentials.apiKey,
            },
            json: true,
          };
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

async function executeStatsOperations(
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
        case 'getTotalSupply': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'stats',
              action: 'tokensupply',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCronosSupply': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'stats',
              action: 'cronosupply',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCronoPrice': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'stats',
              action: 'cronoprice',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getNodeCount': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'stats',
              action: 'nodecount',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getGasPrice': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/api`,
            qs: {
              module: 'proxy',
              action: 'eth_gasPrice',
              apikey: credentials.apiKey,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}
