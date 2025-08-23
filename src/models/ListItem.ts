export interface ListItem {
  listitemid?: string;
  listid: string;
  storenumber: number;
  itemname: string;
  itemvalue: string;
  createdby: string;
  createdon?: string;
}

export interface CreateListItemRequest {
  listid: string;
  storenumber: number;
  itemname: string;
  itemvalue: string;
  createdby: string;
}

export interface UpdateListItemRequest {
  itemname?: string;
  itemvalue?: string;
} 