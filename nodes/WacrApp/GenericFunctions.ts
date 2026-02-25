import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const API_BASE_URL = 'https://app.wa.cr/api/v2';
export const CREDENTIAL_NAME = 'wacrApp';

/**
 * Make an authenticated API request to WAcr App.
 */
export async function wacrApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
		method,
		url: `${API_BASE_URL}${path}`,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		json: true,
	};

	if (Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL_NAME, options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make a paginated API request that fetches ALL pages.
 */
export async function wacrApiRequestAllItems(
	this: IExecuteFunctions | IHookFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	let response: any;

	do {
		const queryParams: IDataObject = { ...qs, page, per_page: 100 };
		response = await wacrApiRequest.call(this, method, path, body, queryParams);

		const data = response?.data;
		if (Array.isArray(data)) {
			returnData.push(...data);
		} else if (data !== undefined && data !== null) {
			returnData.push(data as IDataObject);
		}

		page++;
	} while (response?.meta?.pagination?.has_more === true);

	return returnData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonObject = { [key: string]: any };
