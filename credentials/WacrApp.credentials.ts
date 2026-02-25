import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WacrApp implements ICredentialType {
	name = 'wacrApp';

	displayName = 'WAcr App API v2';

	documentationUrl = 'https://docs.app.wa.cr';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your WAcr App API token. Generate it from your WAcr App account settings.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.wa.cr/api/v2',
			url: '/account',
			method: 'GET',
		},
	};
}
