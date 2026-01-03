/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { CRO_DECIMALS } from '../constants';

/**
 * Convert Wei to CRO (or any 18 decimal token)
 */
export function weiToCro(wei: string | bigint, decimals: number = CRO_DECIMALS): string {
	const weiBigInt = typeof wei === 'string' ? BigInt(wei) : wei;
	const divisor = BigInt(10 ** decimals);
	const wholePart = weiBigInt / divisor;
	const fractionalPart = weiBigInt % divisor;

	if (fractionalPart === BigInt(0)) {
		return wholePart.toString();
	}

	const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
	const trimmedFractional = fractionalStr.replace(/0+$/, '');
	return `${wholePart}.${trimmedFractional}`;
}

/**
 * Convert CRO to Wei
 */
export function croToWei(cro: string | number, decimals: number = CRO_DECIMALS): string {
	const croStr = cro.toString();
	const [wholePart, fractionalPart = ''] = croStr.split('.');
	const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
	const combined = wholePart + paddedFractional;
	return BigInt(combined).toString();
}

/**
 * Convert hex string to decimal string
 */
export function hexToDecimal(hex: string): string {
	if (!hex || hex === '0x') return '0';
	return BigInt(hex).toString();
}

/**
 * Convert decimal string to hex
 */
export function decimalToHex(decimal: string | number | bigint): string {
	const bigIntValue = BigInt(decimal);
	return '0x' + bigIntValue.toString(16);
}

/**
 * Pad address to 32 bytes
 */
export function padAddress(address: string): string {
	const cleanAddress = address.toLowerCase().replace('0x', '');
	return '0x' + cleanAddress.padStart(64, '0');
}

/**
 * Pad number to 32 bytes
 */
export function padNumber(num: string | number | bigint): string {
	const hexValue = BigInt(num).toString(16);
	return '0x' + hexValue.padStart(64, '0');
}

/**
 * Encode function call data
 */
export function encodeFunctionCall(
	functionSignature: string,
	params: Array<{ type: string; value: string | number | bigint }>,
): string {
	let data = functionSignature;

	for (const param of params) {
		if (param.type === 'address') {
			data += padAddress(param.value.toString()).slice(2);
		} else if (param.type === 'uint256' || param.type === 'uint' || param.type === 'int256') {
			data += padNumber(param.value).slice(2);
		} else if (param.type === 'bool') {
			data += padNumber(param.value ? 1 : 0).slice(2);
		} else if (param.type === 'bytes32') {
			const hexValue = param.value.toString().replace('0x', '');
			data += hexValue.padEnd(64, '0');
		}
	}

	return data;
}

/**
 * Decode uint256 from hex
 */
export function decodeUint256(hex: string): string {
	if (!hex || hex === '0x') return '0';
	return BigInt(hex).toString();
}

/**
 * Decode address from 32-byte hex
 */
export function decodeAddress(hex: string): string {
	if (!hex || hex === '0x') return '0x0000000000000000000000000000000000000000';
	const cleanHex = hex.replace('0x', '');
	return '0x' + cleanHex.slice(-40).toLowerCase();
}

/**
 * Decode string from hex (basic implementation)
 */
export function decodeString(hex: string): string {
	if (!hex || hex === '0x') return '';
	const cleanHex = hex.replace('0x', '');
	let result = '';
	for (let i = 0; i < cleanHex.length; i += 2) {
		const charCode = parseInt(cleanHex.substr(i, 2), 16);
		if (charCode > 0 && charCode < 128) {
			result += String.fromCharCode(charCode);
		}
	}
	return result.replace(/\0/g, '').trim();
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
	return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Format block number
 */
export function formatBlockNumber(blockNumber: string | number): string {
	if (typeof blockNumber === 'string') {
		if (blockNumber === 'latest' || blockNumber === 'earliest' || blockNumber === 'pending') {
			return blockNumber;
		}
		if (blockNumber.startsWith('0x')) {
			return blockNumber;
		}
		return decimalToHex(blockNumber);
	}
	return decimalToHex(blockNumber);
}

/**
 * Parse transaction value
 */
export function parseTransactionValue(value: string | undefined, decimals: number = 18): string {
	if (!value || value === '0x' || value === '0x0') return '0';
	return weiToCro(hexToDecimal(value), decimals);
}

/**
 * Format gas price to Gwei
 */
export function formatGasPrice(gasPrice: string): string {
	const gasPriceWei = hexToDecimal(gasPrice);
	const gwei = weiToCro(gasPriceWei, 9);
	return gwei;
}

/**
 * Calculate transaction fee
 */
export function calculateTxFee(gasUsed: string, gasPrice: string): string {
	const gasUsedDecimal = hexToDecimal(gasUsed);
	const gasPriceDecimal = hexToDecimal(gasPrice);
	const feeWei = BigInt(gasUsedDecimal) * BigInt(gasPriceDecimal);
	return weiToCro(feeWei.toString());
}

/**
 * Keccak256 hash (simplified for function signatures)
 */
export function keccak256Signature(signature: string): string {
	// This is a placeholder - in real implementation would use proper keccak256
	// For function signatures, we typically use the first 4 bytes of keccak256 hash
	// The actual signatures are pre-computed in constants
	return signature;
}

/**
 * Parse log data to extract values
 */
export function parseLogData(data: string, types: string[]): string[] {
	if (!data || data === '0x') return [];
	const cleanData = data.replace('0x', '');
	const values: string[] = [];

	for (let i = 0; i < types.length; i++) {
		const chunk = cleanData.slice(i * 64, (i + 1) * 64);
		if (!chunk) break;

		const type = types[i];
		if (type === 'address') {
			values.push(decodeAddress('0x' + chunk));
		} else if (type.startsWith('uint') || type.startsWith('int')) {
			values.push(decodeUint256('0x' + chunk));
		} else {
			values.push('0x' + chunk);
		}
	}

	return values;
}

/**
 * Format timestamp from block
 */
export function formatBlockTimestamp(timestamp: string): string {
	const timestampNum = parseInt(hexToDecimal(timestamp), 10);
	return new Date(timestampNum * 1000).toISOString();
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
