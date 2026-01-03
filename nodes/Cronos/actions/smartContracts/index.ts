/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { jsonRpcRequest, cronosScanRequest } from '../../transport';
import type { CronosCredentials } from '../../transport';
import {
	hexToDecimal,
	isValidAddress,
	decodeUint256,
	decodeAddress,
	decimalToHex,
	croToWei,
} from '../../utils';

export async function getContractABI(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	const result = await cronosScanRequest.call(this, 'contract', 'getabi', {
		address: contractAddress,
	});

	let abi: unknown[];
	try {
		abi = typeof result === 'string' ? JSON.parse(result) : result;
	} catch {
		throw new Error(`Failed to parse ABI for contract: ${contractAddress}`);
	}

	// Extract function and event signatures
	const functions = (abi as IDataObject[])
		.filter((item) => item.type === 'function')
		.map((item) => ({
			name: item.name,
			inputs: item.inputs,
			outputs: item.outputs,
			stateMutability: item.stateMutability,
		}));

	const events = (abi as IDataObject[])
		.filter((item) => item.type === 'event')
		.map((item) => ({
			name: item.name,
			inputs: item.inputs,
		}));

	return [
		{
			json: {
				contractAddress,
				abi,
				functionCount: functions.length,
				eventCount: events.length,
				functions,
				events,
			},
		},
	];
}

export async function readContract(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const functionSignature = this.getNodeParameter('functionSignature', index) as string;
	const functionParams = this.getNodeParameter('functionParams', index, '[]') as string;
	const blockParameter = this.getNodeParameter('blockParameter', index, 'latest') as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	let params: Array<{ type: string; value: string }>;
	try {
		params = JSON.parse(functionParams);
	} catch {
		params = [];
	}

	// Build the call data
	let callData = functionSignature;
	for (const param of params) {
		if (param.type === 'address') {
			callData += param.value.toLowerCase().replace('0x', '').padStart(64, '0');
		} else if (param.type === 'uint256' || param.type.startsWith('uint')) {
			callData += BigInt(param.value).toString(16).padStart(64, '0');
		} else if (param.type === 'bool') {
			callData += (param.value === 'true' || param.value === '1' ? '1' : '0').padStart(64, '0');
		} else if (param.type === 'bytes32') {
			callData += param.value.replace('0x', '').padEnd(64, '0');
		}
	}

	const result = (await jsonRpcRequest.call(this, 'eth_call', [
		{
			to: contractAddress,
			data: callData,
		},
		blockParameter,
	])) as string;

	return [
		{
			json: {
				contractAddress,
				functionSignature,
				parameters: params,
				rawResult: result,
				decodedUint256: result && result !== '0x' ? decodeUint256(result) : null,
				decodedAddress:
					result && result !== '0x' && result.length >= 66 ? decodeAddress(result) : null,
			},
		},
	];
}

export async function writeContract(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const functionSignature = this.getNodeParameter('functionSignature', index) as string;
	const functionParams = this.getNodeParameter('functionParams', index, '[]') as string;
	const value = this.getNodeParameter('value', index, '0') as string;
	const gasLimit = this.getNodeParameter('gasLimit', index, '') as string;

	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;

	if (!credentials.privateKey) {
		throw new Error('Private key is required for contract write operations');
	}

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	let params: Array<{ type: string; value: string }>;
	try {
		params = JSON.parse(functionParams);
	} catch {
		params = [];
	}

	// Build the call data
	let callData = functionSignature;
	for (const param of params) {
		if (param.type === 'address') {
			callData += param.value.toLowerCase().replace('0x', '').padStart(64, '0');
		} else if (param.type === 'uint256' || param.type.startsWith('uint')) {
			callData += BigInt(param.value).toString(16).padStart(64, '0');
		} else if (param.type === 'bool') {
			callData += (param.value === 'true' || param.value === '1' ? '1' : '0').padStart(64, '0');
		} else if (param.type === 'bytes32') {
			callData += param.value.replace('0x', '').padEnd(64, '0');
		}
	}

	// Estimate gas if not provided
	let gas = gasLimit;
	if (!gas) {
		try {
			const estimatedGas = (await jsonRpcRequest.call(this, 'eth_estimateGas', [
				{
					to: contractAddress,
					data: callData,
					value: value !== '0' ? decimalToHex(croToWei(value)) : '0x0',
				},
			])) as string;
			gas = Math.floor(parseInt(hexToDecimal(estimatedGas), 10) * 1.2).toString();
		} catch {
			gas = '200000';
		}
	}

	// Note: Actual transaction signing would require ethers.js or similar
	// For now, return prepared transaction data
	return [
		{
			json: {
				contractAddress,
				functionSignature,
				parameters: params,
				callData,
				value,
				estimatedGas: gas,
				status: 'prepared',
				note: 'Transaction signing requires ethers.js library. Use the prepared callData with your wallet.',
			},
		},
	];
}

export async function getContractSource(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	const result = (await cronosScanRequest.call(this, 'contract', 'getsourcecode', {
		address: contractAddress,
	})) as IDataObject[];

	if (!result || !Array.isArray(result) || result.length === 0) {
		return [
			{
				json: {
					contractAddress,
					verified: false,
					message: 'Contract source code not verified',
				},
			},
		];
	}

	const contractInfo = result[0];

	return [
		{
			json: {
				contractAddress,
				verified: contractInfo.SourceCode !== '',
				contractName: contractInfo.ContractName,
				compilerVersion: contractInfo.CompilerVersion,
				optimizationUsed: contractInfo.OptimizationUsed === '1',
				runs: contractInfo.Runs,
				sourceCode: contractInfo.SourceCode,
				abi: contractInfo.ABI,
				constructorArguments: contractInfo.ConstructorArguments,
				evmVersion: contractInfo.EVMVersion,
				library: contractInfo.Library,
				licenseType: contractInfo.LicenseType,
				proxy: contractInfo.Proxy,
				implementation: contractInfo.Implementation,
			},
		},
	];
}

export async function getContractEvents(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
	const toBlock = this.getNodeParameter('toBlock', index, 'latest') as string | number;
	const topic0 = this.getNodeParameter('topic0', index, '') as string;

	if (!isValidAddress(contractAddress)) {
		throw new Error(`Invalid contract address: ${contractAddress}`);
	}

	const filterParams: IDataObject = {
		address: contractAddress,
		fromBlock: fromBlock === 0 ? '0x0' : decimalToHex(fromBlock),
		toBlock: toBlock === 'latest' ? 'latest' : decimalToHex(toBlock),
	};

	if (topic0) {
		filterParams.topics = [topic0];
	}

	const logs = (await jsonRpcRequest.call(this, 'eth_getLogs', [filterParams])) as IDataObject[];

	const formattedLogs = logs.map((log) => ({
		address: log.address,
		blockNumber: hexToDecimal(log.blockNumber as string),
		blockHash: log.blockHash,
		transactionHash: log.transactionHash,
		transactionIndex: hexToDecimal(log.transactionIndex as string),
		logIndex: hexToDecimal(log.logIndex as string),
		topics: log.topics,
		data: log.data,
		removed: log.removed,
	}));

	return [
		{
			json: {
				contractAddress,
				fromBlock,
				toBlock,
				eventCount: formattedLogs.length,
				events: formattedLogs,
			},
		},
	];
}

export async function deployContract(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const bytecode = this.getNodeParameter('bytecode', index) as string;
	const constructorParams = this.getNodeParameter('constructorParams', index, '[]') as string;
	const gasLimit = this.getNodeParameter('gasLimit', index, '') as string;
	const value = this.getNodeParameter('value', index, '0') as string;

	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;

	if (!credentials.privateKey) {
		throw new Error('Private key is required for contract deployment');
	}

	let params: Array<{ type: string; value: string }>;
	try {
		params = JSON.parse(constructorParams);
	} catch {
		params = [];
	}

	// Build deployment data (bytecode + encoded constructor params)
	let deployData = bytecode.startsWith('0x') ? bytecode : '0x' + bytecode;
	for (const param of params) {
		if (param.type === 'address') {
			deployData += param.value.toLowerCase().replace('0x', '').padStart(64, '0');
		} else if (param.type === 'uint256' || param.type.startsWith('uint')) {
			deployData += BigInt(param.value).toString(16).padStart(64, '0');
		} else if (param.type === 'bool') {
			deployData += (param.value === 'true' || param.value === '1' ? '1' : '0').padStart(64, '0');
		} else if (param.type === 'bytes32') {
			deployData += param.value.replace('0x', '').padEnd(64, '0');
		}
	}

	// Estimate gas if not provided
	let gas = gasLimit;
	if (!gas) {
		try {
			const estimatedGas = (await jsonRpcRequest.call(this, 'eth_estimateGas', [
				{
					data: deployData,
					value: value !== '0' ? decimalToHex(croToWei(value)) : '0x0',
				},
			])) as string;
			gas = Math.floor(parseInt(hexToDecimal(estimatedGas), 10) * 1.2).toString();
		} catch {
			gas = '3000000';
		}
	}

	// Note: Actual deployment would require ethers.js or similar for signing
	return [
		{
			json: {
				deployData,
				constructorParams: params,
				value,
				estimatedGas: gas,
				bytecodeLength: (deployData.length - 2) / 2,
				status: 'prepared',
				note: 'Contract deployment requires ethers.js library for signing. Use the prepared deployData with your wallet.',
			},
		},
	];
}

export const smartContractsOperations = {
	getContractABI,
	readContract,
	writeContract,
	getContractSource,
	getContractEvents,
	deployContract,
};
