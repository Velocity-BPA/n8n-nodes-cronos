/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * See LICENSE file for details.
 */

import {
	weiToCro,
	croToWei,
	hexToDecimal,
	decimalToHex,
	isValidAddress,
	isValidTxHash,
	truncateAddress,
	formatGasPrice,
	calculateTxFee,
	decodeUint256,
	decodeAddress,
} from '../nodes/Cronos/utils';

describe('Utility Functions', () => {
	describe('weiToCro', () => {
		it('should convert wei to CRO correctly', () => {
			expect(weiToCro('1000000000000000000')).toBe('1');
			expect(weiToCro('500000000000000000')).toBe('0.5');
			expect(weiToCro('0')).toBe('0');
		});

		it('should handle large numbers', () => {
			expect(weiToCro('1000000000000000000000')).toBe('1000');
		});

		it('should handle custom decimals', () => {
			expect(weiToCro('1000000', 6)).toBe('1');
		});
	});

	describe('croToWei', () => {
		it('should convert CRO to wei correctly', () => {
			expect(croToWei('1')).toBe('1000000000000000000');
			expect(croToWei('0.5')).toBe('500000000000000000');
		});

		it('should handle custom decimals', () => {
			expect(croToWei('1', 6)).toBe('1000000');
		});
	});

	describe('hexToDecimal', () => {
		it('should convert hex to decimal', () => {
			expect(hexToDecimal('0x10')).toBe('16');
			expect(hexToDecimal('0xff')).toBe('255');
			expect(hexToDecimal('0x0')).toBe('0');
		});

		it('should handle hex without prefix', () => {
			expect(hexToDecimal('0x10')).toBe('16');
		});

		it('should handle null/empty', () => {
			expect(hexToDecimal('')).toBe('0');
			expect(hexToDecimal('0x')).toBe('0');
		});
	});

	describe('decimalToHex', () => {
		it('should convert decimal to hex', () => {
			expect(decimalToHex('16')).toBe('0x10');
			expect(decimalToHex('255')).toBe('0xff');
			expect(decimalToHex('0')).toBe('0x0');
		});

		it('should handle number input', () => {
			expect(decimalToHex(16)).toBe('0x10');
		});
	});

	describe('isValidAddress', () => {
		it('should validate correct addresses', () => {
			expect(isValidAddress('0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23')).toBe(true);
			expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
		});

		it('should reject invalid addresses', () => {
			expect(isValidAddress('0x123')).toBe(false);
			expect(isValidAddress('invalid')).toBe(false);
			expect(isValidAddress('')).toBe(false);
			expect(isValidAddress('5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23')).toBe(false);
		});
	});

	describe('isValidTxHash', () => {
		it('should validate correct transaction hashes', () => {
			expect(
				isValidTxHash(
					'0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
				)
			).toBe(true);
		});

		it('should reject invalid transaction hashes', () => {
			expect(isValidTxHash('0x123')).toBe(false);
			expect(isValidTxHash('invalid')).toBe(false);
		});
	});

	describe('truncateAddress', () => {
		it('should shorten address for display', () => {
			const result = truncateAddress('0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23');
			expect(result).toBe('0x5C7F...AE23');
		});

		it('should handle empty input', () => {
			expect(truncateAddress('')).toBe('');
		});
	});

	describe('formatGasPrice', () => {
		it('should format gas price to Gwei', () => {
			const result = formatGasPrice('0x3b9aca00'); // 1 Gwei
			expect(result).toBe('1');
		});
	});

	describe('calculateTxFee', () => {
		it('should calculate transaction fee correctly', () => {
			// 21000 gas * 1 Gwei = 21000 Gwei = 0.000021 CRO
			const result = calculateTxFee('0x5208', '0x3b9aca00'); // 21000 gas, 1 Gwei
			expect(parseFloat(result)).toBeCloseTo(0.000021, 6);
		});
	});

	describe('decodeUint256', () => {
		it('should decode uint256 from hex', () => {
			expect(decodeUint256('0x10')).toBe('16');
			expect(decodeUint256('0x0')).toBe('0');
		});

		it('should handle empty values', () => {
			expect(decodeUint256('')).toBe('0');
			expect(decodeUint256('0x')).toBe('0');
		});
	});

	describe('decodeAddress', () => {
		it('should decode address from 32-byte hex', () => {
			const result = decodeAddress(
				'0x0000000000000000000000005c7f8a570d578ed84e63fdfa7b1ee72deae1ae23'
			);
			expect(result.toLowerCase()).toBe('0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23');
		});

		it('should handle empty values', () => {
			expect(decodeAddress('')).toBe('0x0000000000000000000000000000000000000000');
		});
	});
});

describe('Constants', () => {
	it('should have valid token addresses', async () => {
		const { KNOWN_TOKENS } = await import('../nodes/Cronos/constants');
		
		expect(KNOWN_TOKENS['0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23']).toBeDefined();
		expect(KNOWN_TOKENS['0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'].symbol).toBe('WCRO');
		expect(KNOWN_TOKENS['0xc21223249CA28397B4B6541dfFaEcC539BfF0c59'].symbol).toBe('USDC');
	});

	it('should have valid ABI definitions', async () => {
		const { ERC20_ABI, ERC721_ABI } = await import('../nodes/Cronos/constants');
		
		expect(Array.isArray(ERC20_ABI)).toBe(true);
		expect(ERC20_ABI.length).toBeGreaterThan(0);
		expect(Array.isArray(ERC721_ABI)).toBe(true);
	});

	it('should have function signatures', async () => {
		const { FUNCTION_SIGNATURES } = await import('../nodes/Cronos/constants');
		
		expect(FUNCTION_SIGNATURES.transfer).toBe('0xa9059cbb');
		expect(FUNCTION_SIGNATURES.balanceOf).toBe('0x70a08231');
	});

	it('should have event signatures', async () => {
		const { EVENT_SIGNATURES, TRANSFER_EVENT_SIGNATURE } = await import('../nodes/Cronos/constants');
		
		expect(EVENT_SIGNATURES.Transfer).toBe(TRANSFER_EVENT_SIGNATURE);
		expect(TRANSFER_EVENT_SIGNATURE).toBe('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
	});

	it('should have CRO decimals', async () => {
		const { CRO_DECIMALS } = await import('../nodes/Cronos/constants');
		
		expect(CRO_DECIMALS).toBe(18);
	});
});
