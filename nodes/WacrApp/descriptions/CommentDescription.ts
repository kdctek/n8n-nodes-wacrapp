import type { INodeProperties } from 'n8n-workflow';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['comment'] } },
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Add an internal note to a contact',
				action: 'Add a comment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get all internal notes for a contact',
				action: 'Get comments for a contact',
			},
		],
		default: 'getAll',
	},
];

export const commentFields: INodeProperties[] = [
	// ─── SHARED: MOBILE ──────────────────────────────────────────────────────────
	{
		displayName: 'Mobile Number',
		name: 'mobile',
		type: 'string',
		required: true,
		default: '',
		description: "Contact's mobile number with country code (e.g. 919876543210). Must have an existing chat conversation.",
		displayOptions: { show: { resource: ['comment'], operation: ['getAll', 'add'] } },
	},

	// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		required: true,
		typeOptions: { rows: 4 },
		default: '',
		description: 'The internal note text (max 5000 chars). Supports plain text and HTML.',
		displayOptions: { show: { resource: ['comment'], operation: ['add'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['comment'], operation: ['add'] } },
		options: [
			{
				displayName: 'Status Message',
				name: 'status_message',
				type: 'string',
				default: '',
				description: 'Short label for the note (default: "Internal comment")',
			},
			{
				displayName: 'Media URL',
				name: 'media_url',
				type: 'string',
				default: '',
				description: 'Publicly accessible media file URL (image, audio, video, or document)',
			},
			{
				displayName: 'Message ID (wamid)',
				name: 'message_id',
				type: 'string',
				default: '',
				description: 'WhatsApp wamid.* of this note itself',
			},
			{
				displayName: 'Ref Message ID (wamid)',
				name: 'ref_message_id',
				type: 'string',
				default: '',
				description: 'WhatsApp wamid.* of the message this note replies to',
			},
		],
	},
];
