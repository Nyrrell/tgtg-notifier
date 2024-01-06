declare type User = {
  Name: string;
  Email: string;
  'User-ID': string;
  'Access-Token': string;
  'Refresh-Token': string;
  Favorite: boolean;
  Webhook: string;
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
  status: number;
  access_token: string;
  refresh_token: string;
  startup_data: {
    user: {
      user_id: string;
    };
  };
};

declare type TGTG_STORES = {
  items: TGTG_STORE[];
};

declare type TGTG_STORE = {
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
