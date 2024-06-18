import { createSecureClient, Client } from "./../../../node_modules/xmlrpc";
import { URL } from "url";

interface OdooConfig {
  url: string;
  port?: number;
  db: string;
  username: string;
  password: string;
}

export class Odoo {
  private host: string;
  private port: number | string;
  private db: string;
  private username: string;
  private password: string;
  private secure: boolean;
  private uid: number;

  constructor(private config: OdooConfig) {
    const urlparts = new URL(config.url);
    this.host = urlparts.hostname;
    this.port = config.port || urlparts.port;
    this.db = config.db;
    this.username = config.username;
    this.password = config.password;
    this.secure = true;
    this.uid = 0;
  }

  private _getClient(path: string): Client {
    const createClientFn = createSecureClient;
    return createClientFn({
      host: this.host,
      port: this.port,
      path: path,
    });
  }

  private _methodCall(
    client: Client,
    method: string,
    params: any[] = [],
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      client.methodCall(method, params, (err: Error, value: any) => {
        if (err) {
          return reject(err);
        }
        return resolve(value);
      });
    });
  }

  async connect(): Promise<number> {
    const client = this._getClient("/xmlrpc/2/common");
    const params = [this.db, this.username, this.password, {}];

    try {
      const uid = await this._methodCall(client, "authenticate", params);
      if (!uid) throw new Error("Authentication failed");
      this.uid = uid;
      return this.uid;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async execute_kw(model: string, method: string, params: any[]): Promise<any> {
    const client = this._getClient("/xmlrpc/2/object");
    const finalParams = [
      this.db,
      this.uid,
      this.password,
      model,
      method,
      ...params,
    ];
    try {
      const value = await this._methodCall(client, "execute_kw", finalParams);
      return value;
    } catch (error) {
      throw error;
    }
  }
}
