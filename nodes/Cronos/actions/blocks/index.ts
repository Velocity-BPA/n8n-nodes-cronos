/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest, cronosScanRequest } from '../../transport';
import {
	hexToDecimal,
	weiToCro,
	decimalToHex,
	formatBlockTimestamp,
} from '../../utils';

export async function getBlock(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockIdentifier = this.getNodeParameter('blockIdentifier', index) as string;
	const includeTransactions = this.getNodeParameter('includeTransactions', index, false) as boolean;

	let blockParam: string;
	if (blockIdentifier === 'latest' || blockIdentifier === 'earliest' || blockIdentifier === 'pending') {
		blockParam = blockIdentifier;
	} else if (blockIdentifier.startsWith('0x')) {
		// Block hash
		const block = (await jsonRpcRequest.call(this, 'eth_getBlockByHash', [
			blockIdentifier,
			includeTransactions,
		])) as IDataObject;

		if (!block) {
			throw new Error(`Block not found: ${blockIdentifier}`);
		}

		return [{ json: formatBlockResponse(block) }];
	} else {
		// Block number
		blockParam = decimalToHex(blockIdentifier);
	}

	const block = (await jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
		blockParam,
		includeTransactions,
	])) as IDataObject;

	if (!block) {
		throw new Error(`Block not found: ${blockIdentifier}`);
	}

	return [{ json: formatBlockResponse(block) }];
}

export async function getLatestBlock(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const includeTransactions = this.getNodeParameter('includeTransactions', index, false) as boolean;

	const block = (await jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
		'latest',
		includeTransactions,
	])) as IDataObject;

	return [{ json: formatBlockResponse(block) }];
}

export async function getBlockTransactions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const blockIdentifier = this.getNodeParameter('blockIdentifier', index) as string;

	let blockParam: string;
	let method: string;

	if (blockIdentifier.startsWith('0x') && blockIdentifier.length === 66) {
		// Block hash
		method = 'eth_getBlockByHash';
		blockParam = blockIdentifier;
	} else if (
		blockIdentifier === 'latest' ||
		blockIdentifier === 'earliest' ||
		blockIdentifier === 'pending'
	) {
		method = 'eth_getBlockByNumber';
		blockParam = blockIdentifier;
	} else {
		method = 'eth_getBlockByNumber';
		blockParam = decimalToHex(blockIdentifier);
	}

	const block = (await jsonRpcRequest.call(this, method, [blockParam, true])) as IDataObject;

	if (!block) {
		throw new Error(`Block not found: ${blockIdentifier}`);
	}

	const transactions = (block.transactions as IDataObject[]) || [];
	const formattedTransactions = transactions.map((tx) => ({
		hash: tx.hash,
		from: tx.from,
		to: tx.to,
		value: weiToCro(hexToDecimal(tx.value as string)),
		valueWei: hexToDecimal(tx.value as string),
		gas: hexToDecimal(tx.gas as string),
		gasPrice: hexToDecimal(tx.gasPrice as string),
		nonce: hexToDecimal(tx.nonce as string),
		transactionIndex: hexToDecimal(tx.transactionIndex as string),
		input: tx.input,
	}));

	return [
		{
			json: {
				blockNumber: hexToDecimal(block.number as string),
				blockHash: block.hash,
				timestamp: formatBlockTimestamp(block.timestamp as string),
				transactionCount: formattedTransactions.length,
				transactions: formattedTransactions,
			},
		},
	];
}

export async function getBlockByTimestamp(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const timestamp = this.getNodeParameter('timestamp', index) as number;
	const closest = this.getNodeParameter('closest', index, 'before') as string;

	// Use Cronos Scan API to find block by timestamp
	const result = (await cronosScanRequest.call(this, 'block', 'getblocknobytime', {
		timestamp,
		closest,
	})) as string;

	const blockNumber = result;

	// Now get the full block details
	const block = (await jsonRpcRequest.call(this, 'eth_getBlockByNumber', [
		decimalToHex(blockNumber),
		false,
	])) as IDataObject;

	if (!block) {
		throw new Error(`Block not found for timestamp: ${timestamp}`);
	}

	return [
		{
			json: {
				searchedTimestamp: timestamp,
				searchedClosest: closest,
				...formatBlockResponse(block),
			},
		},
	];
}

function formatBlockResponse(block: IDataObject): IDataObject {
	const transactions = block.transactions as (string | IDataObject)[];
	const transactionCount = transactions ? transactions.length : 0;

	// Check if transactions are full objects or just hashes
	const transactionHashes =
		transactionCount > 0
			? typeof transactions[0] === 'string'
				? transactions
				: (transactions as IDataObject[]).map((tx) => tx.hash)
			: [];

	return {
		number: hexToDecimal(block.number as string),
		hash: block.hash,
		parentHash: block.parentHash,
		nonce: block.nonce,
		sha3Uncles: block.sha3Uncles,
		logsBloom: block.logsBloom,
		transactionsRoot: block.transactionsRoot,
		stateRoot: block.stateRoot,
		receiptsRoot: block.receiptsRoot,
		miner: block.miner,
		difficulty: block.difficulty ? hexToDecimal(block.difficulty as string) : '0',
		totalDifficulty: block.totalDifficulty
			? hexToDecimal(block.totalDifficulty as string)
			: '0',
		extraData: block.extraData,
		size: hexToDecimal(block.size as string),
		gasLimit: hexToDecimal(block.gasLimit as string),
		gasUsed: hexToDecimal(block.gasUsed as string),
		timestamp: formatBlockTimestamp(block.timestamp as string),
		timestampUnix: hexToDecimal(block.timestamp as string),
		transactionCount,
		transactions: typeof transactions[0] === 'object' ? transactions : transactionHashes,
		uncles: block.uncles,
		baseFeePerGas: block.baseFeePerGas ? hexToDecimal(block.baseFeePerGas as string) : null,
	};
}

export const blocksOperations = {
	getBlock,
	getLatestBlock,
	getBlockTransactions,
	getBlockByTimestamp,
};
