import pool from "../db";
import type { LeadActivity, LeadType } from "../types/lead.types";

export async function createLead(leadData: LeadType) {
  const query = `
    
    INSERT INTO leads (name, email, phone, source, assigned_to,status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `;

  const result = await pool.query(query, [
    leadData.name,
    leadData.email,
    leadData.phone,
    leadData.source,
    leadData.assigned_to,
    leadData.status,
  ]);

  const newLead: LeadType & { id: number } = result.rows[0];

  const assignedUserQuery = `
  SELECT id,name,email FROM users WHERE id = $1;


  `;

  const userResult = await pool.query(assignedUserQuery, [leadData.assigned_to]);
  return { newLead, assignedUser: userResult.rows[0] };
}

export async function getAllUsersWithLeads() {
  const query = ` 
    SELECT users.id
    FROM users
    LEFT JOIN leads ON users.id = leads.assigned_to;
    
    `;

  const result = await pool.query(query);

  return result.rows;
}


export async function getLeadsWithActivities(){

  const query = `
  SELECT l.*,u.email AS assigned_user_email, a.timestamp, a.id AS activity_id
  FROM leads l
  LEFT JOIN lead_activities a ON l.id = a.lead_id
  LEFT JOIN users u ON l.assigned_to = u.id
  ;
  
  `

  const result = await pool.query(query);
  const results:(LeadType&{id:number,timestamp:LeadActivity["timestamp"],activity_id:number,created_at:Date,assigned_user_email:string})[] = result.rows;
  return results;
}

export async function getLead(id:number){

  const query = `
  SELECT * FROM leads WHERE id=$1;
  `

  const result = await pool.query(query,[id]);

  return result.rows[0]
}


export async function updateLeadStatus(leadId:number,status:string){

   const result = await pool.query(
    `
    UPDATE leads
    SET status = $1
    WHERE id = $2
    RETURNING *;
    `,
    [status, leadId]
  );

  return result.rows[0];
}

export const insertLeadActivity = async (
  leadId: number,
  description: string
) => {
  await pool.query(
    `
    INSERT INTO lead_activities (lead_id, activity_type, description)
    VALUES ($1, $2, $3);
    `,
    [leadId, "status_change", description]
  );
};


export const getLeadActivities = async (leadId: number) => {
  const result = await pool.query(
    `
    SELECT * FROM lead_activities
    WHERE lead_id = $1;
    `,
    [leadId]
  );

  const leads:(LeadActivity&{id:number})[] = result.rows
  return leads;
};


export const fetchAllLeads = async () => {
  const result = await pool.query(`
    SELECT id, name, email, phone
    FROM leads;
  `);

  return result.rows;
};
