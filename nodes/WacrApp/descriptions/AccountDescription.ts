import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{
				name: 'Get Info',
				value: 'get',
				description: 'Get account information and subscription details',
				action: 'Get account info',
			},
			{
				name: 'Get Usage',
				value: 'getUsage',
				description: 'Get current feature usage statistics',
				action: 'Get usage statistics',
			},
			{
				name: 'Get Plan Limits',
				value: 'getLimits',
				description: 'Get subscription plan feature limits and access flags',
				action: 'Get plan limits',
			},
		],
		default: 'get',
	},
];

// No additional fields needed — all account operations are simple GETs with no params
export const accountFields: INodeProperties[] = [];
