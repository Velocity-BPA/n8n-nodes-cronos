/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IHttpRequestMethods, IDataObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export interface JsonRpcRequest {
	jsonrpc: string;
	method: string;
	params: unknown[];
	id: number;
}

export interface JsonRpcResponse {
	jsonrpc: string;
	id: number;
	result?: unknown;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
}

export interface CronosCredentials {
	network: 'mainnet' | 'testnet';
	rpcEndpoint: string;
	privateKey: string;
	cronosScanApiKey: string;
}

const NETWORK_CONFIG = {
	mainnet: {
		rpcUrl: 'https://evm.cronos.org',
		scanApiUrl: 'https://api.cronoscan.com/api',
		chainId: 25,
	},
	testnet: {
		rpcUrl: 'https://evm-t3.cronos.org',
		scanApiUrl: 'https://api-testnet.cronoscan.com/api',
		chainId: 338,
	},
};

let requestId = 1;

export function getNetworkConfig(network: 'mainnet' | 'testnet') {
	return NETWORK_CONFIG[network];
}

export function getRpcUrl(credentials: CronosCredentials): string {
	if (credentials.rpcEndpoint) {
		return credentials.rpcEndpoint;
	}
	return NETWORK_CONFIG[credentials.network].rpcUrl;
}

export function getScanApiUrl(credentials: CronosCredentials): string {
	return NETWORK_CONFIG[credentials.network].scanApiUrl;
}

export function getChainId(credentials: CronosCredentials): number {
	return NETWORK_CONFIG[credentials.network].chainId;
}

export async function jsonRpcRequest(
	this: IExecuteFunctions,
	method: string,
	params: unknown[] = [],
): Promise<unknown> {
	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;
	const rpcUrl = getRpcUrl(credentials);

	const body: JsonRpcRequest = {
		jsonrpc: '2.0',
		method,
		params,
		id: requestId++,
	};

	const response = await this.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: rpcUrl,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	});

	const jsonRpcResponse = response as JsonRpcResponse;

	if (jsonRpcResponse.error) {
		throw new NodeApiError(this.getNode(), {
			message: jsonRpcResponse.error.message,
			description: `JSON-RPC Error (${jsonRpcResponse.error.code}): ${JSON.stringify(jsonRpcResponse.error.data || '')}`,
		});
	}

	return jsonRpcResponse.result;
}

export async function cronosScanRequest(
	this: IExecuteFunctions,
	module: string,
	action: string,
	params: IDataObject = {},
): Promise<unknown> {
	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;
	const apiUrl = getScanApiUrl(credentials);

	const queryParams: IDataObject = {
		module,
		action,
		...params,
	};

	if (credentials.cronosScanApiKey) {
		queryParams.apikey = credentials.cronosScanApiKey;
	}

	const response = await this.helpers.httpRequest({
		method: 'GET' as IHttpRequestMethods,
		url: apiUrl,
		qs: queryParams,
		json: true,
	});

	const scanResponse = response as { status: string; message: string; result: unknown };

	if (scanResponse.status === '0' && scanResponse.message !== 'No transactions found') {
		throw new NodeApiError(this.getNode(), {
			message: scanResponse.message,
			description: `Cronos Scan API Error: ${JSON.stringify(scanResponse.result)}`,
		});
	}

	return scanResponse.result;
}

export async function batchJsonRpcRequest(
	this: IExecuteFunctions,
	requests: Array<{ method: string; params: unknown[] }>,
): Promise<unknown[]> {
	const credentials = (await this.getCredentials('cronosApi')) as unknown as CronosCredentials;
	const rpcUrl = getRpcUrl(credentials);

	const batchBody = requests.map((req, index) => ({
		jsonrpc: '2.0',
		method: req.method,
		params: req.params,
		id: index + 1,
	}));

	const response = await this.helpers.httpRequest({
		method: 'POST' as IHttpRequestMethods,
		url: rpcUrl,
		headers: {
			'Content-Type': 'application/json',
		},
		body: batchBody,
		json: true,
	});

	const responses = response as JsonRpcResponse[];

	return responses.map((res) => {
		if (res.error) {
			throw new NodeApiError(this.getNode(), {
				message: res.error.message,
				description: `JSON-RPC Error (${res.error.code})`,
			});
		}
		return res.result;
	});
}
