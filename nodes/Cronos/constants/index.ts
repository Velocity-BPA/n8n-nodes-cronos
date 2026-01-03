/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const ERC20_ABI = [
	{
		constant: true,
		inputs: [],
		name: 'name',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'symbol',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'decimals',
		outputs: [{ name: '', type: 'uint8' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: 'balance', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'value', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ name: '', type: 'bool' }],
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
		name: 'Transfer',
		type: 'event',
	},
];

export const ERC721_ABI = [
	{
		constant: true,
		inputs: [],
		name: 'name',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'symbol',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'tokenId', type: 'uint256' }],
		name: 'tokenURI',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: 'balance', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'tokenId', type: 'uint256' }],
		name: 'ownerOf',
		outputs: [{ name: 'owner', type: 'address' }],
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: true, name: 'tokenId', type: 'uint256' },
		],
		name: 'Transfer',
		type: 'event',
	},
];

export const ERC1155_ABI = [
	{
		constant: true,
		inputs: [
			{ name: 'account', type: 'address' },
			{ name: 'id', type: 'uint256' },
		],
		name: 'balanceOf',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'id', type: 'uint256' }],
		name: 'uri',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'operator', type: 'address' },
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'id', type: 'uint256' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
		name: 'TransferSingle',
		type: 'event',
	},
];

export const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const KNOWN_TOKENS: Record<string, { name: string; symbol: string; decimals: number }> = {
	'0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23': { name: 'Wrapped CRO', symbol: 'WCRO', decimals: 18 },
	'0xc21223249CA28397B4B6541dfFaEcC539BfF0c59': { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
	'0x66e428c3f67a68878562e79A0234c1F83c208770': { name: 'Tether USD', symbol: 'USDT', decimals: 6 },
	'0xF2001B145b43032AAF5Ee2884e456CCd805F677D': { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
	'0xe44Fd7fCb2b1581822D0c862B68222998a0c299a': { name: 'Wrapped ETH', symbol: 'WETH', decimals: 18 },
	'0x062E66477Faf219F25D27dCED647BF57C3107d52': { name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
	'0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03': { name: 'VVS Finance', symbol: 'VVS', decimals: 18 },
};

export const KNOWN_CONTRACTS: Record<string, { name: string; type: string }> = {
	'0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23': { name: 'Wrapped CRO', type: 'Token' },
	'0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae': { name: 'VVS Finance Router', type: 'DEX' },
	'0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15': { name: 'VVS Finance Factory', type: 'DEX' },
	'0xaa0045c3fd3F3F1E1A7c9c0C3c0d0c3c0D0C3c0d': { name: 'Tectonic', type: 'Lending' },
};

export const NETWORK_EXPLORERS = {
	mainnet: 'https://cronoscan.com',
	testnet: 'https://testnet.cronoscan.com',
};

export const DEFAULT_GAS_LIMIT = 21000;
export const DEFAULT_GAS_LIMIT_CONTRACT = 100000;
export const CRO_DECIMALS = 18;

export const FUNCTION_SIGNATURES: Record<string, string> = {
	transfer: '0xa9059cbb',
	approve: '0x095ea7b3',
	transferFrom: '0x23b872dd',
	balanceOf: '0x70a08231',
	allowance: '0xdd62ed3e',
	totalSupply: '0x18160ddd',
	name: '0x06fdde03',
	symbol: '0x95d89b41',
	decimals: '0x313ce567',
};

export const EVENT_SIGNATURES: Record<string, string> = {
	Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
	Approval: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
	TransferSingle: '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
	TransferBatch: '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
};
