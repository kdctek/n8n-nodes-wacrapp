import type { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['group'] } },
		options: [
			{ name: 'Add Contacts', value: 'addContacts', description: 'Add contacts to a group', action: 'Add contacts to a group' },
			{ name: 'Create', value: 'create', description: 'Create a new group', action: 'Create a group' },
			{ name: 'Delete', value: 'delete', description: 'Delete a group', action: 'Delete a group' },
			{ name: 'Get', value: 'get', description: 'Get a group by ID', action: 'Get a group' },
			{ name: 'Get Many', value: 'getAll', description: 'Retrieve a list of groups', action: 'Get many groups' },
			{ name: 'Remove Contacts', value: 'removeContacts', description: 'Remove contacts from a group', action: 'Remove contacts from a group' },
			{ name: 'Update', value: 'update', description: 'Update a group name', action: 'Update a group' },
		],
		default: 'getAll',
	},
];

export const groupFields: INodeProperties[] = [
	// ─── GET MANY ────────────────────────────────────────────────────────────────
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['group'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['group'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['group'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search by group name' },
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Newest First', value: '-created_at' },
					{ name: 'Oldest First', value: 'created_at' },
					{ name: 'Name A–Z', value: 'name' },
					{ name: 'Name Z–A', value: '-name' },
				],
				default: '-created_at',
			},
		],
	},

	// ─── GET / UPDATE / DELETE ───────────────────────────────────────────────────
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the group',
		displayOptions: {
			show: { resource: ['group'], operation: ['get', 'update', 'delete', 'addContacts', 'removeContacts'] },
		},
	},

	// ─── CREATE ──────────────────────────────────────────────────────────────────
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Group name (must be unique per account)',
		displayOptions: { show: { resource: ['group'], operation: ['create'] } },
	},

	// ─── UPDATE ──────────────────────────────────────────────────────────────────
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'New group name (must be unique per account)',
		displayOptions: { show: { resource: ['group'], operation: ['update'] } },
	},

	// ─── ADD / REMOVE CONTACTS ───────────────────────────────────────────────────
	{
		displayName: 'Contact IDs',
		name: 'contact_ids',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of contact IDs',
		displayOptions: {
			show: { resource: ['group'], operation: ['addContacts', 'removeContacts'] },
		},
	},
];
