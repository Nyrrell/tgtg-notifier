declare type ACCOUNT = {
  email: string;
  accessToken: string;
  refreshToken: string;
  notifiers: Array<any>;
};

declare type TGTG_API_PARAMS = {
  headers?: object;
  body: object;
};

declare type TGTG_API_REFRESH = {
  access_token: string;
  refresh_token: string;
};

declare type TGTG_API_LOGIN = {
  state: string;
  polling_id: string;
};

declare type TGTG_API_POLLING = {
  statusCode: number;
  access_token: string;
  refresh_token: string;
};

declare type TGTG_STORES = {
  items: TGTG_ITEM[];
};

declare type TGTG_ITEM = {
  display_name: string;
  items_available: number;
  item: {
    item_id: string;
    item_price: {
      minor_units: number;
      code: string;
    };
  };
  pickup_interval: {
    start: string;
    end: string;
  };
  pickup_location: {
    address: {
      address_line: string;
    };
    location: {
      longitude: number;
      latitude: number;
    };
  };
};

declare type SENDABLE_ITEM = {
  id: string;
  name: string;
  available: string;
  price: string;
  pickupDate: string;
  pickupTime: string;
};
