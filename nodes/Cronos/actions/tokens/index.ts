/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest, cronosScanRequest } from '../../transport';
import { hexToDecimal, weiToCro, isValidAddress } from '../../utils';
import { FUNCTION_SIGNATURES, KNOWN_TOKENS } from '../../constants';

export async function getTokenInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;

	if (!isValidAddress(tokenAddress)) {
		throw new Error(`Invalid token address: ${tokenAddress}`);
	}

	// Check if it's a known token
	const knownToken = KNOWN_TOKENS[tokenAddress];

	// Get token details from contract
	const calls = [
		{ to: tokenAddress, data: FUNCTION_SIGNATURES.name },
		{ to: tokenAddress, data: FUNCTION_SIGNATURES.symbol },
		{ to: tokenAddress, data: FUNCTION_SIGNATURES.decimals },
		{ to: tokenAddress, data: FUNCTION_SIGNATURES.totalSupply },
	];

	const results = await Promise.all(
		calls.map((call) =>
			jsonRpcRequest.call(this, 'eth_call', [call, 'latest']).catch(() => '0x'),
		),
	);

	let name = knownToken?.name || 'Unknown';
	let symbol = knownToken?.symbol || 'UNKNOWN';
	let decimals = knownToken?.decimals || 18;
	let totalSupply = '0';

	// Decode name
	if (results[0] && results[0] !== '0x' && (results[0] as string).length > 2) {
		try {
			const hexStr = (results[0] as string).replace('0x', '');
			if (hexStr.length >= 128) {
				const length = parseInt(hexStr.slice(64, 128), 16);
				const nameHex = hexStr.slice(128, 128 + length * 2);
				name = Buffer.from(nameHex, 'hex').toString('utf8').replace(/\0/g, '');
			}
		} catch {
			// Keep default
		}
	}

	// Decode symbol
	if (results[1] && results[1] !== '0x' && (results[1] as string).length > 2) {
		try {
			const hexStr = (results[1] as string).replace('0x', '');
			if (hexStr.length >= 128) {
				const length = parseInt(hexStr.slice(64, 128), 16);
				const symbolHex = hexStr.slice(128, 128 + length * 2);
				symbol = Buffer.from(symbolHex, 'hex').toString('utf8').replace(/\0/g, '');
			}
		} catch {
			// Keep default
		}
	}

	// Decode decimals
	if (results[2] && results[2] !== '0x') {
		decimals = parseInt(hexToDecimal(results[2] as string), 10) || 18;
	}

	// Decode total supply
	if (results[3] && results[3] !== '0x') {
		const totalSupplyRaw = hexToDecimal(results[3] as string);
		totalSupply = weiToCro(totalSupplyRaw, decimals);
	}

	return [
		{
			json: {
				address: tokenAddress,
				name,
				symbol,
				decimals,
				totalSupply,
				isKnownToken: !!knownToken,
			},
		},
	];
}

export async function getTokenHolders(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
	const page = this.getNodeParameter('page', index, 1) as number;
	const offset = this.getNodeParameter('offset', index, 100) as number;

	if (!isValidAddress(tokenAddress)) {
		throw new Error(`Invalid token address: ${tokenAddress}`);
	}

	// Get token transfers to find holders (approximation)
	const result = (await cronosScanRequest.call(this, 'token', 'tokenholderlist', {
		contractaddress: tokenAddress,
		page,
		offset,
	})) as IDataObject[];

	const holders = Array.isArray(result)
		? result.map((holder) => ({
				address: holder.TokenHolderAddress,
				balance: holder.TokenHolderQuantity,
			}))
		: [];

	return [
		{
			json: {
				tokenAddress,
				page,
				holderCount: holders.length,
				holders,
			},
		},
	];
}

export async function getTokenTransfers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
	const startBlock = this.getNodeParameter('startBlock', index, 0) as number;
	const endBlock = this.getNodeParameter('endBlock', index, 99999999) as number;
	const page = this.getNodeParameter('page', index, 1) as number;
	const offset = this.getNodeParameter('offset', index, 100) as number;
	const sort = this.getNodeParameter('sort', index, 'desc') as string;

	if (!isValidAddress(tokenAddress)) {
		throw new Error(`Invalid token address: ${tokenAddress}`);
	}

	const result = (await cronosScanRequest.call(this, 'token', 'tokentx', {
		contractaddress: tokenAddress,
		startblock: startBlock,
		endblock: endBlock,
		page,
		offset,
		sort,
	})) as IDataObject[];

	const transfers = Array.isArray(result)
		? result.map((transfer) => ({
				hash: transfer.hash,
				blockNumber: transfer.blockNumber,
				timestamp: transfer.timeStamp,
				from: transfer.from,
				to: transfer.to,
				value: weiToCro(
					transfer.value as string,
					parseInt(transfer.tokenDecimal as string, 10) || 18,
				),
				tokenName: transfer.tokenName,
				tokenSymbol: transfer.tokenSymbol,
				tokenDecimal: transfer.tokenDecimal,
			}))
		: [];

	return [
		{
			json: {
				tokenAddress,
				page,
				transferCount: transfers.length,
				transfers,
			},
		},
	];
}

export async function getTokenPrice(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;

	if (!isValidAddress(tokenAddress)) {
		throw new Error(`Invalid token address: ${tokenAddress}`);
	}

	// Try to get price from DEX (VVS Finance) - simplified approach
	// In production, you'd integrate with a price oracle or DEX API
	const knownToken = KNOWN_TOKENS[tokenAddress];

	// Get token info first
	const tokenInfo = await getTokenInfo.call(this, index);
	const tokenData = tokenInfo[0].json;

	return [
		{
			json: {
				address: tokenAddress,
				name: tokenData.name,
				symbol: tokenData.symbol,
				decimals: tokenData.decimals,
				price: null,
				priceSource: 'not_available',
				note: 'Price data requires integration with DEX or price oracle API',
				knownToken: knownToken || null,
			},
		},
	];
}

export async function getTopTokens(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const limit = this.getNodeParameter('limit', index, 10) as number;

	// Return known tokens as top tokens
	const topTokens = Object.entries(KNOWN_TOKENS)
		.slice(0, limit)
		.map(([address, info]) => ({
			address,
			name: info.name,
			symbol: info.symbol,
			decimals: info.decimals,
		}));

	return [
		{
			json: {
				count: topTokens.length,
				tokens: topTokens,
				note: 'Top tokens by market cap requires integration with market data API',
			},
		},
	];
}

export const tokensOperations = {
	getTokenInfo,
	getTokenHolders,
	getTokenTransfers,
	getTokenPrice,
	getTopTokens,
};
