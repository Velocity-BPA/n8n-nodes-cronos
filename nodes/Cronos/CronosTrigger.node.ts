/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */
import type {
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

interface JsonRpcResponse {
	jsonrpc: string;
	id: number;
	result?: unknown;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
}

interface BlockData {
	hash: string;
	number: string;
	timestamp: string;
	transactions: unknown[];
	gasUsed: string;
	gasLimit: string;
	miner: string;
}

interface TransactionData {
	hash: string;
	from: string;
	to: string;
	value: string;
	blockNumber?: string;
}

interface ScanApiResponse {
	status: string;
	message: string;
	result: unknown;
}

interface LogEntry {
	address: string;
	topics: string[];
	data: string;
	blockNumber: string;
	transactionHash: string;
	logIndex: string;
}

export class CronosTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cronos Trigger',
		name: 'cronosTrigger',
		icon: 'file:cronos.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers workflow on Cronos blockchain events',
		defaults: {
			name: 'Cronos Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'cronosApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'New Block',
						value: 'newBlock',
						description: 'Trigger when a new block is mined',
					},
					{
						name: 'Transaction To Address',
						value: 'newTransactionToAddress',
						description: 'Trigger when an address receives a transaction',
					},
					{
						name: 'Token Transfer',
						value: 'tokenTransfer',
						description: 'Trigger on ERC-20 token transfers',
					},
					{
						name: 'Contract Event',
						value: 'contractEvent',
						description: 'Trigger on specific smart contract events',
					},
					{
						name: 'Large Transaction',
						value: 'largeTransaction',
						description: 'Trigger when a transaction exceeds a CRO threshold',
					},
				],
				default: 'newBlock',
			},
			// New Block options
			{
				displayName: 'Include Transaction Details',
				name: 'includeTransactions',
				type: 'boolean',
				default: false,
				description: 'Whether to include full transaction objects in the block data',
				displayOptions: {
					show: {
						event: ['newBlock'],
					},
				},
			},
			// Transaction To Address options
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'The address to monitor for incoming transactions',
				displayOptions: {
					show: {
						event: ['newTransactionToAddress'],
					},
				},
				required: true,
			},
			{
				displayName: 'Include Token Transfers',
				name: 'includeTokenTransfers',
				type: 'boolean',
				default: true,
				description: 'Whether to also trigger on ERC-20 token transfers to this address',
				displayOptions: {
					show: {
						event: ['newTransactionToAddress'],
					},
				},
			},
			// Token Transfer options
			{
				displayName: 'Token Contract Address',
				name: 'tokenAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'The ERC-20 token contract address to monitor (leave empty for all tokens)',
				displayOptions: {
					show: {
						event: ['tokenTransfer'],
					},
				},
			},
			{
				displayName: 'From Address Filter',
				name: 'fromAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Filter transfers from this address (optional)',
				displayOptions: {
					show: {
						event: ['tokenTransfer'],
					},
				},
			},
			{
				displayName: 'To Address Filter',
				name: 'toAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Filter transfers to this address (optional)',
				displayOptions: {
					show: {
						event: ['tokenTransfer'],
					},
				},
			},
			// Contract Event options
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'The smart contract address to monitor',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
				required: true,
			},
			{
				displayName: 'Event Signature',
				name: 'eventSignature',
				type: 'string',
				default: '',
				placeholder: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
				description: 'The keccak256 hash of the event signature (topic0). Leave empty for all events.',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
			},
			// Large Transaction options
			{
				displayName: 'Minimum CRO Amount',
				name: 'minAmount',
				type: 'number',
				default: 1000,
				description: 'Minimum transaction value in CRO to trigger',
				displayOptions: {
					show: {
						event: ['largeTransaction'],
					},
				},
			},
			{
				displayName: 'Watch Address (Optional)',
				name: 'watchAddress',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Only trigger for transactions involving this address',
				displayOptions: {
					show: {
						event: ['largeTransaction'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event', 0) as string;
		const credentials = await this.getCredentials('cronosApi');
		const webhookData = this.getWorkflowStaticData('node');
		const network = (credentials.network as string) || 'mainnet';

		const rpcUrl =
			network === 'testnet'
				? 'https://evm-t3.cronos.org'
				: (credentials.rpcEndpoint as string) || 'https://evm.cronos.org';

		const cronosScanUrl =
			network === 'testnet'
				? 'https://api-testnet.cronoscan.com/api'
				: 'https://api.cronoscan.com/api';

		const cronosScanApiKey = (credentials.cronosScanApiKey as string) || '';

		try {
			let items: IDataObject[] = [];

			switch (event) {
				case 'newBlock':
					items = await pollNewBlock.call(this, rpcUrl, webhookData);
					break;
				case 'newTransactionToAddress':
					items = await pollTransactionToAddress.call(
						this,
						cronosScanUrl,
						cronosScanApiKey,
						webhookData,
						this.getNodeParameter('address', 0) as string,
						this.getNodeParameter('includeTokenTransfers', 0) as boolean,
					);
					break;
				case 'tokenTransfer':
					items = await pollTokenTransfer.call(
						this,
						cronosScanUrl,
						cronosScanApiKey,
						webhookData,
						this.getNodeParameter('tokenAddress', 0) as string,
						this.getNodeParameter('fromAddress', 0) as string,
						this.getNodeParameter('toAddress', 0) as string,
					);
					break;
				case 'contractEvent':
					items = await pollContractEvent.call(
						this,
						rpcUrl,
						webhookData,
						this.getNodeParameter('contractAddress', 0) as string,
						this.getNodeParameter('eventSignature', 0) as string,
					);
					break;
				case 'largeTransaction':
					items = await pollLargeTransaction.call(
						this,
						rpcUrl,
						webhookData,
						this.getNodeParameter('minAmount', 0) as number,
						this.getNodeParameter('watchAddress', 0) as string,
					);
					break;
			}

			if (items.length === 0) {
				return null;
			}

			return [items.map((item) => ({ json: item }))];
		} catch (error) {
			throw new NodeApiError(this.getNode(), { message: (error as Error).message });
		}
	}
}

async function pollNewBlock(
	this: IPollFunctions,
	rpcUrl: string,
	webhookData: IDataObject,
): Promise<IDataObject[]> {
	const response = (await this.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: rpcUrl,
		body: {
			jsonrpc: '2.0',
			method: 'eth_blockNumber',
			params: [],
			id: 1,
		},
		json: true,
	})) as JsonRpcResponse;

	const currentBlock = parseInt(response.result as string, 16);
	const lastBlock = (webhookData.lastBlock as number) || currentBlock - 1;

	if (currentBlock <= lastBlock) {
		return [];
	}

	const items: IDataObject[] = [];

	// Fetch new blocks (limit to 10 at a time to avoid overwhelming)
	const blocksToFetch = Math.min(currentBlock - lastBlock, 10);
	for (let i = lastBlock + 1; i <= lastBlock + blocksToFetch; i++) {
		const blockResponse = (await this.helpers.httpRequest({
			method: 'POST' as IHttpRequestMethods,
			url: rpcUrl,
			body: {
				jsonrpc: '2.0',
				method: 'eth_getBlockByNumber',
				params: [`0x${i.toString(16)}`, false],
				id: 1,
			},
			json: true,
		})) as JsonRpcResponse;

		const blockData = blockResponse.result as BlockData | null;
		if (blockData) {
			items.push({
				blockNumber: i,
				blockHash: blockData.hash,
				timestamp: parseInt(blockData.timestamp, 16),
				transactionCount: blockData.transactions.length,
				gasUsed: parseInt(blockData.gasUsed, 16),
				gasLimit: parseInt(blockData.gasLimit, 16),
				miner: blockData.miner,
			});
		}
	}

	webhookData.lastBlock = lastBlock + blocksToFetch;
	return items;
}

async function pollTransactionToAddress(
	this: IPollFunctions,
	cronosScanUrl: string,
	apiKey: string,
	webhookData: IDataObject,
	address: string,
	includeTokenTransfers: boolean,
): Promise<IDataObject[]> {
	const items: IDataObject[] = [];
	const startBlock = (webhookData.lastBlock as number) || 0;

	// Get normal transactions
	const txParams: IDataObject = {
		module: 'account',
		action: 'txlist',
		address,
		startblock: startBlock,
		sort: 'asc',
	};
	if (apiKey) txParams.apikey = apiKey;

	const txResponse = (await this.helpers.httpRequest({
		method: 'GET' as IHttpRequestMethods,
		url: cronosScanUrl,
		qs: txParams,
		json: true,
	})) as ScanApiResponse;

	if (txResponse.status === '1' && Array.isArray(txResponse.result)) {
		for (const tx of txResponse.result as IDataObject[]) {
			if ((tx.to as string)?.toLowerCase() === address.toLowerCase()) {
				items.push({
					type: 'transaction',
					hash: tx.hash,
					from: tx.from,
					to: tx.to,
					value: tx.value,
					valueCRO: parseInt(tx.value as string) / 1e18,
					blockNumber: parseInt(tx.blockNumber as string),
					timestamp: parseInt(tx.timeStamp as string),
					gasUsed: parseInt(tx.gasUsed as string),
				});
			}
		}
	}

	// Get token transfers if requested
	if (includeTokenTransfers) {
		const tokenParams: IDataObject = {
			module: 'account',
			action: 'tokentx',
			address,
			startblock: startBlock,
			sort: 'asc',
		};
		if (apiKey) tokenParams.apikey = apiKey;

		const tokenResponse = (await this.helpers.httpRequest({
			method: 'GET' as IHttpRequestMethods,
			url: cronosScanUrl,
			qs: tokenParams,
			json: true,
		})) as ScanApiResponse;

		if (tokenResponse.status === '1' && Array.isArray(tokenResponse.result)) {
			for (const tx of tokenResponse.result as IDataObject[]) {
				if ((tx.to as string)?.toLowerCase() === address.toLowerCase()) {
					items.push({
						type: 'tokenTransfer',
						hash: tx.hash,
						from: tx.from,
						to: tx.to,
						value: tx.value,
						tokenName: tx.tokenName,
						tokenSymbol: tx.tokenSymbol,
						tokenDecimal: parseInt(tx.tokenDecimal as string),
						contractAddress: tx.contractAddress,
						blockNumber: parseInt(tx.blockNumber as string),
						timestamp: parseInt(tx.timeStamp as string),
					});
				}
			}
		}
	}

	// Update last block
	if (items.length > 0) {
		const maxBlock = Math.max(...items.map((i) => i.blockNumber as number));
		webhookData.lastBlock = maxBlock;
	}

	return items;
}

async function pollTokenTransfer(
	this: IPollFunctions,
	cronosScanUrl: string,
	apiKey: string,
	webhookData: IDataObject,
	tokenAddress: string,
	fromAddress: string,
	toAddress: string,
): Promise<IDataObject[]> {
	const items: IDataObject[] = [];
	const startBlock = (webhookData.lastBlock as number) || 0;

	const params: IDataObject = {
		module: 'account',
		action: 'tokentx',
		startblock: startBlock,
		sort: 'asc',
	};

	if (tokenAddress) params.contractaddress = tokenAddress;
	if (fromAddress || toAddress) params.address = fromAddress || toAddress;
	if (apiKey) params.apikey = apiKey;

	const response = (await this.helpers.httpRequest({
		method: 'GET' as IHttpRequestMethods,
		url: cronosScanUrl,
		qs: params,
		json: true,
	})) as ScanApiResponse;

	if (response.status === '1' && Array.isArray(response.result)) {
		for (const tx of response.result as IDataObject[]) {
			// Apply filters
			if (fromAddress && (tx.from as string)?.toLowerCase() !== fromAddress.toLowerCase())
				continue;
			if (toAddress && (tx.to as string)?.toLowerCase() !== toAddress.toLowerCase()) continue;

			items.push({
				hash: tx.hash,
				from: tx.from,
				to: tx.to,
				value: tx.value,
				tokenName: tx.tokenName,
				tokenSymbol: tx.tokenSymbol,
				tokenDecimal: parseInt(tx.tokenDecimal as string),
				contractAddress: tx.contractAddress,
				blockNumber: parseInt(tx.blockNumber as string),
				timestamp: parseInt(tx.timeStamp as string),
			});
		}
	}

	// Update last block
	if (items.length > 0) {
		const maxBlock = Math.max(...items.map((i) => i.blockNumber as number));
		webhookData.lastBlock = maxBlock;
	}

	return items;
}

async function pollContractEvent(
	this: IPollFunctions,
	rpcUrl: string,
	webhookData: IDataObject,
	contractAddress: string,
	eventSignature: string,
): Promise<IDataObject[]> {
	// Get current block
	const blockResponse = (await this.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: rpcUrl,
		body: {
			jsonrpc: '2.0',
			method: 'eth_blockNumber',
			params: [],
			id: 1,
		},
		json: true,
	})) as JsonRpcResponse;

	const currentBlock = parseInt(blockResponse.result as string, 16);
	const lastBlock = (webhookData.lastBlock as number) || currentBlock - 100;

	// Limit range to 1000 blocks
	const fromBlock = Math.max(lastBlock + 1, currentBlock - 1000);

	const filter: IDataObject = {
		address: contractAddress,
		fromBlock: `0x${fromBlock.toString(16)}`,
		toBlock: `0x${currentBlock.toString(16)}`,
	};

	if (eventSignature) {
		filter.topics = [eventSignature];
	}

	const logsResponse = (await this.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: rpcUrl,
		body: {
			jsonrpc: '2.0',
			method: 'eth_getLogs',
			params: [filter],
			id: 1,
		},
		json: true,
	})) as JsonRpcResponse;

	const items: IDataObject[] = [];

	if (Array.isArray(logsResponse.result)) {
		for (const log of logsResponse.result as LogEntry[]) {
			items.push({
				address: log.address,
				topics: log.topics,
				data: log.data,
				blockNumber: parseInt(log.blockNumber, 16),
				transactionHash: log.transactionHash,
				logIndex: parseInt(log.logIndex, 16),
			});
		}
	}

	webhookData.lastBlock = currentBlock;
	return items;
}

async function pollLargeTransaction(
	this: IPollFunctions,
	rpcUrl: string,
	webhookData: IDataObject,
	minAmountCRO: number,
	watchAddress: string,
): Promise<IDataObject[]> {
	const minAmountWei = BigInt(minAmountCRO) * BigInt(1e18);

	// Get current block
	const blockResponse = (await this.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: rpcUrl,
		body: {
			jsonrpc: '2.0',
			method: 'eth_blockNumber',
			params: [],
			id: 1,
		},
		json: true,
	})) as JsonRpcResponse;

	const currentBlock = parseInt(blockResponse.result as string, 16);
	const lastBlock = (webhookData.lastBlock as number) || currentBlock - 1;

	if (currentBlock <= lastBlock) {
		return [];
	}

	const items: IDataObject[] = [];

	// Check new blocks (limit to 5 at a time)
	const blocksToCheck = Math.min(currentBlock - lastBlock, 5);
	for (let i = lastBlock + 1; i <= lastBlock + blocksToCheck; i++) {
		const block = (await this.helpers.httpRequest({
			method: 'POST' as IHttpRequestMethods,
			url: rpcUrl,
			body: {
				jsonrpc: '2.0',
				method: 'eth_getBlockByNumber',
				params: [`0x${i.toString(16)}`, true],
				id: 1,
			},
			json: true,
		})) as JsonRpcResponse;

		const blockData = block.result as (BlockData & { transactions: TransactionData[] }) | null;
		if (blockData?.transactions) {
			for (const tx of blockData.transactions) {
				const value = BigInt(tx.value || '0');

				if (value >= minAmountWei) {
					// Check watch address filter
					if (watchAddress) {
						const watch = watchAddress.toLowerCase();
						if (tx.from?.toLowerCase() !== watch && tx.to?.toLowerCase() !== watch) {
							continue;
						}
					}

					items.push({
						hash: tx.hash,
						from: tx.from,
						to: tx.to,
						valueWei: tx.value,
						valueCRO: Number(value) / 1e18,
						blockNumber: i,
						timestamp: parseInt(blockData.timestamp, 16),
					});
				}
			}
		}
	}

	webhookData.lastBlock = lastBlock + blocksToCheck;
	return items;
}
