import type {
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { wacrApiRequest } from './GenericFunctions';

export class WacrAppTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WAcr App Trigger',
		name: 'wacrAppTrigger',
		icon: 'file:wacr.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts a workflow when new contacts or messages arrive in WAcr App',
		defaults: {
			name: 'WAcr App Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'wacrApp',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'New Contact',
						value: 'newContact',
						description: 'Triggers when a new contact is created',
					},
					{
						name: 'New Inbound Message',
						value: 'newInboundMessage',
						description: 'Triggers when a new inbound (received) WhatsApp message arrives',
					},
					{
						name: 'New Outbound Message',
						value: 'newOutboundMessage',
						description: 'Triggers when a new outbound (sent) WhatsApp message is recorded',
					},
					{
						name: 'New Message (Any)',
						value: 'newMessage',
						description: 'Triggers on any new message (inbound or outbound)',
					},
				],
				default: 'newContact',
			},

			// ─── New Contact Filters ──────────────────────────────────────────────
			{
				displayName: 'Filters',
				name: 'contactFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { triggerOn: ['newContact'] } },
				options: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Any', value: '' },
							{ name: 'Lead', value: 'lead' },
							{ name: 'Customer', value: 'customer' },
							{ name: 'Guest', value: 'guest' },
						],
						default: '',
						description: 'Filter new contacts by type',
					},
					{
						displayName: 'Source ID',
						name: 'source_id',
						type: 'number',
						default: 0,
						description: 'Filter new contacts by source ID (0 = any)',
					},
				],
			},

			// ─── New Message Filters ──────────────────────────────────────────────
			{
				displayName: 'Message Type Filter',
				name: 'messageTypeFilter',
				type: 'options',
				options: [
					{ name: 'Any', value: '' },
					{ name: 'Text', value: 'text' },
					{ name: 'Template', value: 'template' },
					{ name: 'Image', value: 'image' },
					{ name: 'Video', value: 'video' },
					{ name: 'Document', value: 'document' },
					{ name: 'Audio', value: 'audio' },
					{ name: 'Interactive', value: 'interactive' },
				],
				default: '',
				description: 'Only trigger on messages of this type',
				displayOptions: {
					show: { triggerOn: ['newInboundMessage', 'newOutboundMessage', 'newMessage'] },
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const triggerOn = this.getNodeParameter('triggerOn') as string;

		// Track the last check timestamp per trigger type
		const lastCheckKey = `lastCheck_${triggerOn}`;
		const now = new Date().toISOString();
		const lastCheck = (webhookData[lastCheckKey] as string) ?? new Date(Date.now() - 60_000).toISOString();

		let results: any[] = [];

		try {
			if (triggerOn === 'newContact') {
				const contactFilters = this.getNodeParameter('contactFilters') as {
					type?: string;
					source_id?: number;
				};

				const qs: Record<string, string | number> = {
					sort: '-created_at',
					per_page: 100,
					'filter[created_at][gte]': lastCheck,
				};
				if (contactFilters.type) qs['filter[type]'] = contactFilters.type;
				if (contactFilters.source_id) qs['filter[source_id]'] = contactFilters.source_id;

				const response = await wacrApiRequest.call(this, 'GET', '/contacts', {}, qs);
				results = response?.data ?? [];

			} else {
				// All message-based triggers
				const messageTypeFilter = this.getNodeParameter('messageTypeFilter') as string;

				const qs: Record<string, string | number> = {
					sort: '-created_at',
					per_page: 100,
					'filter[created_at][gte]': lastCheck,
				};

				if (triggerOn === 'newInboundMessage') {
					qs['filter[direction]'] = 'inbound';
				} else if (triggerOn === 'newOutboundMessage') {
					qs['filter[direction]'] = 'outbound';
				}

				if (messageTypeFilter) {
					qs['filter[type]'] = messageTypeFilter;
				}

				const response = await wacrApiRequest.call(this, 'GET', '/messages', {}, qs);
				results = response?.data ?? [];
			}
		} catch (error) {
			// On error, update timestamp and return null to avoid re-processing on retry
			webhookData[lastCheckKey] = now;
			throw error;
		}

		// Always update last check time
		webhookData[lastCheckKey] = now;

		if (!results.length) {
			return null;
		}

		return [this.helpers.returnJsonArray(results)];
	}
}
