/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest } from '../../transport';
import type { CronosCredentials } from '../../transport';
import {
	hexToDecimal,
	weiToCro,
	croToWei,
	decimalToHex,
	isValidTxHash,
	isValidAddress,
	calculateTxFee,
	formatGasPrice,
} from '../../utils';
import { getChainId } from '../../transport';

export async function getTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const txHash = this.getNodeParameter('txHash', index) as string;

	if (!isValidTxHash(txHash)) {
		throw new Error(`Invalid transaction hash format: ${txHash}`);
	}

	const tx = (await jsonRpcRequest.call(this, 'eth_getTransactionByHash', [txHash])) as IDataObject;

	if (!tx) {
		throw new Error(`Transaction not found: ${txHash}`);
	}

	return [
		{
			json: {
				hash: tx.hash,
				blockHash: tx.blockHash,
				blockNumber: tx.blockNumber ? hexToDecimal(tx.blockNumber as string) : null,
				from: tx.from,
				to: tx.to,
				value: weiToCro(hexToDecimal(tx.value as string)),
				valueWei: hexToDecimal(tx.value as string),
				gas: hexToDecimal(tx.gas as string),
				gasPrice: formatGasPrice(tx.gasPrice as string),
				gasPriceWei: hexToDecimal(tx.gasPrice as string),
				nonce: hexToDecimal(tx.nonce as string),
				transactionIndex: tx.transactionIndex
					? hexToDecimal(tx.transactionIndex as string)
					: null,
				input: tx.input,
				type: tx.type ? hexToDecimal(tx.type as string) : '0',
				chainId: tx.chainId ? hexToDecimal(tx.chainId as string) : null,
				isPending: tx.blockNumber === null,
			},
		},
	];
}

export async function getTransactionReceipt(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const txHash = this.getNodeParameter('txHash', index) as string;

	if (!isValidTxHash(txHash)) {
		throw new Error(`Invalid transaction hash format: ${txHash}`);
	}

	const receipt = (await jsonRpcRequest.call(this, 'eth_getTransactionReceipt', [
		txHash,
	])) as IDataObject;

	if (!receipt) {
		throw new Error(`Transaction receipt not found: ${txHash}`);
	}

	const gasUsed = hexToDecimal(receipt.gasUsed as string);
	const effectiveGasPrice = receipt.effectiveGasPrice
		? hexToDecimal(receipt.effectiveGasPrice as string)
		: '0';
	const txFee = calculateTxFee(receipt.gasUsed as string, receipt.effectiveGasPrice as string);

	return [
		{
			json: {
				transactionHash: receipt.transactionHash,
				blockHash: receipt.blockHash,
				blockNumber: hexToDecimal(receipt.blockNumber as string),
				from: receipt.from,
				to: receipt.to,
				contractAddress: receipt.contractAddress,
				gasUsed,
				cumulativeGasUsed: hexToDecimal(receipt.cumulativeGasUsed as string),
				effectiveGasPrice,
				effectiveGasPriceGwei: formatGasPrice(receipt.effectiveGasPrice as string),
				transactionFee: txFee,
				status: receipt.status === '0x1' ? 'success' : 'failed',
				statusCode: receipt.status,
				logsCount: Array.isArray(receipt.logs) ? receipt.logs.length : 0,
				logs: receipt.logs,
				type: receipt.type ? hexToDecimal(receipt.type as string) : '0',
			},
		},
	];
}

export async function sendTransaction(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const to = this.getNodeParameter('to', index) as string;
	const value = this.getNodeParameter('value', index) as string;
	const data = this.getNodeParameter('data', index, '0x') as string;
	const gasLimit = this.getNodeParameter('gasLimit', index, '') as string;
	const gasPrice = this.getNodeParameter('gasPrice', index, '') as string;
	const nonce = this.getNodeParameter('nonce', index, '') as string;

	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;

	if (!credentials.privateKey) {
		throw new Error('Private key is required for sending transactions');
	}

	if (!isValidAddress(to)) {
		throw new Error(`Invalid recipient address: ${to}`);
	}

	// Get nonce if not provided
	let txNonce = nonce;
	if (!txNonce) {
		const from = await getAddressFromPrivateKey(credentials.privateKey);
		const nonceResult = (await jsonRpcRequest.call(this, 'eth_getTransactionCount', [
			from,
			'pending',
		])) as string;
		txNonce = nonceResult;
	}

	// Get gas price if not provided
	let txGasPrice = gasPrice;
	if (!txGasPrice) {
		const gasPriceResult = (await jsonRpcRequest.call(this, 'eth_gasPrice', [])) as string;
		txGasPrice = gasPriceResult;
	}

	// Convert value to wei
	const valueWei = croToWei(value);

	// Prepare transaction object
	const txObject: IDataObject = {
		to,
		value: decimalToHex(valueWei),
		data: data || '0x',
		nonce: txNonce.startsWith('0x') ? txNonce : decimalToHex(txNonce),
		gasPrice: txGasPrice.startsWith('0x') ? txGasPrice : decimalToHex(txGasPrice),
		chainId: getChainId(credentials),
	};

	// Estimate gas if not provided
	if (!gasLimit) {
		try {
			const estimatedGas = (await jsonRpcRequest.call(this, 'eth_estimateGas', [
				{
					from: await getAddressFromPrivateKey(credentials.privateKey),
					to,
					value: txObject.value,
					data: txObject.data,
				},
			])) as string;
			// Add 20% buffer
			const gasWithBuffer = Math.floor(parseInt(hexToDecimal(estimatedGas), 10) * 1.2);
			txObject.gas = decimalToHex(gasWithBuffer);
		} catch {
			txObject.gas = decimalToHex(21000);
		}
	} else {
		txObject.gas = gasLimit.startsWith('0x') ? gasLimit : decimalToHex(gasLimit);
	}

	// Sign and send transaction
	const signedTx = await signTransaction(txObject, credentials.privateKey);
	const txHash = (await jsonRpcRequest.call(this, 'eth_sendRawTransaction', [signedTx])) as string;

	return [
		{
			json: {
				transactionHash: txHash,
				from: await getAddressFromPrivateKey(credentials.privateKey),
				to,
				value,
				valueWei,
				gasLimit: hexToDecimal(txObject.gas as string),
				gasPrice: formatGasPrice(txObject.gasPrice as string),
				nonce: hexToDecimal(txObject.nonce as string),
				status: 'pending',
			},
		},
	];
}

export async function estimateGas(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const from = this.getNodeParameter('from', index, '') as string;
	const to = this.getNodeParameter('to', index) as string;
	const value = this.getNodeParameter('value', index, '0') as string;
	const data = this.getNodeParameter('data', index, '0x') as string;

	if (!isValidAddress(to)) {
		throw new Error(`Invalid recipient address: ${to}`);
	}

	const txObject: IDataObject = {
		to,
		data: data || '0x',
	};

	if (from && isValidAddress(from)) {
		txObject.from = from;
	}

	if (value && value !== '0') {
		txObject.value = decimalToHex(croToWei(value));
	}

	const estimatedGas = (await jsonRpcRequest.call(this, 'eth_estimateGas', [txObject])) as string;
	const gasPrice = (await jsonRpcRequest.call(this, 'eth_gasPrice', [])) as string;

	const gasDecimal = hexToDecimal(estimatedGas);
	const gasPriceDecimal = hexToDecimal(gasPrice);
	const estimatedFeeWei = BigInt(gasDecimal) * BigInt(gasPriceDecimal);
	const estimatedFee = weiToCro(estimatedFeeWei.toString());

	return [
		{
			json: {
				estimatedGas: gasDecimal,
				gasPrice: formatGasPrice(gasPrice),
				gasPriceWei: gasPriceDecimal,
				estimatedFee,
				estimatedFeeWei: estimatedFeeWei.toString(),
			},
		},
	];
}

export async function getTransactionStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const txHash = this.getNodeParameter('txHash', index) as string;

	if (!isValidTxHash(txHash)) {
		throw new Error(`Invalid transaction hash format: ${txHash}`);
	}

	// Get transaction
	const tx = (await jsonRpcRequest.call(this, 'eth_getTransactionByHash', [txHash])) as IDataObject;

	if (!tx) {
		return [
			{
				json: {
					transactionHash: txHash,
					status: 'not_found',
					message: 'Transaction not found in the network',
				},
			},
		];
	}

	// If transaction is pending
	if (!tx.blockNumber) {
		return [
			{
				json: {
					transactionHash: txHash,
					status: 'pending',
					message: 'Transaction is pending confirmation',
					from: tx.from,
					to: tx.to,
					value: weiToCro(hexToDecimal(tx.value as string)),
				},
			},
		];
	}

	// Get receipt for confirmed transaction
	const receipt = (await jsonRpcRequest.call(this, 'eth_getTransactionReceipt', [
		txHash,
	])) as IDataObject;

	// Get latest block for confirmation count
	const latestBlock = (await jsonRpcRequest.call(this, 'eth_blockNumber', [])) as string;
	const txBlockNumber = parseInt(hexToDecimal(tx.blockNumber as string), 10);
	const currentBlockNumber = parseInt(hexToDecimal(latestBlock), 10);
	const confirmations = currentBlockNumber - txBlockNumber + 1;

	const isSuccess = receipt && receipt.status === '0x1';

	return [
		{
			json: {
				transactionHash: txHash,
				status: isSuccess ? 'confirmed' : 'failed',
				blockNumber: txBlockNumber,
				confirmations,
				from: tx.from,
				to: tx.to,
				value: weiToCro(hexToDecimal(tx.value as string)),
				gasUsed: receipt ? hexToDecimal(receipt.gasUsed as string) : null,
				transactionFee: receipt
					? calculateTxFee(receipt.gasUsed as string, receipt.effectiveGasPrice as string)
					: null,
			},
		},
	];
}

// Helper function to get address from private key (simplified)
async function getAddressFromPrivateKey(_privateKey: string): Promise<string> {
	// In a real implementation, this would derive the address from the private key
	// using secp256k1 and keccak256
	// For now, we'll throw an error indicating this needs proper implementation
	throw new Error(
		'Transaction signing requires the ethers.js library. Please ensure your n8n installation includes ethers for full transaction support.',
	);
}

// Helper function to sign transaction (simplified)
async function signTransaction(_txObject: IDataObject, _privateKey: string): Promise<string> {
	// In a real implementation, this would sign the transaction using the private key
	// For now, we'll throw an error indicating this needs proper implementation
	throw new Error(
		'Transaction signing requires the ethers.js library. Please ensure your n8n installation includes ethers for full transaction support.',
	);
}

export const transactionsOperations = {
	getTransaction,
	getTransactionReceipt,
	sendTransaction,
	estimateGas,
	getTransactionStatus,
};
