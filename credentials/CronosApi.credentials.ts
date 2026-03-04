import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CronosApi implements ICredentialType {
	name = 'cronosApi';
	displayName = 'Cronos API';
	documentationUrl = 'https://cronos.org/explorer/api-docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'API key for increased rate limits. Optional - free tier available without registration.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://cronos.org/explorer/api',
			required: true,
			description: 'Base URL for the Cronos API',
		},
	];
}