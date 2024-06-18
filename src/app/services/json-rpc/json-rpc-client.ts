import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { JsonRpcRequest } from "./json-rpc-request";
import { JsonRpcResponse } from "./json-rpc-response";

@Injectable({
  providedIn: "root",
})
export class JsonRpcClient {
  constructor(private http: HttpClient) {}

  async send<T>(
    url: string,
    method: string,
    params: any = null,
    id: any = null,
    extensionData: any = null,
  ) {
    let request = new JsonRpcRequest();
    request.method = method;
    request.params = params;
    request.id = id;
    request = { ...request, ...extensionData };

    let item = await this.http
      .post<JsonRpcResponse<T>>(url, request)
      .toPromise();
    if (item) return item.result;
    return {};
  }
}
