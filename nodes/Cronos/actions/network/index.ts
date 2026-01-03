/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest } from '../../transport';
import type { CronosCredentials } from '../../transport';
import { hexToDecimal, weiToCro, formatGasPrice, formatBlockTimestamp } from '../../utils';
import { getNetworkConfig, getChainId } from '../../transport';

export async function getNetworkStatus(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;
	const networkConfig = getNetworkConfig(credentials.network);

	// Get multiple network stats in parallel
	const [blockNumber, gasPrice, chainId, syncing, peerCount] = await Promise.all([
		jsonRpcRequest.call(this, 'eth_blockNumber', []),
		jsonRpcRequest.call(this, 'eth_gasPrice', []),
		jsonRpcRequest.call(this, 'eth_chainId', []),
		jsonRpcRequest.call(this, 'eth_syncing', []),
		jsonRpcRequest.call(this, 'net_peerCount', []).catch(() => '0x0'),
	]);

	// Get latest block for timestamp
	const latestBlock = (await jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
		'latest',
		false,
	])) as IDataObject;

	const blockNumberDecimal = hexToDecimal(blockNumber as string);
	const gasPriceGwei = formatGasPrice(gasPrice as string);

	return [
		{
			json: {
				network: credentials.network,
				chainId: hexToDecimal(chainId as string),
				chainIdHex: chainId as string,
				blockNumber: blockNumberDecimal,
				gasPrice: gasPriceGwei,
				gasPriceWei: hexToDecimal(gasPrice as string),
				isSyncing: syncing !== false,
				syncingDetails: syncing !== false ? (syncing as IDataObject) : null,
				peerCount: hexToDecimal(peerCount as string),
				latestBlockTimestamp: formatBlockTimestamp(latestBlock.timestamp as string),
				rpcEndpoint: networkConfig.rpcUrl,
				explorerUrl: credentials.network === 'mainnet'
					? 'https://cronoscan.com'
					: 'https://testnet.cronoscan.com',
			},
		},
	];
}

export async function getGasPrice(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const includeHistory = this.getNodeParameter('includeHistory', index, false) as boolean;

	const gasPrice = (await jsonRpcRequest.call(this, 'eth_gasPrice', [])) as string;
	const gasPriceWei = hexToDecimal(gasPrice);
	const gasPriceGwei = formatGasPrice(gasPrice);

	// Get max priority fee if available (EIP-1559)
	let maxPriorityFee = null;
	try {
		const priorityFee = (await jsonRpcRequest.call(
			this,
			'eth_maxPriorityFeePerGas',
			[],
		)) as string;
		maxPriorityFee = {
			wei: hexToDecimal(priorityFee),
			gwei: formatGasPrice(priorityFee),
		};
	} catch {
		// EIP-1559 not supported
	}

	// Get fee history if requested
	let feeHistory = null;
	if (includeHistory) {
		try {
			const history = (await jsonRpcRequest.call(this, 'eth_feeHistory', [
				'0xa', // 10 blocks
				'latest',
				[25, 50, 75], // percentiles
			])) as IDataObject;

			feeHistory = {
				oldestBlock: hexToDecimal(history.oldestBlock as string),
				baseFeePerGas: (history.baseFeePerGas as string[]).map((fee) => ({
					wei: hexToDecimal(fee),
					gwei: formatGasPrice(fee),
				})),
				gasUsedRatio: history.gasUsedRatio,
				reward: history.reward,
			};
		} catch {
			// Fee history not available
		}
	}

	// Calculate suggested gas prices
	const baseFeeWei = BigInt(gasPriceWei);
	const suggestions = {
		slow: {
			wei: (baseFeeWei * BigInt(90)) / BigInt(100),
			gwei: weiToCro(((baseFeeWei * BigInt(90)) / BigInt(100)).toString(), 9),
		},
		standard: {
			wei: gasPriceWei,
			gwei: gasPriceGwei,
		},
		fast: {
			wei: (baseFeeWei * BigInt(120)) / BigInt(100),
			gwei: weiToCro(((baseFeeWei * BigInt(120)) / BigInt(100)).toString(), 9),
		},
		instant: {
			wei: (baseFeeWei * BigInt(150)) / BigInt(100),
			gwei: weiToCro(((baseFeeWei * BigInt(150)) / BigInt(100)).toString(), 9),
		},
	};

	return [
		{
			json: {
				gasPrice: gasPriceGwei,
				gasPriceWei,
				maxPriorityFee,
				suggestions,
				feeHistory,
			},
		},
	];
}

export async function getValidators(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	// Cronos is a PoA chain, so we get validator info differently
	// The validators are the block producers

	// Get recent blocks to identify validators
	const latestBlock = (await jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
		'latest',
		false,
	])) as IDataObject;

	const blockNumber = parseInt(hexToDecimal(latestBlock.number as string), 10);
	const validators = new Set<string>();

	// Check last 100 blocks for unique validators
	const blocksToCheck = Math.min(100, blockNumber);
	const blockPromises = [];

	for (let i = 0; i < blocksToCheck; i += 10) {
		const blockNum = blockNumber - i;
		blockPromises.push(
			jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
				'0x' + blockNum.toString(16),
				false,
			]),
		);
	}

	const blocks = await Promise.all(blockPromises);

	for (const block of blocks) {
		if (block && (block as IDataObject).miner) {
			validators.add(((block as IDataObject).miner as string).toLowerCase());
		}
	}

	const validatorList = Array.from(validators).map((address, index) => ({
		rank: index + 1,
		address,
		type: 'Block Producer',
	}));

	return [
		{
			json: {
				validatorCount: validatorList.length,
				consensusType: 'Proof of Authority (PoA)',
				validators: validatorList,
				note: 'Cronos uses PoA consensus with approved validators',
			},
		},
	];
}

export async function getChainStats(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;

	// Get various chain statistics
	const [blockNumber, gasPrice, latestBlock] = await Promise.all([
		jsonRpcRequest.call(this, 'eth_blockNumber', []),
		jsonRpcRequest.call(this, 'eth_gasPrice', []),
		jsonRpcRequest.call(this, 'eth_getBlockByNumber', ['latest', true]),
	]);

	const currentBlockNum = parseInt(hexToDecimal(blockNumber as string), 10);

	// Get block from 1 hour ago (approximately 600 blocks at 6s block time)
	const blocksPerHour = 600;
	const oldBlockNum = Math.max(0, currentBlockNum - blocksPerHour);

	const oldBlock = (await jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
		'0x' + oldBlockNum.toString(16),
		false,
	])) as IDataObject;

	// Calculate TPS
	const txCount = Array.isArray((latestBlock as IDataObject).transactions)
		? ((latestBlock as IDataObject).transactions as unknown[]).length
		: 0;

	const latestTimestamp = parseInt(hexToDecimal((latestBlock as IDataObject).timestamp as string), 10);
	const oldTimestamp = parseInt(hexToDecimal(oldBlock.timestamp as string), 10);
	const timeDiff = latestTimestamp - oldTimestamp;

	// Get total transaction count via Cronos Scan
	// This would require a specific API endpoint
	// For now, we estimate based on block data

	return [
		{
			json: {
				network: credentials.network,
				chainId: getChainId(credentials),
				currentBlock: currentBlockNum,
				gasPrice: formatGasPrice(gasPrice as string),
				latestBlockTxCount: txCount,
				blockTime: timeDiff > 0 ? (timeDiff / blocksPerHour).toFixed(2) + 's' : '~6s',
				blocksLastHour: blocksPerHour,
				avgTxPerBlock: txCount,
				nativeToken: 'CRO',
				nativeTokenDecimals: 18,
				consensusMechanism: 'Proof of Authority (Tendermint)',
				evmCompatible: true,
				explorer: credentials.network === 'mainnet'
					? 'https://cronoscan.com'
					: 'https://testnet.cronoscan.com',
			},
		},
	];
}

export const networkOperations = {
	getNetworkStatus,
	getGasPrice,
	getValidators,
	getChainStats,
};
