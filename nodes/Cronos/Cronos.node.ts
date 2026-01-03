/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { accountsOperations } from './actions/accounts';
import { transactionsOperations } from './actions/transactions';
import { blocksOperations } from './actions/blocks';
import { smartContractsOperations } from './actions/smartContracts';
import { tokensOperations } from './actions/tokens';
import { nftsOperations } from './actions/nfts';
import { defiOperations } from './actions/defi';
import { networkOperations } from './actions/network';
import { eventsOperations } from './actions/events';
import { utilityOperations } from './actions/utility';

// Emit licensing notice once per node load
const LICENSING_NOTICE_EMITTED = Symbol.for('cronos_licensing_notice');
if (!(globalThis as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED]) {
	console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
	(globalThis as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED] = true;
}

export class Cronos implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cronos',
		name: 'cronos',
		icon: 'file:cronos.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Cronos blockchain - EVM-compatible chain by Crypto.com',
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'accounts' },
					{ name: 'Block', value: 'blocks' },
					{ name: 'DeFi', value: 'defi' },
					{ name: 'Event', value: 'events' },
					{ name: 'Network', value: 'network' },
					{ name: 'NFT', value: 'nfts' },
					{ name: 'Smart Contract', value: 'smartContracts' },
					{ name: 'Token', value: 'tokens' },
					{ name: 'Transaction', value: 'transactions' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'accounts',
			},

			// ==================== ACCOUNTS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['accounts'] } },
				options: [
					{ name: 'Get Balance', value: 'getBalance', description: 'Get CRO balance of an address', action: 'Get CRO balance' },
					{ name: 'Get NFTs', value: 'getNFTs', description: 'Get NFTs owned by address', action: 'Get NFTs owned by address' },
					{ name: 'Get Token Balances', value: 'getTokenBalances', description: 'Get ERC-20 token balances', action: 'Get token balances' },
					{ name: 'Get Token Transfers', value: 'getTokenTransfers', description: 'Get token transfer history', action: 'Get token transfers' },
					{ name: 'Get Transaction History', value: 'getTransactionHistory', description: 'Get account transactions', action: 'Get transaction history' },
				],
				default: 'getBalance',
			},

			// ==================== TRANSACTIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['transactions'] } },
				options: [
					{ name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas for transaction', action: 'Estimate gas' },
					{ name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction details', action: 'Get transaction' },
					{ name: 'Get Transaction Receipt', value: 'getTransactionReceipt', description: 'Get transaction receipt', action: 'Get transaction receipt' },
					{ name: 'Get Transaction Status', value: 'getTransactionStatus', description: 'Get confirmation status', action: 'Get transaction status' },
					{ name: 'Send Transaction', value: 'sendTransaction', description: 'Submit a transaction', action: 'Send transaction' },
				],
				default: 'getTransaction',
			},

			// ==================== BLOCKS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['blocks'] } },
				options: [
					{ name: 'Get Block', value: 'getBlock', description: 'Get block details', action: 'Get block' },
					{ name: 'Get Block by Timestamp', value: 'getBlockByTimestamp', description: 'Find block by timestamp', action: 'Get block by timestamp' },
					{ name: 'Get Block Transactions', value: 'getBlockTransactions', description: 'Get transactions in block', action: 'Get block transactions' },
					{ name: 'Get Latest Block', value: 'getLatestBlock', description: 'Get current block', action: 'Get latest block' },
				],
				default: 'getLatestBlock',
			},

			// ==================== SMART CONTRACTS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['smartContracts'] } },
				options: [
					{ name: 'Deploy Contract', value: 'deployContract', description: 'Deploy new contract', action: 'Deploy contract' },
					{ name: 'Get Contract ABI', value: 'getContractABI', description: 'Get contract interface', action: 'Get contract ABI' },
					{ name: 'Get Contract Events', value: 'getContractEvents', description: 'Get event logs', action: 'Get contract events' },
					{ name: 'Get Contract Source', value: 'getContractSource', description: 'Get verified source', action: 'Get contract source' },
					{ name: 'Read Contract', value: 'readContract', description: 'Call view function', action: 'Read contract' },
					{ name: 'Write Contract', value: 'writeContract', description: 'Send transaction to contract', action: 'Write contract' },
				],
				default: 'readContract',
			},

			// ==================== TOKENS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['tokens'] } },
				options: [
					{ name: 'Get Token Holders', value: 'getTokenHolders', description: 'Get holder list', action: 'Get token holders' },
					{ name: 'Get Token Info', value: 'getTokenInfo', description: 'Get token details', action: 'Get token info' },
					{ name: 'Get Token Price', value: 'getTokenPrice', description: 'Get current price', action: 'Get token price' },
					{ name: 'Get Token Transfers', value: 'getTokenTransfers', description: 'Get transfer history', action: 'Get token transfers' },
					{ name: 'Get Top Tokens', value: 'getTopTokens', description: 'Get tokens by market cap', action: 'Get top tokens' },
				],
				default: 'getTokenInfo',
			},

			// ==================== NFTS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['nfts'] } },
				options: [
					{ name: 'Get Collection Info', value: 'getCollectionInfo', description: 'Get collection details', action: 'Get collection info' },
					{ name: 'Get NFT Metadata', value: 'getNFTMetadata', description: 'Get token metadata', action: 'Get NFT metadata' },
					{ name: 'Get NFT Owners', value: 'getNFTOwners', description: 'Get current owners', action: 'Get NFT owners' },
					{ name: 'Get NFT Transfers', value: 'getNFTTransfers', description: 'Get transfer history', action: 'Get NFT transfers' },
				],
				default: 'getNFTMetadata',
			},

			// ==================== DEFI ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['defi'] } },
				options: [
					{ name: 'Get DEX Stats', value: 'getDEXStats', description: 'Get exchange metrics', action: 'Get DEX stats' },
					{ name: 'Get Pool Info', value: 'getPoolInfo', description: 'Get LP pool details', action: 'Get pool info' },
					{ name: 'Get Protocol TVL', value: 'getProtocolTVL', description: 'Get locked value', action: 'Get protocol TVL' },
					{ name: 'Get Yield Farms', value: 'getYieldFarms', description: 'Get active farms', action: 'Get yield farms' },
				],
				default: 'getProtocolTVL',
			},

			// ==================== NETWORK ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['network'] } },
				options: [
					{ name: 'Get Chain Stats', value: 'getChainStats', description: 'Get network metrics', action: 'Get chain stats' },
					{ name: 'Get Gas Price', value: 'getGasPrice', description: 'Get current gas price', action: 'Get gas price' },
					{ name: 'Get Network Status', value: 'getNetworkStatus', description: 'Get chain status', action: 'Get network status' },
					{ name: 'Get Validators', value: 'getValidators', description: 'Get validator list', action: 'Get validators' },
				],
				default: 'getNetworkStatus',
			},

			// ==================== EVENTS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['events'] } },
				options: [
					{ name: 'Filter Events', value: 'filterEvents', description: 'Filter by event type', action: 'Filter events' },
					{ name: 'Get Logs', value: 'getLogs', description: 'Get event logs', action: 'Get logs' },
					{ name: 'Subscribe to Logs', value: 'subscribeToLogs', description: 'WebSocket subscription info', action: 'Subscribe to logs' },
				],
				default: 'getLogs',
			},

			// ==================== UTILITY ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['utility'] } },
				options: [
					{ name: 'Convert Units', value: 'convertUnits', description: 'CRO/Wei conversion', action: 'Convert units' },
					{ name: 'Decode Data', value: 'decodeData', description: 'ABI decode', action: 'Decode data' },
					{ name: 'Encode Function', value: 'encodeFunction', description: 'ABI encode', action: 'Encode function' },
					{ name: 'Get API Health', value: 'getAPIHealth', description: 'Check service status', action: 'Get API health' },
				],
				default: 'convertUnits',
			},

			// ==================== PARAMETERS ====================

			// Common address parameter
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Wallet or contract address',
				displayOptions: {
					show: {
						resource: ['accounts'],
						operation: ['getBalance', 'getTokenBalances', 'getNFTs', 'getTransactionHistory', 'getTokenTransfers'],
					},
				},
			},

			// Block parameter for getBalance
			{
				displayName: 'Block Parameter',
				name: 'blockParameter',
				type: 'string',
				default: 'latest',
				description: 'Block number or "latest", "earliest", "pending"',
				displayOptions: {
					show: {
						resource: ['accounts'],
						operation: ['getBalance'],
					},
				},
			},

			// Token addresses for getTokenBalances
			{
				displayName: 'Token Addresses',
				name: 'tokenAddresses',
				type: 'string',
				default: '',
				placeholder: '0x..., 0x...',
				description: 'Comma-separated list of token contract addresses',
				displayOptions: {
					show: {
						resource: ['accounts'],
						operation: ['getTokenBalances'],
					},
				},
			},

			// Pagination parameters
			{
				displayName: 'Start Block',
				name: 'startBlock',
				type: 'number',
				default: 0,
				description: 'Starting block number',
				displayOptions: {
					show: {
						operation: ['getTransactionHistory', 'getTokenTransfers', 'getTokenTransfers', 'getNFTTransfers'],
					},
				},
			},
			{
				displayName: 'End Block',
				name: 'endBlock',
				type: 'number',
				default: 99999999,
				description: 'Ending block number',
				displayOptions: {
					show: {
						operation: ['getTransactionHistory', 'getTokenTransfers', 'getTokenTransfers', 'getNFTTransfers'],
					},
				},
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
				displayOptions: {
					show: {
						operation: ['getTransactionHistory', 'getTokenTransfers', 'getTokenHolders', 'getTokenTransfers', 'getNFTTransfers'],
					},
				},
			},
			{
				displayName: 'Results Per Page',
				name: 'offset',
				type: 'number',
				default: 100,
				description: 'Number of results per page (max 10000)',
				displayOptions: {
					show: {
						operation: ['getTransactionHistory', 'getTokenTransfers', 'getTokenHolders', 'getTokenTransfers', 'getNFTTransfers'],
					},
				},
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Sort order',
				displayOptions: {
					show: {
						operation: ['getTransactionHistory', 'getTokenTransfers', 'getTokenTransfers', 'getNFTTransfers'],
					},
				},
			},

			// Contract address for token transfers filter
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Filter by specific token contract (optional)',
				displayOptions: {
					show: {
						resource: ['accounts', 'nfts'],
						operation: ['getTokenTransfers', 'getNFTMetadata', 'getNFTTransfers', 'getCollectionInfo', 'getNFTOwners'],
					},
				},
			},

			// Transaction hash
			{
				displayName: 'Transaction Hash',
				name: 'txHash',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Transaction hash',
				displayOptions: {
					show: {
						resource: ['transactions'],
						operation: ['getTransaction', 'getTransactionReceipt', 'getTransactionStatus'],
					},
				},
			},

			// Send transaction parameters
			{
				displayName: 'To Address',
				name: 'to',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Recipient address',
				displayOptions: {
					show: {
						resource: ['transactions'],
						operation: ['sendTransaction', 'estimateGas'],
					},
				},
			},
			{
				displayName: 'Value (CRO)',
				name: 'value',
				type: 'string',
				default: '0',
				description: 'Amount to send in CRO',
				displayOptions: {
					show: {
						resource: ['transactions', 'smartContracts'],
						operation: ['sendTransaction', 'estimateGas', 'writeContract', 'deployContract'],
					},
				},
			},
			{
				displayName: 'Data',
				name: 'data',
				type: 'string',
				default: '0x',
				description: 'Transaction data (hex encoded)',
				displayOptions: {
					show: {
						resource: ['transactions'],
						operation: ['sendTransaction', 'estimateGas'],
					},
				},
			},
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'string',
				default: '',
				description: 'Gas limit (leave empty to estimate)',
				displayOptions: {
					show: {
						operation: ['sendTransaction', 'writeContract', 'deployContract'],
					},
				},
			},
			{
				displayName: 'Gas Price (Gwei)',
				name: 'gasPrice',
				type: 'string',
				default: '',
				description: 'Gas price in Gwei (leave empty to use network price)',
				displayOptions: {
					show: {
						resource: ['transactions'],
						operation: ['sendTransaction'],
					},
				},
			},
			{
				displayName: 'Nonce',
				name: 'nonce',
				type: 'string',
				default: '',
				description: 'Transaction nonce (leave empty to auto-determine)',
				displayOptions: {
					show: {
						resource: ['transactions'],
						operation: ['sendTransaction'],
					},
				},
			},
			{
				displayName: 'From Address',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Sender address (for estimation)',
				displayOptions: {
					show: {
						resource: ['transactions'],
						operation: ['estimateGas'],
					},
				},
			},

			// Block parameters
			{
				displayName: 'Block Identifier',
				name: 'blockIdentifier',
				type: 'string',
				required: true,
				default: 'latest',
				description: 'Block number, hash, or "latest"/"earliest"/"pending"',
				displayOptions: {
					show: {
						resource: ['blocks'],
						operation: ['getBlock', 'getBlockTransactions'],
					},
				},
			},
			{
				displayName: 'Include Transactions',
				name: 'includeTransactions',
				type: 'boolean',
				default: false,
				description: 'Whether to include full transaction objects',
				displayOptions: {
					show: {
						resource: ['blocks'],
						operation: ['getBlock', 'getLatestBlock'],
					},
				},
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'number',
				required: true,
				default: 0,
				description: 'Unix timestamp',
				displayOptions: {
					show: {
						resource: ['blocks'],
						operation: ['getBlockByTimestamp'],
					},
				},
			},
			{
				displayName: 'Closest',
				name: 'closest',
				type: 'options',
				options: [
					{ name: 'Before', value: 'before' },
					{ name: 'After', value: 'after' },
				],
				default: 'before',
				description: 'Find block before or after timestamp',
				displayOptions: {
					show: {
						resource: ['blocks'],
						operation: ['getBlockByTimestamp'],
					},
				},
			},

			// Smart contract parameters
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Smart contract address',
				displayOptions: {
					show: {
						resource: ['smartContracts'],
						operation: ['getContractABI', 'readContract', 'writeContract', 'getContractSource', 'getContractEvents'],
					},
				},
			},
			{
				displayName: 'Function Signature',
				name: 'functionSignature',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x70a08231',
				description: 'Function selector (first 4 bytes of keccak256 hash)',
				displayOptions: {
					show: {
						resource: ['smartContracts', 'utility'],
						operation: ['readContract', 'writeContract', 'encodeFunction'],
					},
				},
			},
			{
				displayName: 'Function Parameters',
				name: 'functionParams',
				type: 'string',
				default: '[]',
				placeholder: '[{"type": "address", "value": "0x..."}]',
				description: 'JSON array of parameters with type and value',
				displayOptions: {
					show: {
						resource: ['smartContracts'],
						operation: ['readContract', 'writeContract'],
					},
				},
			},
			{
				displayName: 'Block Parameter',
				name: 'blockParameter',
				type: 'string',
				default: 'latest',
				description: 'Block number or "latest"',
				displayOptions: {
					show: {
						resource: ['smartContracts'],
						operation: ['readContract'],
					},
				},
			},
			{
				displayName: 'From Block',
				name: 'fromBlock',
				type: 'number',
				default: 0,
				description: 'Starting block',
				displayOptions: {
					show: {
						operation: ['getContractEvents', 'getLogs', 'filterEvents'],
					},
				},
			},
			{
				displayName: 'To Block',
				name: 'toBlock',
				type: 'string',
				default: 'latest',
				description: 'Ending block or "latest"',
				displayOptions: {
					show: {
						operation: ['getContractEvents', 'getLogs', 'filterEvents'],
					},
				},
			},
			{
				displayName: 'Topic 0 (Event Signature)',
				name: 'topic0',
				type: 'string',
				default: '',
				placeholder: '0xddf252ad...',
				description: 'Filter by event signature (optional)',
				displayOptions: {
					show: {
						resource: ['smartContracts'],
						operation: ['getContractEvents'],
					},
				},
			},
			{
				displayName: 'Bytecode',
				name: 'bytecode',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x608060...',
				description: 'Contract bytecode',
				displayOptions: {
					show: {
						resource: ['smartContracts'],
						operation: ['deployContract'],
					},
				},
			},
			{
				displayName: 'Constructor Parameters',
				name: 'constructorParams',
				type: 'string',
				default: '[]',
				placeholder: '[{"type": "address", "value": "0x..."}]',
				description: 'JSON array of constructor parameters',
				displayOptions: {
					show: {
						resource: ['smartContracts'],
						operation: ['deployContract'],
					},
				},
			},

			// Token parameters
			{
				displayName: 'Token Address',
				name: 'tokenAddress',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Token contract address',
				displayOptions: {
					show: {
						resource: ['tokens'],
						operation: ['getTokenInfo', 'getTokenHolders', 'getTokenTransfers', 'getTokenPrice'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 10,
				description: 'Number of results to return',
				displayOptions: {
					show: {
						resource: ['tokens'],
						operation: ['getTopTokens'],
					},
				},
			},

			// NFT parameters
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				required: true,
				default: '',
				description: 'NFT token ID',
				displayOptions: {
					show: {
						resource: ['nfts'],
						operation: ['getNFTMetadata', 'getNFTOwners'],
					},
				},
			},
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				default: '',
				description: 'NFT token ID (optional, leave empty for all)',
				displayOptions: {
					show: {
						resource: ['nfts'],
						operation: ['getNFTTransfers'],
					},
				},
			},

			// DeFi parameters
			{
				displayName: 'Protocol',
				name: 'protocol',
				type: 'options',
				options: [
					{ name: 'VVS Finance', value: 'vvs' },
					{ name: 'Tectonic', value: 'tectonic' },
					{ name: 'Other', value: 'other' },
				],
				default: 'vvs',
				description: 'DeFi protocol',
				displayOptions: {
					show: {
						resource: ['defi'],
						operation: ['getProtocolTVL', 'getYieldFarms'],
					},
				},
			},
			{
				displayName: 'Pool Address',
				name: 'poolAddress',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Liquidity pool address',
				displayOptions: {
					show: {
						resource: ['defi'],
						operation: ['getPoolInfo'],
					},
				},
			},
			{
				displayName: 'DEX',
				name: 'dex',
				type: 'options',
				options: [
					{ name: 'VVS Finance', value: 'vvs' },
					{ name: 'CronaSwap', value: 'crona' },
					{ name: 'Other', value: 'other' },
				],
				default: 'vvs',
				description: 'Decentralized exchange',
				displayOptions: {
					show: {
						resource: ['defi'],
						operation: ['getDEXStats'],
					},
				},
			},

			// Network parameters
			{
				displayName: 'Include History',
				name: 'includeHistory',
				type: 'boolean',
				default: false,
				description: 'Whether to include fee history',
				displayOptions: {
					show: {
						resource: ['network'],
						operation: ['getGasPrice'],
					},
				},
			},

			// Events parameters
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Filter by contract address (optional)',
				displayOptions: {
					show: {
						resource: ['events'],
						operation: ['getLogs', 'subscribeToLogs', 'filterEvents'],
					},
				},
			},
			{
				displayName: 'Topics',
				name: 'topics',
				type: 'string',
				default: '',
				placeholder: '["0x...", null, "0x..."]',
				description: 'JSON array of topics or single topic',
				displayOptions: {
					show: {
						resource: ['events'],
						operation: ['getLogs', 'subscribeToLogs'],
					},
				},
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [
					{ name: 'Transfer (ERC20/721)', value: 'transfer' },
					{ name: 'Approval', value: 'approval' },
					{ name: 'Transfer Single (ERC1155)', value: 'transferSingle' },
					{ name: 'Transfer Batch (ERC1155)', value: 'transferBatch' },
					{ name: 'Custom', value: 'custom' },
				],
				default: 'transfer',
				description: 'Type of event to filter',
				displayOptions: {
					show: {
						resource: ['events'],
						operation: ['filterEvents'],
					},
				},
			},

			// Utility parameters
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				required: true,
				default: '',
				description: 'Value to convert',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertUnits'],
					},
				},
			},
			{
				displayName: 'From Unit',
				name: 'fromUnit',
				type: 'options',
				options: [
					{ name: 'Wei', value: 'wei' },
					{ name: 'Gwei', value: 'gwei' },
					{ name: 'CRO', value: 'cro' },
					{ name: 'Custom Decimals', value: 'custom' },
				],
				default: 'wei',
				description: 'Source unit',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertUnits'],
					},
				},
			},
			{
				displayName: 'To Unit',
				name: 'toUnit',
				type: 'options',
				options: [
					{ name: 'Wei', value: 'wei' },
					{ name: 'Gwei', value: 'gwei' },
					{ name: 'CRO', value: 'cro' },
					{ name: 'Custom Decimals', value: 'custom' },
				],
				default: 'cro',
				description: 'Target unit',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertUnits'],
					},
				},
			},
			{
				displayName: 'Decimals',
				name: 'decimals',
				type: 'number',
				default: 18,
				description: 'Number of decimals for custom unit',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertUnits'],
					},
				},
			},
			{
				displayName: 'Parameters',
				name: 'parameters',
				type: 'string',
				default: '[]',
				placeholder: '[{"type": "address", "value": "0x..."}]',
				description: 'JSON array of parameters',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['encodeFunction'],
					},
				},
			},
			{
				displayName: 'Data',
				name: 'data',
				type: 'string',
				required: true,
				default: '',
				placeholder: '0x...',
				description: 'Hex encoded data to decode',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['decodeData'],
					},
				},
			},
			{
				displayName: 'Types',
				name: 'types',
				type: 'string',
				default: '',
				placeholder: '["address", "uint256"]',
				description: 'JSON array of types or comma-separated list',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['decodeData'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'accounts':
						result = await executeAccountsOperation.call(this, operation, i);
						break;
					case 'transactions':
						result = await executeTransactionsOperation.call(this, operation, i);
						break;
					case 'blocks':
						result = await executeBlocksOperation.call(this, operation, i);
						break;
					case 'smartContracts':
						result = await executeSmartContractsOperation.call(this, operation, i);
						break;
					case 'tokens':
						result = await executeTokensOperation.call(this, operation, i);
						break;
					case 'nfts':
						result = await executeNftsOperation.call(this, operation, i);
						break;
					case 'defi':
						result = await executeDefiOperation.call(this, operation, i);
						break;
					case 'network':
						result = await executeNetworkOperation.call(this, operation, i);
						break;
					case 'events':
						result = await executeEventsOperation.call(this, operation, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function executeAccountsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getBalance':
			return accountsOperations.getBalance.call(this, index);
		case 'getTokenBalances':
			return accountsOperations.getTokenBalances.call(this, index);
		case 'getNFTs':
			return accountsOperations.getNFTs.call(this, index);
		case 'getTransactionHistory':
			return accountsOperations.getTransactionHistory.call(this, index);
		case 'getTokenTransfers':
			return accountsOperations.getTokenTransfers.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeTransactionsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getTransaction':
			return transactionsOperations.getTransaction.call(this, index);
		case 'getTransactionReceipt':
			return transactionsOperations.getTransactionReceipt.call(this, index);
		case 'sendTransaction':
			return transactionsOperations.sendTransaction.call(this, index);
		case 'estimateGas':
			return transactionsOperations.estimateGas.call(this, index);
		case 'getTransactionStatus':
			return transactionsOperations.getTransactionStatus.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeBlocksOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getBlock':
			return blocksOperations.getBlock.call(this, index);
		case 'getLatestBlock':
			return blocksOperations.getLatestBlock.call(this, index);
		case 'getBlockTransactions':
			return blocksOperations.getBlockTransactions.call(this, index);
		case 'getBlockByTimestamp':
			return blocksOperations.getBlockByTimestamp.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeSmartContractsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getContractABI':
			return smartContractsOperations.getContractABI.call(this, index);
		case 'readContract':
			return smartContractsOperations.readContract.call(this, index);
		case 'writeContract':
			return smartContractsOperations.writeContract.call(this, index);
		case 'getContractSource':
			return smartContractsOperations.getContractSource.call(this, index);
		case 'getContractEvents':
			return smartContractsOperations.getContractEvents.call(this, index);
		case 'deployContract':
			return smartContractsOperations.deployContract.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeTokensOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getTokenInfo':
			return tokensOperations.getTokenInfo.call(this, index);
		case 'getTokenHolders':
			return tokensOperations.getTokenHolders.call(this, index);
		case 'getTokenTransfers':
			return tokensOperations.getTokenTransfers.call(this, index);
		case 'getTokenPrice':
			return tokensOperations.getTokenPrice.call(this, index);
		case 'getTopTokens':
			return tokensOperations.getTopTokens.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeNftsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getNFTMetadata':
			return nftsOperations.getNFTMetadata.call(this, index);
		case 'getNFTTransfers':
			return nftsOperations.getNFTTransfers.call(this, index);
		case 'getCollectionInfo':
			return nftsOperations.getCollectionInfo.call(this, index);
		case 'getNFTOwners':
			return nftsOperations.getNFTOwners.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeDefiOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getProtocolTVL':
			return defiOperations.getProtocolTVL.call(this, index);
		case 'getPoolInfo':
			return defiOperations.getPoolInfo.call(this, index);
		case 'getDEXStats':
			return defiOperations.getDEXStats.call(this, index);
		case 'getYieldFarms':
			return defiOperations.getYieldFarms.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeNetworkOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getNetworkStatus':
			return networkOperations.getNetworkStatus.call(this, index);
		case 'getGasPrice':
			return networkOperations.getGasPrice.call(this, index);
		case 'getValidators':
			return networkOperations.getValidators.call(this, index);
		case 'getChainStats':
			return networkOperations.getChainStats.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeEventsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getLogs':
			return eventsOperations.getLogs.call(this, index);
		case 'subscribeToLogs':
			return eventsOperations.subscribeToLogs.call(this, index);
		case 'filterEvents':
			return eventsOperations.filterEvents.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'convertUnits':
			return utilityOperations.convertUnits.call(this, index);
		case 'encodeFunction':
			return utilityOperations.encodeFunction.call(this, index);
		case 'decodeData':
			return utilityOperations.decodeData.call(this, index);
		case 'getAPIHealth':
			return utilityOperations.getAPIHealth.call(this, index);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
