/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest } from '../../transport';
import { hexToDecimal, weiToCro, isValidAddress, decodeAddress } from '../../utils';
import { KNOWN_TOKENS } from '../../constants';

// VVS Finance Router address on Cronos
const VVS_ROUTER = '0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae';
const VVS_FACTORY = '0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15';
const WCRO = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23';

export async function getProtocolTVL(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const protocol = this.getNodeParameter('protocol', index, 'vvs') as string;

	// VVS Finance Factory - get all pairs count
	const allPairsLengthData = '0x574f2ba3'; // allPairsLength()

	const pairsCountResult = (await jsonRpcRequest.call(this, 'eth_call', [
		{ to: VVS_FACTORY, data: allPairsLengthData },
		'latest',
	])) as string;

	const pairsCount = parseInt(hexToDecimal(pairsCountResult), 10);

	// Get WCRO balance in factory as TVL proxy
	const wcroBalanceData =
		'0x70a08231' + VVS_FACTORY.toLowerCase().replace('0x', '').padStart(64, '0');

	let tvlEstimate = '0';
	try {
		const wcroBalance = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: WCRO, data: wcroBalanceData },
			'latest',
		])) as string;

		tvlEstimate = weiToCro(hexToDecimal(wcroBalance));
	} catch {
		// TVL estimation failed
	}

	return [
		{
			json: {
				protocol,
				protocolName: protocol === 'vvs' ? 'VVS Finance' : protocol,
				factoryAddress: VVS_FACTORY,
				routerAddress: VVS_ROUTER,
				totalPairs: pairsCount,
				tvlEstimateCRO: tvlEstimate,
				note: 'Full TVL calculation requires aggregating all pool balances',
			},
		},
	];
}

export async function getPoolInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const poolAddress = this.getNodeParameter('poolAddress', index) as string;

	if (!isValidAddress(poolAddress)) {
		throw new Error(`Invalid pool address: ${poolAddress}`);
	}

	// Get token0 and token1
	const token0Data = '0x0dfe1681'; // token0()
	const token1Data = '0xd21220a7'; // token1()
	const getReservesData = '0x0902f1ac'; // getReserves()
	const totalSupplyData = '0x18160ddd'; // totalSupply()

	const [token0Result, token1Result, reservesResult, supplyResult] = await Promise.all([
		jsonRpcRequest.call(this, 'eth_call', [{ to: poolAddress, data: token0Data }, 'latest']),
		jsonRpcRequest.call(this, 'eth_call', [{ to: poolAddress, data: token1Data }, 'latest']),
		jsonRpcRequest.call(this, 'eth_call', [{ to: poolAddress, data: getReservesData }, 'latest']),
		jsonRpcRequest.call(this, 'eth_call', [{ to: poolAddress, data: totalSupplyData }, 'latest']),
	]);

	const token0 = decodeAddress(token0Result as string);
	const token1 = decodeAddress(token1Result as string);

	// Parse reserves (returns reserve0, reserve1, blockTimestampLast)
	const reservesHex = (reservesResult as string).replace('0x', '');
	const reserve0 = hexToDecimal('0x' + reservesHex.slice(0, 64));
	const reserve1 = hexToDecimal('0x' + reservesHex.slice(64, 128));
	const blockTimestampLast = parseInt(hexToDecimal('0x' + reservesHex.slice(128, 192)), 10);

	const totalSupply = hexToDecimal(supplyResult as string);

	// Get token info
	const token0Info = KNOWN_TOKENS[token0] || { name: 'Unknown', symbol: 'UNK', decimals: 18 };
	const token1Info = KNOWN_TOKENS[token1] || { name: 'Unknown', symbol: 'UNK', decimals: 18 };

	return [
		{
			json: {
				poolAddress,
				token0: {
					address: token0,
					name: token0Info.name,
					symbol: token0Info.symbol,
					reserve: weiToCro(reserve0, token0Info.decimals),
					reserveRaw: reserve0,
				},
				token1: {
					address: token1,
					name: token1Info.name,
					symbol: token1Info.symbol,
					reserve: weiToCro(reserve1, token1Info.decimals),
					reserveRaw: reserve1,
				},
				totalSupply: weiToCro(totalSupply),
				totalSupplyRaw: totalSupply,
				lastUpdate: new Date(blockTimestampLast * 1000).toISOString(),
			},
		},
	];
}

export async function getDEXStats(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const dex = this.getNodeParameter('dex', index, 'vvs') as string;

	// Get factory pair count
	const allPairsLengthData = '0x574f2ba3';
	const pairsCountResult = (await jsonRpcRequest.call(this, 'eth_call', [
		{ to: VVS_FACTORY, data: allPairsLengthData },
		'latest',
	])) as string;

	const pairsCount = parseInt(hexToDecimal(pairsCountResult), 10);

	// Get fee info (VVS uses 0.3% fee)
	const feeToData = '0x017e7e58'; // feeTo()
	let feeTo = '';
	try {
		const feeToResult = (await jsonRpcRequest.call(this, 'eth_call', [
			{ to: VVS_FACTORY, data: feeToData },
			'latest',
		])) as string;
		feeTo = decodeAddress(feeToResult);
	} catch {
		// Fee to not available
	}

	// Get a sample of pairs to estimate activity
	const samplePairs: IDataObject[] = [];
	const samplesToFetch = Math.min(5, pairsCount);

	for (let i = 0; i < samplesToFetch; i++) {
		try {
			const pairIndexHex = BigInt(i).toString(16).padStart(64, '0');
			const allPairsData = '0x1e3dd18b' + pairIndexHex; // allPairs(uint256)

			const pairAddressResult = (await jsonRpcRequest.call(this, 'eth_call', [
				{ to: VVS_FACTORY, data: allPairsData },
				'latest',
			])) as string;

			const pairAddress = decodeAddress(pairAddressResult);

			// Get pair reserves
			const getReservesData = '0x0902f1ac';
			const reservesResult = (await jsonRpcRequest.call(this, 'eth_call', [
				{ to: pairAddress, data: getReservesData },
				'latest',
			])) as string;

			const reservesHex = reservesResult.replace('0x', '');
			const reserve0 = hexToDecimal('0x' + reservesHex.slice(0, 64));
			const reserve1 = hexToDecimal('0x' + reservesHex.slice(64, 128));

			samplePairs.push({
				pairIndex: i,
				pairAddress,
				reserve0,
				reserve1,
			});
		} catch {
			// Skip failed pair fetch
		}
	}

	return [
		{
			json: {
				dex,
				dexName: dex === 'vvs' ? 'VVS Finance' : dex,
				factoryAddress: VVS_FACTORY,
				routerAddress: VVS_ROUTER,
				totalPairs: pairsCount,
				swapFee: '0.3%',
				feeTo,
				samplePairs,
			},
		},
	];
}

export async function getYieldFarms(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const protocol = this.getNodeParameter('protocol', index, 'vvs') as string;

	// VVS Finance main staking pools info
	// Note: This is a simplified response - full implementation would query the MasterChef contract

	const farms: IDataObject[] = [
		{
			name: 'VVS-CRO LP',
			protocol: 'VVS Finance',
			type: 'LP Staking',
			note: 'Requires querying MasterChef contract for live APR',
		},
		{
			name: 'VVS Single Staking',
			protocol: 'VVS Finance',
			type: 'Single Asset',
			note: 'Requires querying staking contract for live APR',
		},
		{
			name: 'USDC-CRO LP',
			protocol: 'VVS Finance',
			type: 'LP Staking',
			note: 'Requires querying MasterChef contract for live APR',
		},
	];

	return [
		{
			json: {
				protocol,
				protocolName: protocol === 'vvs' ? 'VVS Finance' : protocol,
				farmCount: farms.length,
				farms,
				note: 'Full farm data with APR requires integration with protocol APIs or subgraph',
			},
		},
	];
}

export const defiOperations = {
	getProtocolTVL,
	getPoolInfo,
	getDEXStats,
	getYieldFarms,
};
