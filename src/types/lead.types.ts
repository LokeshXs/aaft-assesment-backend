
export enum LeadStatus{
    NEW = "new",
    CONTACTED = "contacted",
    QUALIFIED = "qualified",
    CONVERTED = "converted",
    LOST = "lost"

}
export interface LeadType {
  name: string;
  email: string;
  phone: string;
  source: string;
  status:LeadStatus;
  assigned_to: number;

}

export interface LeadActivity{
  lead_id:number,
  activity_type:string,
  description:string,
  timestamp:Date

}
