import { Router } from "express";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "../utils/util";
import {
  createLead,
  fetchAllLeads,
  getAllUsersWithLeads,
  getLead,
  getLeadActivities,
  getLeadsWithActivities,
  insertLeadActivity,
  updateLeadStatus,
} from "../model/lead.model";
import {
  LeadStatus,
  type LeadActivity,
  type LeadType,
} from "../types/lead.types";

const router = Router();

const allowedTransition: Record<string, string[]> = {
  new: ["contacted", "lost"],
  contacted: ["qualified", "lost"],
  qualified: ["converted", "lost"],
  converted: ["lost"],
  lost: [],
};

// POST: Create Lead
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;

    // basic validation
    if (!name || !email || !phone || !source) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!isValidEmail(email) || !isValidPhone(phone)) {
      return res.status(400).json({
        message: "Invalid email or phone",
      });
    }

    //   Assigning the userid with least leads
    const allRows: { id: number }[] = await getAllUsersWithLeads();

    console.log(allRows);

    // converting the objects to array of ids
    const allUserIds = allRows.map((item) => item.id);

    // Map to store how many leads per userid
    const leadCountPerUser: Record<number, number> = {};

    for (const userId of allUserIds) {
      leadCountPerUser[userId] = leadCountPerUser[userId]
        ? leadCountPerUser[userId] + 1
        : 0;
    }

    let minLeadsUserId = allUserIds[0];

    if (!minLeadsUserId) {
      return res.status(400).json({
        json: "No users present to assign lead",
      });
    }

    let minLeadCountForUserId = leadCountPerUser[minLeadsUserId];

    for (const key in leadCountPerUser) {
      if (
        leadCountPerUser[key] &&
        minLeadCountForUserId &&
        leadCountPerUser[key] < minLeadCountForUserId
      ) {
        minLeadsUserId = Number(key);
        minLeadCountForUserId = leadCountPerUser[key];
      }
    }

    console.log(minLeadsUserId);
    console.log(minLeadCountForUserId);

    //   creating new lead
    const result = await createLead({
      name,
      email,
      phone,
      source,
      assigned_to: minLeadsUserId,
      status: LeadStatus.NEW,
    });

    res.status(201).json(result);
  } catch (err) {
    console.log(`Leads creation failed. Error:`, err);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// GET: fetch a lead
router.get("/:id", async (req, res) => {
  try {
    const leadId = Number(req.params.id);

    const lead = await getLead(leadId);
    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    return res.status(200).json(lead);
  } catch (err) {
    console.log("Lead fetch failed. Error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// GET: get all leads
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const { status, source, sort_by, order, assigned_to } = req.query;

    const allLeads = await getLeadsWithActivities();

    
    let filteredLeads = [...allLeads];

    if (status) {
      filteredLeads = filteredLeads.filter((lead) => lead.status === status);
    }

    if (source) {
      filteredLeads = filteredLeads.filter((lead) => lead.source === source);
    }

    if (assigned_to) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.assigned_to === Number(assigned_to)
      );
    }

    //   SORTING
    if (sort_by === "created_at") {
      filteredLeads.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        return order === "asec" ? dateA - dateB : dateB - dateA;
      });
    }

    // formatting the data to send back and adding last_activity
    const leadMap: Record<
      number,
      LeadType & {
        id: number;
        activity_count: number;
        last_activity: Date | null;
        assigned_user_email: string;
        created_at: Date;
        activities: { id: number; timestamp: Date }[];
      }
    > = {};

    filteredLeads.forEach((row) => {
      if (!leadMap[row.id]) {
        leadMap[row.id] = {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          source: row.source,
          status: row.status,
          assigned_to: row.assigned_to,
          activities: [],
          activity_count: 0,
          assigned_user_email: row.assigned_user_email,
          last_activity: null,
          created_at: row.created_at,
        };
      }

      if (row.activity_id) {
        const leadRow = leadMap[row.id];

        if (leadRow) {
          leadRow.activities.push({
            id: row.activity_id,
            timestamp: row.timestamp,
          });

          leadRow.activity_count += 1;

          const currentLastActivity = leadRow.last_activity;

          if (!currentLastActivity) {
            leadRow.last_activity = row.timestamp;
          } else if (
            currentLastActivity &&
            new Date(row.timestamp) > new Date(currentLastActivity)
          ) {
            leadRow.last_activity = row.timestamp;
          }
        }
      }
    });

    const formattedLeads = Object.values(leadMap);

    // SORTING using last_activity
    if (sort_by === "last_activity") {
      formattedLeads.sort((a, b) => {
        const aTime = a.last_activity ? new Date(a.last_activity).getTime() : 0;
        const bTime = b.last_activity ? new Date(b.last_activity).getTime() : 0;

        return order === "asec" ? aTime - bTime : bTime - aTime;
      });
    }

    console.log(formattedLeads);

    // PAGINATION
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let paginatedList = [...formattedLeads];
    paginatedList = paginatedList.slice(startIndex, endIndex);

    res.status(200).json({
      page,
      totalResults: filteredLeads.length,
      results: paginatedList,
    });
  } catch (err) {
    console.log("All Leads fetch failed. Error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// PUT: Update lead status
router.put("/:id/status", async (req, res) => {
try{
  const leadId = Number(req.params.id);
  const { status: newStatus } = req.body;

  console.log(newStatus);
  if (!newStatus) {
    return res.status(400).json({
      message: "status is required",
    });
  }

  // Finding the lead

  const lead = await getLead(leadId);

  if (!lead) {
    return res.status(404).json({
      message: "Lead not found",
    });
  }

  //   Updating Lead's status
  const allowedNextTransitions = allowedTransition[lead.status];

  if (!allowedNextTransitions?.includes(newStatus)) {
    return res.status(400).json({
      message: `Invalid transition from ${lead.status} to ${newStatus}`,
    });
  }

  // Update status
  const updatedLead = await updateLeadStatus(leadId, newStatus);

  // Log activity
  await insertLeadActivity(
    leadId,
    `Status changed from ${lead.status} to ${newStatus}`
  );

  res.status(200).json({
    message: "Status updated successfully",
    lead: updatedLead,
  });
}catch(err){
   console.log("Update lead failed. Error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
}
});

// GET: Get the activity timeline for lead
router.get("/:id/timeline", async (req, res) => {
 try{
 const leadId = Number(req.params.id);

  const leadActivities = await getLeadActivities(leadId);

  const timeline: Record<string, (LeadActivity & { id: number })[]> = {};

  leadActivities.forEach((activity) => {
    const dateKey = new Date(activity.timestamp)
      .toISOString()
      .split("T")[0] as string;

    if (!timeline[dateKey]) {
      timeline[dateKey] = [];
    }

    timeline[dateKey].push(activity);
  });

  res.json({
    leadId,
    timeline,
  });
 }catch(err){
   console.log("Update lead failed. Error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
 }
});

router.post("/check-duplicate", async (req, res) => {
 try{
 const { name, email, phone } = req.body;

  const leads = await fetchAllLeads();

  const normalizedInputs = {
    name: normalizeName(name),
    phone: normalizePhone(phone),
    email: normalizeEmail(email),
  };

  const matchesFound = [];

  for (const lead of leads) {
    let score = 0;

    if (email && normalizeEmail(lead.email) === normalizedInputs.email) {
      score += 40;
    }

    if (phone && normalizePhone(lead.phone) === normalizedInputs.phone) {
      score += 40;
    }

    if (name && normalizeName(lead.name) === normalizedInputs.name) {
      score += 20;
    }

    if (score > 0) {
      matchesFound.push({
        ...lead,
        score,
      });
    }
  }

  const isDuplicate = matchesFound.length > 0;

  const confidence = isDuplicate
    ? Math.max(
        ...matchesFound.map((match) => {
          const score = match.score;

          delete match.score;

          return score;
        })
      )
    : 0;

  res.status(200).json({
    isDuplicate,
    matches: matchesFound,
    confidence,
  });
 }catch(err){
   console.log("Duplicate detection failed. Error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
 }
});

export default router;
