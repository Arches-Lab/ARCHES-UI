export interface StoreOperation {
  storeoperationid: string;    
  storenumber: number;         
  operation: string;           
  operationdate: string;       // Date of the operation
  posa: number | null;         
  posb: number | null;         
  posc: number | null;         
  posaCash?: number | null;
  posbcash?: number | null;
  posccash?: number | null;
  reservecash?: number | null;
  reservecoins?: number | null;
  totalCash?: number | null;
  posTotal?: number | null;
  postotalcash?: number | null;
  collectedcash?: number | null;
  overShort?: number | null;
  hundreds?: number | null;
  fifties?: number | null;
  twenties?: number | null;
  tens?: number | null;
  fives?: number | null;
  twos?: number | null;
  ones?: number | null;
  note: string | null;         // Optional note field
  createdby: string;           
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;           
} 
