import type { INodeProperties } from 'n8n-workflow';

export const sourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['source'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a new source', action: 'Create a source' },
			{ name: 'Delete', value: 'delete', description: 'Delete a source', action: 'Delete a source' },
			{ name: 'Get', value: 'get', description: 'Get a source by ID', action: 'Get a source' },
			{ name: 'Get Many', value: 'getAll', description: 'Retrieve a list of sources', action: 'Get many sources' },
			{ name: 'Update', value: 'update', description: 'Update a source name', action: 'Update a source' },
		],
		default: 'getAll',
	},
];

export const sourceFields: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['source'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['source'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Search by source name',
		displayOptions: { show: { resource: ['source'], operation: ['getAll'] } },
	},
	{
		displayName: 'Source ID',
		name: 'sourceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the source',
		displayOptions: { show: { resource: ['source'], operation: ['get', 'update', 'delete'] } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Source name (must be unique per account)',
		displayOptions: { show: { resource: ['source'], operation: ['create'] } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'New source name (must be unique per account)',
		displayOptions: { show: { resource: ['source'], operation: ['update'] } },
	},
];
