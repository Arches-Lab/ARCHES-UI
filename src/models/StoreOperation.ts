export interface StoreOperation {
  storeoperationid: string;    
  storenumber: number;         
  operation: string;           
  operationdate: string;       // Date of the operation
  posa: number | null;         
  posb: number | null;         
  posc: number | null;         
  cash: number | null;         
  coins: number | null;        
  collected: number | null;    
  collectedpos: number | null; // Collected POS amount
  associateName?: string | null;
  totalCash?: number | null;
  posTotal?: number | null;
  overShort?: number | null;
  note: string | null;         // Optional note field
  createdby: string;           
  creator: {
    email: string | null;
    lastname: string;
    firstname: string;
  };
  createdon: string;           
} 
