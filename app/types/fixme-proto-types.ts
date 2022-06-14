// TODO: Replace these w/ actual proto file

/**
 * @generated from protobuf message okapi.v1.provider.ConfigItem
 */
export interface ConfigItem {
  /**
   * @generated from protobuf field: string name = 1;
   */
  name: string;
  /**
   * @generated from protobuf oneof: value
   */
  value:
    | {
        oneofKind: 'stringValue';
        /**
         * @generated from protobuf field: string string_value = 2;
         */
        stringValue: string;
      }
    | {
        oneofKind: 'boolValue';
        /**
         * @generated from protobuf field: bool bool_value = 3;
         */
        boolValue: boolean;
      }
    | {
        oneofKind: undefined;
      };
}

/**
 * @generated from protobuf message okapi.v1.provider.PluginConfig
 */
export interface PluginConfig {
  /**
   * @generated from protobuf field: string access_key = 1;
   */
  accessKey: string;
  /**
   * @generated from protobuf field: string self_cluster_name = 2;
   */
  selfClusterName: string;
  /**
   * @generated from protobuf field: repeated okapi.v1.provider.ConfigItem items = 3;
   */
  items: ConfigItem[];
  /**
   * @generated from protobuf field: string log_token = 4;
   */
  logToken: string;
}

/**
 * @generated from protobuf message okapi.v1.ApiMethod
 */
export interface ApiMethod {
  /**
   * @generated from protobuf field: string api_name = 1;
   */
  apiName: string;
  /**
   * @generated from protobuf field: string method_name = 2;
   */
  methodName: string;
  /**
   * @generated from protobuf field: string method_type = 3;
   */
  methodType: string;
  /**
   * @generated from protobuf field: repeated string access_keys = 4;
   */
  accessKeys: string[];
}

/**
 * @generated from protobuf message okapi.v1.Provider
 */
export interface Provider {
  /**
   * @generated from protobuf field: string name = 1;
   */
  name: string;
  /**
   * @generated from protobuf field: string wasm_file = 2;
   */
  wasmFile: string;
  /**
   * @generated from protobuf field: repeated okapi.v1.ApiMethod api_methods = 3;
   */
  apiMethods: ApiMethod[];
  /**
   * @generated from protobuf field: string access_key = 4;
   */
  accessKey: string;
  /**
   * @generated from protobuf field: repeated okapi.v1.provider.ConfigItem config = 5;
   */
  config: ConfigItem[];
  /**
   * @generated from protobuf field: string log_token = 6;
   */
  logToken: string;
}

/**
 * @generated from protobuf message okapi.v1.OutboundExternal
 */
export interface OutboundExternal {
  /**
   * @generated from protobuf field: string host = 1;
   */
  host: string;
  /**
   * @generated from protobuf field: uint32 port = 2;
   */
  port: number;
}

/**
 * @generated from protobuf message okapi.v1.OutboundStub
 */
export interface OutboundStub {}

/**
 * @generated from protobuf message okapi.v1.App
 */
export interface App {
  /**
   * @generated from protobuf field: string name = 1;
   */
  name: string;
  /**
   * @generated from protobuf field: uint32 port = 2;
   */
  port: number;
  /**
   * @generated from protobuf field: repeated okapi.v1.Provider providers = 3;
   */
  providers: Provider[];
  /**
   * @generated from protobuf oneof: outbound
   */
  outbound:
    | {
        oneofKind: 'outboundExternal';
        /**
         * @generated from protobuf field: okapi.v1.OutboundExternal outbound_external = 4;
         */
        outboundExternal: OutboundExternal;
      }
    | {
        oneofKind: 'outboundStub';
        /**
         * @generated from protobuf field: okapi.v1.OutboundStub outbound_stub = 5;
         */
        outboundStub: OutboundStub;
      }
    | {
        oneofKind: undefined;
      };
  /**
   * @generated from protobuf field: string access_key = 6;
   */
  accessKey: string;
}
