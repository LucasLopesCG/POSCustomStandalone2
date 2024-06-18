import { JsonRpcError } from "./json-rpc-error";

export class JsonRpcResponse<T> {
  result?: T;
  error?: JsonRpcError;
  id: any;
}
