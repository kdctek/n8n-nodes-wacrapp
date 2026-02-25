import type { INodeProperties } from 'n8n-workflow';

export const otpOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['otp'] } },
		options: [
			{
				name: 'Send OTP',
				value: 'send',
				description: 'Send an OTP code via WhatsApp authentication template',
				action: 'Send OTP',
			},
			{
				name: 'Verify OTP',
				value: 'verify',
				description: 'Verify an OTP code',
				action: 'Verify OTP',
			},
			{
				name: 'Resend OTP',
				value: 'resend',
				description: 'Resend a new OTP code (invalidates previous code)',
				action: 'Resend OTP',
			},
			{
				name: 'Check Status',
				value: 'status',
				description: 'Check the status and expiry of an active OTP (non-destructive)',
				action: 'Check OTP status',
			},
			{
				name: 'List Auth Templates',
				value: 'listTemplates',
				description: 'List available AUTHENTICATION category templates',
				action: 'List auth templates',
			},
		],
		default: 'send',
	},
];

export const otpFields: INodeProperties[] = [
	// ─── SEND OTP ────────────────────────────────────────────────────────────────
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		description: 'Recipient phone number with country code (e.g. +919876543210)',
		displayOptions: { show: { resource: ['otp'], operation: ['send', 'resend'] } },
	},
	{
		displayName: 'Template Name',
		name: 'template_name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of an approved AUTHENTICATION category WhatsApp template',
		displayOptions: { show: { resource: ['otp'], operation: ['send', 'resend'] } },
	},
	{
		displayName: 'OTP Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		description: 'The OTP/verification code to send',
		displayOptions: { show: { resource: ['otp'], operation: ['send'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['otp'], operation: ['send', 'resend'] } },
		options: [
			{ displayName: 'Language', name: 'language', type: 'string', default: 'en', description: 'Template language code (default: en)' },
			{ displayName: 'Expiry (minutes)', name: 'expiry_minutes', type: 'number', default: 10, description: 'OTP expiry time in minutes (1–60)' },
			{ displayName: 'Purpose', name: 'purpose', type: 'string', default: 'authentication', description: 'OTP purpose identifier' },
			{ displayName: 'Contact ID', name: 'contact_id', type: 'number', default: 0, description: 'Existing contact ID (skips auto-creation)' },
		],
	},

	// ─── VERIFY OTP ──────────────────────────────────────────────────────────────
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		description: 'Phone number that received the OTP',
		displayOptions: { show: { resource: ['otp'], operation: ['verify'] } },
	},
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		description: 'The OTP code to verify',
		displayOptions: { show: { resource: ['otp'], operation: ['verify'] } },
	},
	{
		displayName: 'Purpose',
		name: 'purpose',
		type: 'string',
		default: 'authentication',
		description: 'OTP purpose — must match the purpose used when sending',
		displayOptions: { show: { resource: ['otp'], operation: ['verify'] } },
	},

	// ─── CHECK STATUS / VERIFY ───────────────────────────────────────────────────
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		description: 'Phone number to check',
		displayOptions: { show: { resource: ['otp'], operation: ['status'] } },
	},
	{
		displayName: 'Purpose',
		name: 'purpose',
		type: 'string',
		default: 'authentication',
		description: 'OTP purpose identifier',
		displayOptions: { show: { resource: ['otp'], operation: ['status'] } },
	},

	// ─── LIST AUTH TEMPLATES ─────────────────────────────────────────────────────
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['otp'], operation: ['listTemplates'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 100 },
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['otp'], operation: ['listTemplates'], returnAll: [false] } },
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Search by template name',
		displayOptions: { show: { resource: ['otp'], operation: ['listTemplates'] } },
	},
];
