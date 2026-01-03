/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest } from '../../transport';
import { hexToDecimal, decimalToHex, isValidAddress, decodeAddress, decodeUint256 } from '../../utils';
import { EVENT_SIGNATURES } from '../../constants';

export async function getLogs(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const fromBlock = this.getNodeParameter('fromBlock', index, 'latest') as string | number;
	const toBlock = this.getNodeParameter('toBlock', index, 'latest') as string | number;
	const address = this.getNodeParameter('address', index, '') as string;
	const topics = this.getNodeParameter('topics', index, '') as string;

	const filterParams: IDataObject = {
		fromBlock: fromBlock === 'latest' || fromBlock === 'earliest' || fromBlock === 'pending'
			? fromBlock
			: decimalToHex(fromBlock),
		toBlock: toBlock === 'latest' || toBlock === 'earliest' || toBlock === 'pending'
			? toBlock
			: decimalToHex(toBlock),
	};

	if (address && isValidAddress(address)) {
		filterParams.address = address;
	}

	if (topics) {
		try {
			const topicsArray = JSON.parse(topics);
			if (Array.isArray(topicsArray)) {
				filterParams.topics = topicsArray;
			}
		} catch {
			// Single topic
			filterParams.topics = [topics];
		}
	}

	const logs = (await jsonRpcRequest.call(this, 'eth_getLogs', [filterParams])) as IDataObject[];

	const formattedLogs = logs.map((log) => {
		const topicsArray = log.topics as string[];
		let eventName = 'Unknown';
		let decodedData: IDataObject = {};

		// Try to identify known events
		if (topicsArray && topicsArray.length > 0) {
			const eventSig = topicsArray[0];
			
			if (eventSig === EVENT_SIGNATURES.Transfer) {
				eventName = 'Transfer';
				if (topicsArray.length >= 3) {
					decodedData = {
						from: decodeAddress(topicsArray[1]),
						to: decodeAddress(topicsArray[2]),
						value: log.data ? decodeUint256(log.data as string) : null,
					};
				}
			} else if (eventSig === EVENT_SIGNATURES.Approval) {
				eventName = 'Approval';
				if (topicsArray.length >= 3) {
					decodedData = {
						owner: decodeAddress(topicsArray[1]),
						spender: decodeAddress(topicsArray[2]),
						value: log.data ? decodeUint256(log.data as string) : null,
					};
				}
			} else if (eventSig === EVENT_SIGNATURES.TransferSingle) {
				eventName = 'TransferSingle (ERC1155)';
			} else if (eventSig === EVENT_SIGNATURES.TransferBatch) {
				eventName = 'TransferBatch (ERC1155)';
			}
		}

		return {
			address: log.address,
			blockNumber: hexToDecimal(log.blockNumber as string),
			blockHash: log.blockHash,
			transactionHash: log.transactionHash,
			transactionIndex: hexToDecimal(log.transactionIndex as string),
			logIndex: hexToDecimal(log.logIndex as string),
			topics: log.topics,
			data: log.data,
			removed: log.removed,
			eventName,
			decodedData: Object.keys(decodedData).length > 0 ? decodedData : null,
		};
	});

	return [
		{
			json: {
				fromBlock,
				toBlock,
				address: address || 'all',
				logCount: formattedLogs.length,
				logs: formattedLogs,
			},
		},
	];
}

export async function subscribeToLogs(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index, '') as string;
	const topics = this.getNodeParameter('topics', index, '') as string;

	// WebSocket subscription info (actual subscription would be in trigger node)
	const filterParams: IDataObject = {};

	if (address && isValidAddress(address)) {
		filterParams.address = address;
	}

	if (topics) {
		try {
			const topicsArray = JSON.parse(topics);
			if (Array.isArray(topicsArray)) {
				filterParams.topics = topicsArray;
			}
		} catch {
			filterParams.topics = [topics];
		}
	}

	return [
		{
			json: {
				subscriptionType: 'logs',
				filterParams,
				websocketMethod: 'eth_subscribe',
				websocketParams: ['logs', filterParams],
				note: 'Use the Cronos Trigger node for real-time log subscriptions',
				websocketEndpoints: {
					mainnet: 'wss://evm.cronos.org',
					testnet: 'wss://evm-t3.cronos.org',
				},
			},
		},
	];
}

export async function filterEvents(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventType = this.getNodeParameter('eventType', index) as string;
	const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
	const toBlock = this.getNodeParameter('toBlock', index, 'latest') as string | number;
	const address = this.getNodeParameter('address', index, '') as string;

	let eventSignature: string;
	let eventName: string;

	switch (eventType) {
		case 'transfer':
			eventSignature = EVENT_SIGNATURES.Transfer;
			eventName = 'Transfer';
			break;
		case 'approval':
			eventSignature = EVENT_SIGNATURES.Approval;
			eventName = 'Approval';
			break;
		case 'transferSingle':
			eventSignature = EVENT_SIGNATURES.TransferSingle;
			eventName = 'TransferSingle';
			break;
		case 'transferBatch':
			eventSignature = EVENT_SIGNATURES.TransferBatch;
			eventName = 'TransferBatch';
			break;
		default:
			eventSignature = eventType;
			eventName = 'Custom';
	}

	const filterParams: IDataObject = {
		fromBlock: fromBlock === 0 ? '0x0' : decimalToHex(fromBlock),
		toBlock: toBlock === 'latest' ? 'latest' : decimalToHex(toBlock),
		topics: [eventSignature],
	};

	if (address && isValidAddress(address)) {
		filterParams.address = address;
	}

	const logs = (await jsonRpcRequest.call(this, 'eth_getLogs', [filterParams])) as IDataObject[];

	const formattedLogs = logs.map((log) => {
		const topicsArray = log.topics as string[];
		let decodedData: IDataObject = {};

		if (eventType === 'transfer' && topicsArray.length >= 3) {
			decodedData = {
				from: decodeAddress(topicsArray[1]),
				to: decodeAddress(topicsArray[2]),
				value: log.data ? decodeUint256(log.data as string) : null,
			};
		} else if (eventType === 'approval' && topicsArray.length >= 3) {
			decodedData = {
				owner: decodeAddress(topicsArray[1]),
				spender: decodeAddress(topicsArray[2]),
				value: log.data ? decodeUint256(log.data as string) : null,
			};
		}

		return {
			address: log.address,
			blockNumber: hexToDecimal(log.blockNumber as string),
			transactionHash: log.transactionHash,
			logIndex: hexToDecimal(log.logIndex as string),
			eventName,
			decodedData: Object.keys(decodedData).length > 0 ? decodedData : null,
			rawData: log.data,
			topics: log.topics,
		};
	});

	return [
		{
			json: {
				eventType: eventName,
				eventSignature,
				fromBlock,
				toBlock,
				address: address || 'all',
				eventCount: formattedLogs.length,
				events: formattedLogs,
			},
		},
	];
}

export const eventsOperations = {
	getLogs,
	subscribeToLogs,
	filterEvents,
};
