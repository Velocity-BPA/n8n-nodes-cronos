import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CronosApi implements ICredentialType {
	name = 'cronosApi';
	displayName = 'Cronos API';
	properties: INodeProperties[] = [
		{
			displayName: 'RPC URL',
			name: 'rpcUrl',
			type: 'string',
			default: 'https://evm.cronos.org',
			description: 'The RPC URL endpoint for Cronos blockchain',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'API key for third-party services (e.g., CronosScan). Leave empty for public RPC endpoints.',
			required: false,
		},
		{
			displayName: 'Use API Key in',
			name: 'apiKeyLocation',
			type: 'options',
			options: [
				{
					name: 'Header',
					value: 'header',
				},
				{
					name: 'Query Parameter',
					value: 'query',
				},
			],
			default: 'header',
			description: 'Where to include the API key',
			displayOptions: {
				show: {
					apiKey: [{ _cnd: { not: '' } }],
				},
			},
		},
	];
}