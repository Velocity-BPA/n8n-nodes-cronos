/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CronosApi implements ICredentialType {
	name = 'cronosApi';
	displayName = 'Cronos API';
	documentationUrl = 'https://docs.cronos.org';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
			],
			default: 'mainnet',
			description: 'Select the Cronos network to connect to',
		},
		{
			displayName: 'RPC Endpoint',
			name: 'rpcEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://evm.cronos.org',
			description: 'Custom RPC endpoint URL. Leave empty to use default endpoint for selected network.',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing transactions (optional, required for write operations)',
		},
		{
			displayName: 'Cronos Scan API Key',
			name: 'cronosScanApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for Cronos Scan (optional, for enhanced rate limits and contract verification)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.rpcEndpoint || ($credentials.network === "testnet" ? "https://evm-t3.cronos.org" : "https://evm.cronos.org")}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_chainId',
				params: [],
				id: 1,
			}),
		},
	};
}
