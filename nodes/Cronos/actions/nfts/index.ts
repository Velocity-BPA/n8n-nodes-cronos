/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest, cronosScanRequest } from '../../transport';
import { hexToDecimal, isValidAddress, decodeAddress } from '../../utils';

export async function getNFTMetadata(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const tokenId = this.getNodeParameter('tokenId', index) as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	// Get token URI
	const tokenIdHex = BigInt(tokenId).toString(16).padStart(64, '0');
	const tokenURIData = '0xc87b56dd' + tokenIdHex; // tokenURI(uint256)

	let tokenURI = '';
	try {
		const result = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: tokenURIData },
			'latest',
		])) as string;

		if (result && result !== '0x' && result.length > 2) {
			// Decode the string result
			const hexStr = result.replace('0x', '');
			if (hexStr.length >= 128) {
				const offset = parseInt(hexStr.slice(0, 64), 16) * 2;
				const length = parseInt(hexStr.slice(offset, offset + 64), 16);
				const uriHex = hexStr.slice(offset + 64, offset + 64 + length * 2);
				tokenURI = Buffer.from(uriHex, 'hex').toString('utf8');
			}
		}
	} catch {
		// Try ERC1155 uri function
		try {
			const uriData = '0x0e89341c' + tokenIdHex; // uri(uint256)
			const result = (await jsonRpcRequest.call(this, 'eth_call', [
				{ to: contractAddress, data: uriData },
				'latest',
			])) as string;

			if (result && result !== '0x' && result.length > 2) {
				const hexStr = result.replace('0x', '');
				if (hexStr.length >= 128) {
					const offset = parseInt(hexStr.slice(0, 64), 16) * 2;
					const length = parseInt(hexStr.slice(offset, offset + 64), 16);
					const uriHex = hexStr.slice(offset + 64, offset + 64 + length * 2);
					tokenURI = Buffer.from(uriHex, 'hex').toString('utf8');
				}
			}
		} catch {
			// URI not available
		}
	}

	// Get owner
	const ownerData = '0x6352211e' + tokenIdHex; // ownerOf(uint256)
	let owner = '';
	try {
		const ownerResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: ownerData },
			'latest',
		])) as string;

		if (ownerResult && ownerResult !== '0x') {
			owner = decodeAddress(ownerResult);
		}
	} catch {
		// Owner not available (might be ERC1155)
	}

	// Get collection name and symbol
	let name = '';
	let symbol = '';

	try {
		const nameResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: '0x06fdde03' }, // name()
			'latest',
		])) as string;

		if (nameResult && nameResult !== '0x' && nameResult.length > 2) {
			const hexStr = nameResult.replace('0x', '');
			if (hexStr.length >= 128) {
				const length = parseInt(hexStr.slice(64, 128), 16);
				const nameHex = hexStr.slice(128, 128 + length * 2);
				name = Buffer.from(nameHex, 'hex').toString('utf8').replace(/\0/g, '');
			}
		}

		const symbolResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: '0x95d89b41' }, // symbol()
			'latest',
		])) as string;

		if (symbolResult && symbolResult !== '0x' && symbolResult.length > 2) {
			const hexStr = symbolResult.replace('0x', '');
			if (hexStr.length >= 128) {
				const length = parseInt(hexStr.slice(64, 128), 16);
				const symbolHex = hexStr.slice(128, 128 + length * 2);
				symbol = Buffer.from(symbolHex, 'hex').toString('utf8').replace(/\0/g, '');
			}
		}
	} catch {
		// Name/symbol not available
	}

	// Fetch metadata from URI if available
	let metadata: IDataObject | null = null;
	if (tokenURI) {
		try {
			// Handle IPFS URLs
			let fetchUrl = tokenURI;
			if (tokenURI.startsWith('ipfs://')) {
				fetchUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
			}
			if (tokenURI.startsWith('data:application/json;base64,')) {
				const base64Data = tokenURI.replace('data:application/json;base64,', '');
				metadata = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf8'));
			} else {
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: fetchUrl,
					json: true,
				});
				metadata = response as IDataObject;
			}
		} catch {
			// Metadata fetch failed
		}
	}

	return [
		{
			json: {
				contractAddress,
				tokenId,
				collectionName: name,
				collectionSymbol: symbol,
				owner,
				tokenURI,
				metadata,
			},
		},
	];
}

export async function getNFTTransfers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const tokenId = this.getNodeParameter('tokenId', index, '') as string;
	const startBlock = this.getNodeParameter('startBlock', index, 0) as number;
	const endBlock = this.getNodeParameter('endBlock', index, 99999999) as number;
	const page = this.getNodeParameter('page', index, 1) as number;
	const offset = this.getNodeParameter('offset', index, 100) as number;
	const sort = this.getNodeParameter('sort', index, 'desc') as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	const params: IDataObject = {
		contractaddress: contractAddress,
		startblock: startBlock,
		endblock: endBlock,
		page,
		offset,
		sort,
	};

	const result = (await cronosScanRequest.call(
		this,
		'account',
		'tokennfttx',
		params,
	)) as IDataObject[];

	let transfers = Array.isArray(result) ? result : [];

	// Filter by token ID if provided
	if (tokenId) {
		transfers = transfers.filter((t) => t.tokenID === tokenId);
	}

	const formattedTransfers = transfers.map((transfer) => ({
		hash: transfer.hash,
		blockNumber: transfer.blockNumber,
		timestamp: transfer.timeStamp,
		from: transfer.from,
		to: transfer.to,
		tokenId: transfer.tokenID,
		tokenName: transfer.tokenName,
		tokenSymbol: transfer.tokenSymbol,
	}));

	return [
		{
			json: {
				contractAddress,
				tokenId: tokenId || 'all',
				page,
				transferCount: formattedTransfers.length,
				transfers: formattedTransfers,
			},
		},
	];
}

export async function getCollectionInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	// Get collection name and symbol
	let name = '';
	let symbol = '';
	let totalSupply = '';

	try {
		const nameResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: '0x06fdde03' },
			'latest',
		])) as string;

		if (nameResult && nameResult !== '0x' && nameResult.length > 2) {
			const hexStr = nameResult.replace('0x', '');
			if (hexStr.length >= 128) {
				const length = parseInt(hexStr.slice(64, 128), 16);
				const nameHex = hexStr.slice(128, 128 + length * 2);
				name = Buffer.from(nameHex, 'hex').toString('utf8').replace(/\0/g, '');
			}
		}
	} catch {
		// Name not available
	}

	try {
		const symbolResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: '0x95d89b41' },
			'latest',
		])) as string;

		if (symbolResult && symbolResult !== '0x' && symbolResult.length > 2) {
			const hexStr = symbolResult.replace('0x', '');
			if (hexStr.length >= 128) {
				const length = parseInt(hexStr.slice(64, 128), 16);
				const symbolHex = hexStr.slice(128, 128 + length * 2);
				symbol = Buffer.from(symbolHex, 'hex').toString('utf8').replace(/\0/g, '');
			}
		}
	} catch {
		// Symbol not available
	}

	try {
		const supplyResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: '0x18160ddd' }, // totalSupply()
			'latest',
		])) as string;

		if (supplyResult && supplyResult !== '0x') {
			totalSupply = hexToDecimal(supplyResult);
		}
	} catch {
		// Total supply not available
	}

	// Check contract interfaces
	let supportsERC721 = false;
	let supportsERC1155 = false;

	try {
		// ERC721 interface ID: 0x80ac58cd
		const erc721Check = (await jsonRpcRequest.call(this, 'eth_call', [
			{
				to: contractAddress,
				data: '0x01ffc9a780ac58cd00000000000000000000000000000000000000000000000000000000',
			},
			'latest',
		])) as string;
		supportsERC721 = erc721Check === '0x0000000000000000000000000000000000000000000000000000000000000001';
	} catch {
		// Interface check failed
	}

	try {
		// ERC1155 interface ID: 0xd9b67a26
		const erc1155Check = (await jsonRpcRequest.call(this, 'eth_call', [
			{
				to: contractAddress,
				data: '0x01ffc9a7d9b67a2600000000000000000000000000000000000000000000000000000000',
			},
			'latest',
		])) as string;
		supportsERC1155 =
			erc1155Check === '0x0000000000000000000000000000000000000000000000000000000000000001';
	} catch {
		// Interface check failed
	}

	return [
		{
			json: {
				contractAddress,
				name,
				symbol,
				totalSupply,
				type: supportsERC1155 ? 'ERC1155' : supportsERC721 ? 'ERC721' : 'Unknown',
				supportsERC721,
				supportsERC1155,
			},
		},
	];
}

export async function getNFTOwners(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const tokenId = this.getNodeParameter('tokenId', index) as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	// For ERC721, get the single owner
	const tokenIdHex = BigInt(tokenId).toString(16).padStart(64, '0');
	const ownerData = '0x6352211e' + tokenIdHex;

	let owner = '';

	try {
		const ownerResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: contractAddress, data: ownerData },
			'latest',
		])) as string;

		if (ownerResult && ownerResult !== '0x') {
			owner = decodeAddress(ownerResult);
		}
	} catch {
		// ERC1155 doesn't have ownerOf, skip for now
	}

	if (owner) {
		return [
			{
				json: {
					contractAddress,
					tokenId,
					type: 'ERC721',
					owner,
					owners: [{ address: owner, balance: '1' }],
				},
			},
		];
	}

	// For ERC1155, we need to check transfer events to find holders
	// This is a simplified approach
	const result = (await cronosScanRequest.call(this, 'account', 'token1155tx', {
		contractaddress: contractAddress,
		startblock: 0,
		endblock: 99999999,
		sort: 'desc',
	})) as IDataObject[];

	const transfers = Array.isArray(result) ? result : [];
	const tokenTransfers = transfers.filter((t) => t.tokenID === tokenId);

	// Build owner map from transfers
	const ownerBalances = new Map<string, bigint>();

	for (const transfer of tokenTransfers.reverse()) {
		const from = (transfer.from as string).toLowerCase();
		const to = (transfer.to as string).toLowerCase();
		const value = BigInt(transfer.tokenValue as string || '1');

		if (from !== '0x0000000000000000000000000000000000000000') {
			const currentFrom = ownerBalances.get(from) || BigInt(0);
			ownerBalances.set(from, currentFrom - value);
		}

		const currentTo = ownerBalances.get(to) || BigInt(0);
		ownerBalances.set(to, currentTo + value);
	}

	const owners = Array.from(ownerBalances.entries())
		.filter(([, balance]) => balance > BigInt(0))
		.map(([address, balance]) => ({
			address,
			balance: balance.toString(),
		}));

	return [
		{
			json: {
				contractAddress,
				tokenId,
				type: 'ERC1155',
				ownerCount: owners.length,
				owners,
			},
		},
	];
}

export const nftsOperations = {
	getNFTMetadata,
	getNFTTransfers,
	getCollectionInfo,
	getNFTOwners,
};
