import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { wacrApiRequest, wacrApiRequestAllItems } from './GenericFunctions';

import { contactOperations, contactFields } from './descriptions/ContactDescription';
import { messageOperations, messageFields } from './descriptions/MessageDescription';
import { groupOperations, groupFields } from './descriptions/GroupDescription';
import { templateOperations, templateFields } from './descriptions/TemplateDescription';
import { sourceOperations, sourceFields } from './descriptions/SourceDescription';
import { statusOperations, statusFields } from './descriptions/StatusDescription';
import { accountOperations, accountFields } from './descriptions/AccountDescription';
import { otpOperations, otpFields } from './descriptions/OtpDescription';
import { commentOperations, commentFields } from './descriptions/CommentDescription';

export class WacrApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WAcr App',
		name: 'wacrApp',
		icon: 'file:wacr.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the WAcr App WhatsApp CRM API',
		defaults: {
			name: 'WAcr App',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'wacrApp',
				required: true,
			},
		],
		properties: [
			// ─── RESOURCE SELECTOR ────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Group', value: 'group' },
					{ name: 'Message', value: 'message' },
					{ name: 'OTP / Authentication', value: 'otp' },
					{ name: 'Source', value: 'source' },
					{ name: 'Status', value: 'status' },
					{ name: 'Template', value: 'template' },
				],
				default: 'contact',
			},

			// ─── RESOURCE OPERATIONS & FIELDS ────────────────────────────────────
			...accountOperations,
			...accountFields,

			...commentOperations,
			...commentFields,

			...contactOperations,
			...contactFields,

			...groupOperations,
			...groupFields,

			...messageOperations,
			...messageFields,

			...otpOperations,
			...otpFields,

			...sourceOperations,
			...sourceFields,

			...statusOperations,
			...statusFields,

			...templateOperations,
			...templateFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				// ================================================================
				// ACCOUNT
				// ================================================================
				if (resource === 'account') {
					if (operation === 'get') {
						const response = await wacrApiRequest.call(this, 'GET', '/account');
						returnData.push({ json: response, pairedItem: i });

					} else if (operation === 'getUsage') {
						const response = await wacrApiRequest.call(this, 'GET', '/account/usage');
						returnData.push({ json: response, pairedItem: i });

					} else if (operation === 'getLimits') {
						const response = await wacrApiRequest.call(this, 'GET', '/account/limits');
						returnData.push({ json: response, pairedItem: i });
					}
				}

				// ================================================================
				// COMMENT
				// ================================================================
				else if (resource === 'comment') {
					const mobile = this.getNodeParameter('mobile', i) as string;

					if (operation === 'getAll') {
						const response = await wacrApiRequest.call(this, 'GET', `/comments/${mobile}`);
						const data = response?.data ?? [];
						const items2 = this.helpers.returnJsonArray(data);
						const execData = this.helpers.constructExecutionMetaData(items2, { itemData: { item: i } });
						returnData.push(...execData);

					} else if (operation === 'add') {
						const comment = this.getNodeParameter('comment', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { comment };
						Object.assign(body, additionalFields);

						const response = await wacrApiRequest.call(this, 'POST', `/comments/${mobile}`, body);
						returnData.push({ json: response, pairedItem: i });
					}
				}

				// ================================================================
				// CONTACT
				// ================================================================
				else if (resource === 'contact') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.search) qs.search = filters.search;
						if (filters.sort) qs.sort = filters.sort;
						if (filters.include && Array.isArray(filters.include) && filters.include.length > 0) {
							qs.include = (filters.include as string[]).join(',');
						}
						if (filters.type) qs['filter[type]'] = filters.type;
						if (filters.status_id) qs['filter[status_id]'] = filters.status_id;
						if (filters.source_id) qs['filter[source_id]'] = filters.source_id;
						if (filters.group_id) qs['filter[group_id]'] = filters.group_id;
						if (filters.assigned_id) qs['filter[assigned_id]'] = filters.assigned_id;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/contacts', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/contacts', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}

					} else if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const include = this.getNodeParameter('include', i) as string[];
						const qs: IDataObject = {};
						if (include.length > 0) qs.include = include.join(',');

						const response = await wacrApiRequest.call(this, 'GET', `/contacts/${contactId}`, {}, qs);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'create') {
						const body: IDataObject = {
							firstname: this.getNodeParameter('firstname', i) as string,
							lastname: this.getNodeParameter('lastname', i) as string,
							phone: this.getNodeParameter('phone', i) as string,
							type: this.getNodeParameter('type', i) as string,
							source_id: this.getNodeParameter('source_id', i) as number,
							status_id: this.getNodeParameter('status_id', i) as number,
						};
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						if (additionalFields.groups) {
							body.groups = (additionalFields.groups as string).split(',').map((g) => parseInt(g.trim(), 10));
							delete additionalFields.groups;
						}
						Object.assign(body, additionalFields);

						const response = await wacrApiRequest.call(this, 'POST', '/contacts', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						if (updateFields.groups) {
							updateFields.groups = (updateFields.groups as string).split(',').map((g) => parseInt(g.trim(), 10));
						}

						const response = await wacrApiRequest.call(this, 'PATCH', `/contacts/${contactId}`, updateFields);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const response = await wacrApiRequest.call(this, 'DELETE', `/contacts/${contactId}`);
						returnData.push({ json: response, pairedItem: i });

					} else if (operation === 'batchCreate') {
						const contactsJson = this.getNodeParameter('contacts', i) as string;
						const batchOptions = this.getNodeParameter('batchOptions', i) as IDataObject;

						let contacts: IDataObject[];
						try {
							contacts = JSON.parse(contactsJson) as IDataObject[];
						} catch {
							throw new NodeOperationError(this.getNode(), 'Contacts must be a valid JSON array', { itemIndex: i });
						}

						const body: IDataObject = { contacts };
						if (Object.keys(batchOptions).length > 0) {
							body.options = batchOptions;
						}

						const response = await wacrApiRequest.call(this, 'POST', '/contacts/batch', body);
						returnData.push({ json: response, pairedItem: i });

					} else if (operation === 'batchDelete') {
						const idsRaw = this.getNodeParameter('ids', i) as string;
						const ids = idsRaw.split(',').map((id) => parseInt(id.trim(), 10));
						const response = await wacrApiRequest.call(this, 'DELETE', '/contacts/batch', { ids });
						returnData.push({ json: response, pairedItem: i });
					}
				}

				// ================================================================
				// GROUP
				// ================================================================
				else if (resource === 'group') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};
						if (filters.search) qs.search = filters.search;
						if (filters.sort) qs.sort = filters.sort;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/groups', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/groups', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}

					} else if (operation === 'get') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const response = await wacrApiRequest.call(this, 'GET', `/groups/${groupId}`);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const response = await wacrApiRequest.call(this, 'POST', '/groups', { name });
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'update') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const response = await wacrApiRequest.call(this, 'PATCH', `/groups/${groupId}`, { name });
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'delete') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const response = await wacrApiRequest.call(this, 'DELETE', `/groups/${groupId}`);
						returnData.push({ json: response, pairedItem: i });

					} else if (operation === 'addContacts') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const idsRaw = this.getNodeParameter('contact_ids', i) as string;
						const contact_ids = idsRaw.split(',').map((id) => parseInt(id.trim(), 10));
						const response = await wacrApiRequest.call(this, 'POST', `/groups/${groupId}/contacts`, { contact_ids });
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'removeContacts') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const idsRaw = this.getNodeParameter('contact_ids', i) as string;
						const contact_ids = idsRaw.split(',').map((id) => parseInt(id.trim(), 10));
						const response = await wacrApiRequest.call(this, 'DELETE', `/groups/${groupId}/contacts`, { contact_ids });
						returnData.push({ json: response?.data ?? response, pairedItem: i });
					}
				}

				// ================================================================
				// MESSAGE
				// ================================================================
				else if (resource === 'message') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = { sort: '-created_at' };

						if (filters.search) qs.search = filters.search;
						if (filters.type) qs['filter[type]'] = filters.type;
						if (filters.status) qs['filter[status]'] = filters.status;
						if (filters.direction) qs['filter[direction]'] = filters.direction;
						if (filters.interaction_id) qs['filter[interaction_id]'] = filters.interaction_id;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/messages', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/messages', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}

					} else if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const response = await wacrApiRequest.call(this, 'GET', `/messages/${messageId}`);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'sendText') {
						const phone = this.getNodeParameter('phone', i) as string;
						const message = this.getNodeParameter('message', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { phone, message };
						if (additionalFields.contact_id) body.contact_id = additionalFields.contact_id;

						const response = await wacrApiRequest.call(this, 'POST', '/messages/text', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'sendTemplate') {
						const phone = this.getNodeParameter('phone', i) as string;
						const template_name = this.getNodeParameter('template_name', i) as string;
						const language = this.getNodeParameter('language', i) as string;
						const templateParams = this.getNodeParameter('templateParams', i) as IDataObject;

						const body: IDataObject = { phone, template_name, language, ...templateParams };
						const response = await wacrApiRequest.call(this, 'POST', '/messages/template', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'sendMedia') {
						const phone = this.getNodeParameter('phone', i) as string;
						const media_type = this.getNodeParameter('media_type', i) as string;
						const media_url = this.getNodeParameter('media_url', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { phone, media_type, media_url, ...additionalFields };
						const response = await wacrApiRequest.call(this, 'POST', '/messages/media', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'sendInteractive') {
						const phone = this.getNodeParameter('phone', i) as string;
						const type = this.getNodeParameter('interactiveType', i) as string;
						const body_text = this.getNodeParameter('body_text', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { phone, type, body_text, ...additionalFields };

						if (type === 'button') {
							const buttonsJson = this.getNodeParameter('buttons', i) as string;
							try {
								body.buttons = JSON.parse(buttonsJson);
							} catch {
								throw new NodeOperationError(this.getNode(), 'Buttons must be a valid JSON array', { itemIndex: i });
							}
						} else if (type === 'list') {
							body.list_button_text = this.getNodeParameter('list_button_text', i) as string;
							const sectionsJson = this.getNodeParameter('sections', i) as string;
							try {
								body.sections = JSON.parse(sectionsJson);
							} catch {
								throw new NodeOperationError(this.getNode(), 'Sections must be a valid JSON array', { itemIndex: i });
							}
						}

						const response = await wacrApiRequest.call(this, 'POST', '/messages/interactive', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });
					}
				}

				// ================================================================
				// OTP / AUTHENTICATION
				// ================================================================
				else if (resource === 'otp') {
					if (operation === 'send') {
						const phone = this.getNodeParameter('phone', i) as string;
						const template_name = this.getNodeParameter('template_name', i) as string;
						const code = this.getNodeParameter('code', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { phone, template_name, code, ...additionalFields };
						const response = await wacrApiRequest.call(this, 'POST', '/auth/send-otp', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'verify') {
						const phone = this.getNodeParameter('phone', i) as string;
						const code = this.getNodeParameter('code', i) as string;
						const purpose = this.getNodeParameter('purpose', i) as string;

						const body: IDataObject = { phone, code, purpose };
						const response = await wacrApiRequest.call(this, 'POST', '/auth/verify', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'resend') {
						const phone = this.getNodeParameter('phone', i) as string;
						const template_name = this.getNodeParameter('template_name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { phone, template_name, ...additionalFields };
						const response = await wacrApiRequest.call(this, 'POST', '/auth/resend', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'status') {
						const phone = this.getNodeParameter('phone', i) as string;
						const purpose = this.getNodeParameter('purpose', i) as string;

						const body: IDataObject = { phone, purpose };
						const response = await wacrApiRequest.call(this, 'POST', '/auth/status', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'listTemplates') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const search = this.getNodeParameter('search', i) as string;
						const qs: IDataObject = {};
						if (search) qs.search = search;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/auth/templates', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/auth/templates', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}
					}
				}

				// ================================================================
				// SOURCE
				// ================================================================
				else if (resource === 'source') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const search = this.getNodeParameter('search', i, '') as string;
						const qs: IDataObject = {};
						if (search) qs.search = search;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/sources', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/sources', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}

					} else if (operation === 'get') {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						const response = await wacrApiRequest.call(this, 'GET', `/sources/${sourceId}`);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const response = await wacrApiRequest.call(this, 'POST', '/sources', { name });
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'update') {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const response = await wacrApiRequest.call(this, 'PATCH', `/sources/${sourceId}`, { name });
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'delete') {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						const response = await wacrApiRequest.call(this, 'DELETE', `/sources/${sourceId}`);
						returnData.push({ json: response, pairedItem: i });
					}
				}

				// ================================================================
				// STATUS
				// ================================================================
				else if (resource === 'status') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const search = this.getNodeParameter('search', i, '') as string;
						const qs: IDataObject = {};
						if (search) qs.search = search;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/statuses', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/statuses', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}

					} else if (operation === 'get') {
						const statusId = this.getNodeParameter('statusId', i) as string;
						const response = await wacrApiRequest.call(this, 'GET', `/statuses/${statusId}`);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const color = this.getNodeParameter('color', i) as string;
						const body: IDataObject = { name };
						if (color) body.color = color;
						const response = await wacrApiRequest.call(this, 'POST', '/statuses', body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'update') {
						const statusId = this.getNodeParameter('statusId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const color = this.getNodeParameter('color', i) as string;
						const body: IDataObject = { name };
						if (color) body.color = color;
						const response = await wacrApiRequest.call(this, 'PATCH', `/statuses/${statusId}`, body);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'delete') {
						const statusId = this.getNodeParameter('statusId', i) as string;
						const response = await wacrApiRequest.call(this, 'DELETE', `/statuses/${statusId}`);
						returnData.push({ json: response, pairedItem: i });
					}
				}

				// ================================================================
				// TEMPLATE
				// ================================================================
				else if (resource === 'template') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.search) qs.search = filters.search;
						if (filters.status) qs['filter[status]'] = filters.status;
						if (filters.category) qs['filter[category]'] = filters.category;
						if (filters.language) qs['filter[language]'] = filters.language;

						if (returnAll) {
							const results = await wacrApiRequestAllItems.call(this, 'GET', '/templates', {}, qs);
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(results),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.per_page = limit;
							const response = await wacrApiRequest.call(this, 'GET', '/templates', {}, qs);
							const data = response?.data ?? [];
							const execData = this.helpers.constructExecutionMetaData(
								this.helpers.returnJsonArray(data),
								{ itemData: { item: i } },
							);
							returnData.push(...execData);
						}

					} else if (operation === 'get') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						const response = await wacrApiRequest.call(this, 'GET', `/templates/${templateId}`);
						returnData.push({ json: response?.data ?? response, pairedItem: i });

					} else if (operation === 'sync') {
						const response = await wacrApiRequest.call(this, 'POST', '/templates/sync');
						returnData.push({ json: response?.data ?? response, pairedItem: i });
					}
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(i)[0].json,
						error: error instanceof NodeOperationError ? error : new NodeOperationError(this.getNode(), error as Error, { itemIndex: i }),
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
