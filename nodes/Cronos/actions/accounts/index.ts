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
	isValidAddress,
	encodeFunctionCall,
	decodeUint256,
} from '../../utils';
import { FUNCTION_SIGNATURES } from '../../constants';

export async function getBalance(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const blockParameter = this.getNodeParameter('blockParameter', index, 'latest') as string;

	if (!isValidAddress(address)) {
		throw new Error(`Invalid address format: ${address}`);
	}

	const balance = (await jsonRpcRequest.call(this, 'eth_getBalance', [address, blockParameter])) as string;
	const balanceDecimal = hexToDecimal(balance);
	const balanceCro = weiToCro(balanceDecimal);

	return [
		{
			json: {
				address,
				balanceWei: balanceDecimal,
				balanceCro,
				blockParameter,
			},
		},
	];
}

export async function getTokenBalances(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const tokenAddresses = this.getNodeParameter('tokenAddresses', index, '') as string;

	if (!isValidAddress(address)) {
		throw new Error(`Invalid address format: ${address}`);
	}

	const tokens = tokenAddresses
		.split(',')
		.map((t) => t.trim())
		.filter((t) => t);

	const balances: IDataObject[] = [];

	for (const tokenAddress of tokens) {
		if (!isValidAddress(tokenAddress)) {
			continue;
		}

		const callData = encodeFunctionCall(FUNCTION_SIGNATURES.balanceOf, [
			{ type: 'address', value: address },
		]);

		try {
			const result = (await jsonRpcRequest.call(this, 'eth_call', [
				{ to: tokenAddress, data: callData },
				'latest',
			])) as string;

			const balance = decodeUint256(result);

			// Try to get token info
			let decimals = 18;
			let symbol = 'UNKNOWN';
			let name = 'Unknown Token';

			try {
				const decimalsResult = (await jsonRpcRequest.call(this, 'eth_call', [
					{ to: tokenAddress, data: FUNCTION_SIGNATURES.decimals },
					'latest',
				])) as string;
				decimals = parseInt(hexToDecimal(decimalsResult), 10) || 18;

				const symbolResult = (await jsonRpcRequest.call(this, 'eth_call', [
					{ to: tokenAddress, data: FUNCTION_SIGNATURES.symbol },
					'latest',
				])) as string;
				if (symbolResult && symbolResult.length > 2) {
					// Decode string - simplified
					const hexStr = symbolResult.replace('0x', '');
					if (hexStr.length >= 128) {
						const length = parseInt(hexStr.slice(64, 128), 16);
						const symbolHex = hexStr.slice(128, 128 + length * 2);
						symbol = Buffer.from(symbolHex, 'hex').toString('utf8').replace(/\0/g, '');
					}
				}

				const nameResult = (await jsonRpcRequest.call(this, 'eth_call', [
					{ to: tokenAddress, data: FUNCTION_SIGNATURES.name },
					'latest',
				])) as string;
				if (nameResult && nameResult.length > 2) {
					const hexStr = nameResult.replace('0x', '');
					if (hexStr.length >= 128) {
						const length = parseInt(hexStr.slice(64, 128), 16);
						const nameHex = hexStr.slice(128, 128 + length * 2);
						name = Buffer.from(nameHex, 'hex').toString('utf8').replace(/\0/g, '');
					}
				}
			} catch {
				// Token info not available
			}

			const formattedBalance = weiToCro(balance, decimals);

			balances.push({
				tokenAddress,
				name,
				symbol,
				decimals,
				balanceRaw: balance,
				balance: formattedBalance,
			});
		} catch {
			balances.push({
				tokenAddress,
				error: 'Failed to fetch balance',
			});
		}
	}

	return [
		{
			json: {
				address,
				tokenBalances: balances,
				tokenCount: balances.length,
			},
		},
	];
}

export async function getNFTs(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;

	if (!isValidAddress(address)) {
		throw new Error(`Invalid address format: ${address}`);
	}

	// Use Cronos Scan API to get NFT transfers
	const result = (await cronosScanRequest.call(this, 'account', 'tokennfttx', {
		address,
		startblock: 0,
		endblock: 99999999,
		sort: 'desc',
	})) as IDataObject[];

	// Group by contract and find currently owned NFTs
	const ownedNFTs: IDataObject[] = [];
	const processedTokens = new Set<string>();

	if (Array.isArray(result)) {
		for (const transfer of result) {
			const tokenKey = `${transfer.contractAddress}-${transfer.tokenID}`;
			if (processedTokens.has(tokenKey)) continue;
			processedTokens.add(tokenKey);

			if ((transfer.to as string).toLowerCase() === address.toLowerCase()) {
				ownedNFTs.push({
					contractAddress: transfer.contractAddress,
					tokenId: transfer.tokenID,
					tokenName: transfer.tokenName,
					tokenSymbol: transfer.tokenSymbol,
					lastTransferHash: transfer.hash,
					lastTransferTimestamp: transfer.timeStamp,
				});
			}
		}
	}

	return [
		{
			json: {
				address,
				nfts: ownedNFTs,
				nftCount: ownedNFTs.length,
			},
		},
	];
}

export async function getTransactionHistory(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const startBlock = this.getNodeParameter('startBlock', index, 0) as number;
	const endBlock = this.getNodeParameter('endBlock', index, 99999999) as number;
	const page = this.getNodeParameter('page', index, 1) as number;
	const offset = this.getNodeParameter('offset', index, 100) as number;
	const sort = this.getNodeParameter('sort', index, 'desc') as string;

	if (!isValidAddress(address)) {
		throw new Error(`Invalid address format: ${address}`);
	}

	const result = await cronosScanRequest.call(this, 'account', 'txlist', {
		address,
		startblock: startBlock,
		endblock: endBlock,
		page,
		offset,
		sort,
	});

	const transactions = Array.isArray(result) ? result : [];

	const formattedTxs = transactions.map((tx: IDataObject) => ({
		hash: tx.hash,
		blockNumber: tx.blockNumber,
		timestamp: tx.timeStamp,
		from: tx.from,
		to: tx.to,
		value: weiToCro(tx.value as string),
		gasUsed: tx.gasUsed,
		gasPrice: tx.gasPrice,
		isError: tx.isError === '1',
		methodId: tx.methodId,
		functionName: tx.functionName,
	}));

	return [
		{
			json: {
				address,
				transactions: formattedTxs,
				transactionCount: formattedTxs.length,
				page,
			},
		},
	];
}

export async function getTokenTransfers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const address = this.getNodeParameter('address', index) as string;
	const contractAddress = this.getNodeParameter('contractAddress', index, '') as string;
	const startBlock = this.getNodeParameter('startBlock', index, 0) as number;
	const endBlock = this.getNodeParameter('endBlock', index, 99999999) as number;
	const page = this.getNodeParameter('page', index, 1) as number;
	const offset = this.getNodeParameter('offset', index, 100) as number;
	const sort = this.getNodeParameter('sort', index, 'desc') as string;

	if (!isValidAddress(address)) {
		throw new Error(`Invalid address format: ${address}`);
	}

	const params: IDataObject = {
		address,
		startblock: startBlock,
		endblock: endBlock,
		page,
		offset,
		sort,
	};

	if (contractAddress && isValidAddress(contractAddress)) {
		params.contractaddress = contractAddress;
	}

	const result = await cronosScanRequest.call(this, 'account', 'tokentx', params);
	const transfers = Array.isArray(result) ? result : [];

	const formattedTransfers = transfers.map((transfer: IDataObject) => ({
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
		contractAddress: transfer.contractAddress,
	}));

	return [
		{
			json: {
				address,
				transfers: formattedTransfers,
				transferCount: formattedTransfers.length,
				page,
			},
		},
	];
}

export const accountsOperations = {
	getBalance,
	getTokenBalances,
	getNFTs,
	getTransactionHistory,
	getTokenTransfers,
};
