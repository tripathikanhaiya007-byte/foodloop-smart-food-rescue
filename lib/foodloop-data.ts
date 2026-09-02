import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { donations, feedback, impactEvents, notifications, organizations, pickups, safetyChecks, statusEvents, systemSettings, users } from "@/db/schema";

export type AppRole = "donor" | "ngo" | "admin";
export type AccountStatus = "pending" | "approved" | "rejected";
export type RequestIdentity = { email: string; displayName: string };

export class FoodLoopError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const orgSeed = [
  { id:1,name:"Aarav Community Kitchen",type:"donor",verified:true,address:"Vibhuti Khand, Gomti Nagar",area:"Gomti Nagar",phone:"+91 98765 12001",capacity:220,rating:4.9,email:"hello@aaravkitchen.demo",contactPerson:"Arjun Mehta",registrationNumber:"FSSAI-DEMO-1001",description:"Community kitchen and corporate meal partner.",approvalStatus:"approved" },
  { id:2,name:"Sunrise Banquets",type:"donor",verified:true,address:"Faizabad Road",area:"Indira Nagar",phone:"+91 98765 12002",capacity:500,rating:4.7,email:"events@sunrise.demo",contactPerson:"Meera Kapoor",registrationNumber:"FSSAI-DEMO-1002",description:"Banquet venue contributing safe event surplus.",approvalStatus:"approved" },
  { id:3,name:"City College Canteen",type:"donor",verified:true,address:"University Road",area:"Hazratganj",phone:"+91 98765 12003",capacity:350,rating:4.8,email:"canteen@citycollege.demo",contactPerson:"Rahul Joshi",registrationNumber:"FSSAI-DEMO-1003",description:"Campus canteen with a daily food-rescue programme.",approvalStatus:"approved" },
  { id:4,name:"Udaan Foundation",type:"ngo",verified:true,address:"Viraj Khand, Gomti Nagar",area:"Gomti Nagar",phone:"+91 98765 13001",capacity:180,rating:4.9,email:"rescue@udaan.demo",contactPerson:"Riya Sharma",registrationNumber:"NGO-DEMO-2001",description:"Distributes cooked meals through community centres.",approvalStatus:"approved" },
  { id:5,name:"Seva Roti Trust",type:"ngo",verified:true,address:"Aliganj Main Road",area:"Aliganj",phone:"+91 98765 13002",capacity:240,rating:4.8,email:"pickup@sevaroti.demo",contactPerson:"Aman Verma",registrationNumber:"NGO-DEMO-2002",description:"Volunteer-led redistribution and ration support.",approvalStatus:"approved" },
  { id:6,name:"Nayi Disha Collective",type:"ngo",verified:false,address:"Rajajipuram",area:"Rajajipuram",phone:"+91 98765 13003",capacity:120,rating:4.4,email:"team@nayidisha.demo",contactPerson:"Neha Khan",registrationNumber:"NGO-DEMO-2003",description:"New community food partner awaiting review.",approvalStatus:"pending" },
];

const donationSeed = [
  { id:1,organizationId:2,createdBy:"seed@foodloop.demo",title:"Veg biryani & dal",category:"Cooked meals",description:"Freshly prepared vegetarian dinner portions.",servings:85,quantityKg:27,preparedAt:"2026-08-29T17:30:00Z",pickupBy:"2026-08-29T21:00:00Z",storage:"Hot-held",diet:"Vegetarian",allergens:"Dairy",address:"Faizabad Road, Lucknow",area:"Indira Nagar",distanceKm:1.8,priority:"urgent",status:"available",createdAt:"2026-08-29T18:00:00Z" },
  { id:2,organizationId:1,createdBy:"seed@foodloop.demo",title:"Paneer wraps & fruit",category:"Packed meals",description:"Individually packed wraps with whole fruit.",servings:42,quantityKg:12.5,preparedAt:"2026-08-29T16:45:00Z",pickupBy:"2026-08-29T22:30:00Z",storage:"Refrigerated",diet:"Vegetarian",allergens:"Gluten, dairy",address:"Vibhuti Khand, Lucknow",area:"Gomti Nagar",distanceKm:2.4,priority:"normal",status:"available",createdAt:"2026-08-29T17:15:00Z" },
  { id:3,organizationId:3,createdBy:"seed@foodloop.demo",title:"Rice, rajma & salad",category:"Cooked meals",description:"College canteen lunch surplus in sealed containers.",servings:55,quantityKg:19,preparedAt:"2026-08-29T13:00:00Z",pickupBy:"2026-08-29T19:30:00Z",storage:"Refrigerated",diet:"Vegan",allergens:"None declared",address:"University Road, Lucknow",area:"Hazratganj",distanceKm:4.6,priority:"urgent",status:"accepted",createdAt:"2026-08-29T14:10:00Z" },
  { id:4,organizationId:1,createdBy:"seed@foodloop.demo",title:"Bread, pastries & bananas",category:"Bakery",description:"Same-day bakery items and ripe bananas.",servings:36,quantityKg:9.2,preparedAt:"2026-08-29T08:00:00Z",pickupBy:"2026-08-30T08:00:00Z",storage:"Room temperature",diet:"Vegetarian",allergens:"Gluten, nuts",address:"Vibhuti Khand, Lucknow",area:"Gomti Nagar",distanceKm:2.1,priority:"normal",status:"available",createdAt:"2026-08-29T16:00:00Z" },
  { id:5,organizationId:2,createdBy:"seed@foodloop.demo",title:"Wedding buffet dinner",category:"Cooked meals",description:"Mixed vegetarian buffet: pulao, dal, sabzi and rotis.",servings:140,quantityKg:46,preparedAt:"2026-08-28T18:30:00Z",pickupBy:"2026-08-28T23:00:00Z",storage:"Hot-held",diet:"Vegetarian",allergens:"Gluten, dairy",address:"Faizabad Road, Lucknow",area:"Indira Nagar",distanceKm:1.8,priority:"urgent",status:"delivered",createdAt:"2026-08-28T19:00:00Z" },
  { id:6,organizationId:3,createdBy:"seed@foodloop.demo",title:"Breakfast poha",category:"Cooked meals",description:"Fresh poha with peanuts packed in trays.",servings:68,quantityKg:17,preparedAt:"2026-08-28T07:30:00Z",pickupBy:"2026-08-28T11:00:00Z",storage:"Hot-held",diet:"Vegan",allergens:"Peanuts",address:"University Road, Lucknow",area:"Hazratganj",distanceKm:4.6,priority:"normal",status:"delivered",createdAt:"2026-08-28T08:00:00Z" },
  { id:7,organizationId:1,createdBy:"seed@foodloop.demo",title:"Dry ration kits",category:"Groceries",description:"Rice, lentils and cooking oil in sealed packs.",servings:100,quantityKg:60,preparedAt:"2026-08-27T10:00:00Z",pickupBy:"2026-09-02T18:00:00Z",storage:"Room temperature",diet:"Vegan",allergens:"None declared",address:"Vibhuti Khand, Lucknow",area:"Gomti Nagar",distanceKm:2.4,priority:"low",status:"delivered",createdAt:"2026-08-27T10:30:00Z" },
  { id:8,organizationId:2,createdBy:"seed@foodloop.demo",title:"Idli & sambar",category:"Cooked meals",description:"Breakfast portions in food-grade containers.",servings:48,quantityKg:14,preparedAt:"2026-08-27T07:00:00Z",pickupBy:"2026-08-27T11:00:00Z",storage:"Hot-held",diet:"Vegan",allergens:"Mustard",address:"Faizabad Road, Lucknow",area:"Indira Nagar",distanceKm:1.8,priority:"normal",status:"delivered",createdAt:"2026-08-27T07:20:00Z" },
];

const pickupSeed = [
  {id:1,donationId:3,receiverOrganizationId:4,volunteerName:"Riya Sharma",volunteerPhone:"+91 99876 44110",status:"accepted",etaMinutes:24,verificationCode:"FL-3482",acceptedAt:"2026-08-29T17:42:00Z"},
  {id:2,donationId:5,receiverOrganizationId:5,volunteerName:"Aman Verma",volunteerPhone:"+91 99876 44111",status:"delivered",etaMinutes:0,verificationCode:"FL-7814",acceptedAt:"2026-08-28T19:15:00Z",collectedAt:"2026-08-28T20:05:00Z",deliveredAt:"2026-08-28T21:10:00Z"},
  {id:3,donationId:6,receiverOrganizationId:4,volunteerName:"Vikram Singh",volunteerPhone:"+91 99876 44112",status:"delivered",etaMinutes:0,verificationCode:"FL-2219",acceptedAt:"2026-08-28T08:12:00Z",collectedAt:"2026-08-28T08:45:00Z",deliveredAt:"2026-08-28T09:35:00Z"},
  {id:4,donationId:7,receiverOrganizationId:5,volunteerName:"Neha Khan",volunteerPhone:"+91 99876 44113",status:"delivered",etaMinutes:0,verificationCode:"FL-6035",acceptedAt:"2026-08-27T11:00:00Z",collectedAt:"2026-08-27T13:15:00Z",deliveredAt:"2026-08-27T16:20:00Z"},
  {id:5,donationId:8,receiverOrganizationId:4,volunteerName:"Riya Sharma",volunteerPhone:"+91 99876 44110",status:"delivered",etaMinutes:0,verificationCode:"FL-9146",acceptedAt:"2026-08-27T07:35:00Z",collectedAt:"2026-08-27T08:05:00Z",deliveredAt:"2026-08-27T09:00:00Z"},
];

export function getIdentity(request: Request): RequestIdentity {
  const email = request.headers.get("oai-authenticated-user-email");
  if (!email) throw new FoodLoopError("Sign in with ChatGPT to continue.", 401);
  const raw = request.headers.get("oai-authenticated-user-full-name");
  let fullName: string | null = null;
  if (raw && request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8") {
    try { fullName = decodeURIComponent(raw); } catch { fullName = null; }
  }
  return { email: email.toLowerCase(), displayName: fullName ?? email };
}

export async function ensureSeed() {
  const db = getDb();
  const seedKey = "demo_seed_v3";
  const [seeded] = await db.select().from(systemSettings).where(eq(systemSettings.key,seedKey)).limit(1);
  if (seeded) return;
  for (const row of orgSeed) await db.insert(organizations).values(row).onConflictDoUpdate({
    target:organizations.id,
    set:{
      email:row.email,
      contactPerson:row.contactPerson,
      registrationNumber:row.registrationNumber,
      description:row.description,
      approvalStatus:row.approvalStatus,
      verified:row.verified,
    },
  });
  for (const row of donationSeed) await db.insert(donations).values(row).onConflictDoNothing();
  for (const d of donationSeed) await db.insert(safetyChecks).values({id:d.id,donationId:d.id,sealed:true,temperatureControlled:d.storage!=="Room temperature",allergenLabelled:true,donorDeclaration:true,notes:d.id===5?"Verified at collection by NGO coordinator.":"Donor checklist complete."}).onConflictDoNothing();
  for (const row of pickupSeed) await db.insert(pickups).values(row).onConflictDoNothing();
  const events = [
    {id:1,pickupId:1,status:"accepted",note:"Pickup accepted by Udaan Foundation",actorEmail:"seed@foodloop.demo",createdAt:"2026-08-29T17:42:00Z"},
    {id:2,pickupId:2,status:"delivered",note:"140 meals delivered to two community centres",actorEmail:"seed@foodloop.demo",createdAt:"2026-08-28T21:10:00Z"},
    {id:3,pickupId:3,status:"delivered",note:"Breakfast distribution completed",actorEmail:"seed@foodloop.demo",createdAt:"2026-08-28T09:35:00Z"},
    {id:4,pickupId:4,status:"delivered",note:"Ration kits received at Seva Roti Trust",actorEmail:"seed@foodloop.demo",createdAt:"2026-08-27T16:20:00Z"},
    {id:5,pickupId:5,status:"delivered",note:"Handover verified",actorEmail:"seed@foodloop.demo",createdAt:"2026-08-27T09:00:00Z"},
  ];
  for (const row of events) await db.insert(statusEvents).values(row).onConflictDoNothing();
  const impacts = [
    {id:1,donationId:5,mealsServed:140,foodKg:46,peopleReached:118,carbonKgAvoided:115,completedAt:"2026-08-28T21:10:00Z"},
    {id:2,donationId:6,mealsServed:68,foodKg:17,peopleReached:62,carbonKgAvoided:42.5,completedAt:"2026-08-28T09:35:00Z"},
    {id:3,donationId:7,mealsServed:100,foodKg:60,peopleReached:40,carbonKgAvoided:150,completedAt:"2026-08-27T16:20:00Z"},
    {id:4,donationId:8,mealsServed:48,foodKg:14,peopleReached:44,carbonKgAvoided:35,completedAt:"2026-08-27T09:00:00Z"},
  ];
  for (const row of impacts) await db.insert(impactEvents).values(row).onConflictDoNothing();
  for (const row of [{id:1,pickupId:2,rating:5,comment:"Well packed and ready on time.",submittedBy:"Seva Roti Trust"},{id:2,pickupId:3,rating:5,comment:"Smooth handover and clear allergen details.",submittedBy:"Udaan Foundation"}]) await db.insert(feedback).values(row).onConflictDoNothing();
  await db.insert(systemSettings).values({key:seedKey,value:new Date().toISOString()}).onConflictDoUpdate({target:systemSettings.key,set:{value:new Date().toISOString(),updatedAt:new Date().toISOString()}});
}

export async function prepareIdentity(identity: RequestIdentity) {
  await ensureSeed();
  const db = getDb();
  const adminEmail = typeof env.ADMIN_EMAIL === "string" ? env.ADMIN_EMAIL.toLowerCase() : "";
  if (adminEmail && identity.email === adminEmail) {
    await db.insert(users).values({email:identity.email,displayName:identity.displayName,role:"admin",organizationId:null,status:"approved",onboardingComplete:true,phone:""}).onConflictDoUpdate({target:users.email,set:{displayName:identity.displayName,role:"admin",organizationId:null,status:"approved",onboardingComplete:true,lastSeenAt:new Date().toISOString()}});
  } else {
    await db.update(users).set({displayName:identity.displayName,lastSeenAt:new Date().toISOString()}).where(eq(users.email,identity.email));
  }
  return getProfile(identity.email);
}

export async function getProfile(email: string) {
  const [profile] = await getDb().select().from(users).where(eq(users.email,email)).limit(1);
  return profile ?? null;
}

async function requireProfile(email: string) {
  const profile = await getProfile(email);
  if (!profile?.onboardingComplete) throw new FoodLoopError("Complete account registration first.", 409);
  return profile;
}

function assertApproved(profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>) {
  if (profile.role !== "admin" && profile.status !== "approved") throw new FoodLoopError("Your organisation is waiting for administrator approval.", 403);
}

export async function registerAccount(identity: RequestIdentity, payload: Record<string, unknown>) {
  const db = getDb();
  const existing = await getProfile(identity.email);
  if (existing?.onboardingComplete) throw new FoodLoopError("This account is already registered.", 409);
  const role = String(payload.role ?? "") as AppRole;
  if (role !== "donor" && role !== "ngo") throw new FoodLoopError("Choose Food donor or NGO account type.");
  const name = String(payload.organizationName ?? "").trim();
  const address = String(payload.address ?? "").trim();
  const area = String(payload.area ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const contactPerson = String(payload.contactPerson ?? identity.displayName).trim();
  const registrationNumber = String(payload.registrationNumber ?? "").trim();
  const capacity = Math.max(0, Number(payload.capacity ?? 0));
  if (!name || !address || !area || !phone || !contactPerson || !registrationNumber) throw new FoodLoopError("All organisation and verification fields are required.");
  if (payload.acceptedTerms !== true) throw new FoodLoopError("Accept the food-safety and responsible-use declaration.");
  const [org] = await db.insert(organizations).values({name,type:role,verified:false,address,area,phone,capacity,email:identity.email,contactPerson,registrationNumber,description:String(payload.description??"").trim(),approvalStatus:"pending",rating:0}).returning();
  await db.insert(users).values({email:identity.email,displayName:identity.displayName,role,organizationId:org.id,status:"pending",onboardingComplete:true,phone}).onConflictDoUpdate({target:users.email,set:{displayName:identity.displayName,role,organizationId:org.id,status:"pending",onboardingComplete:true,phone,lastSeenAt:new Date().toISOString()}});
  await db.insert(notifications).values({userEmail:identity.email,title:"Application received",message:`${name} is waiting for administrator verification.`,kind:"info"});
  return getProfile(identity.email);
}

export async function updateProfile(email: string, payload: Record<string, unknown>) {
  const db = getDb(); const profile = await requireProfile(email);
  const displayName = String(payload.displayName ?? profile.displayName).trim(); const phone = String(payload.phone ?? profile.phone).trim();
  if (!displayName || !phone) throw new FoodLoopError("Name and phone are required.");
  await db.update(users).set({displayName,phone}).where(eq(users.email,email));
  if (profile.organizationId) await db.update(organizations).set({name:String(payload.organizationName??"").trim()||undefined,address:String(payload.address??"").trim()||undefined,area:String(payload.area??"").trim()||undefined,phone,contactPerson:String(payload.contactPerson??displayName).trim(),description:String(payload.description??"").trim()}).where(eq(organizations.id,profile.organizationId));
}

export async function getDashboard(email: string) {
  const db = getDb(); const profile = await requireProfile(email); assertApproved(profile);
  const orgRowsAll = await db.select().from(organizations).orderBy(desc(organizations.verified),desc(organizations.rating));
  const donationsAll = await db.select().from(donations).orderBy(desc(donations.createdAt),desc(donations.id));
  const pickupsAll = await db.select().from(pickups).orderBy(desc(pickups.acceptedAt));
  const donationMap = new Map(donationsAll.map(d=>[d.id,d]));
  const visibleDonations = profile.role === "donor" ? donationsAll.filter(d=>d.organizationId===profile.organizationId) : donationsAll;
  const visibleDonationIds = new Set(visibleDonations.map(d=>d.id));
  const visiblePickups = profile.role === "admin" ? pickupsAll : profile.role === "ngo" ? pickupsAll.filter(p=>p.receiverOrganizationId===profile.organizationId) : pickupsAll.filter(p=>visibleDonationIds.has(p.donationId));
  const visiblePickupIds = new Set(visiblePickups.map(p=>p.id));
  const orgRows = profile.role === "admin" ? orgRowsAll : orgRowsAll.filter(o=>o.verified||o.id===profile.organizationId);
  const names = new Map(orgRowsAll.map(o=>[o.id,o.name]));
  const donationRowsNamed = visibleDonations.map(d=>({...d,organizationName:names.get(d.organizationId)??"Unknown partner",organizationVerified:orgRowsAll.find(o=>o.id===d.organizationId)?.verified??false}));
  const pickupRows = visiblePickups.map(p=>{const d=donationMap.get(p.donationId);return {...p,donationTitle:d?.title??"Unknown donation",servings:d?.servings??0,donorName:names.get(d?.organizationId??0)??"Unknown donor",receiverName:names.get(p.receiverOrganizationId)??"Unknown partner"};});
  const notificationRows = await db.select().from(notifications).where(eq(notifications.userEmail,email)).orderBy(desc(notifications.createdAt)).limit(15);
  const allEvents = await db.select().from(statusEvents).orderBy(desc(statusEvents.createdAt)).limit(30);
  const eventRows = profile.role === "admin" ? allEvents.slice(0,10) : allEvents.filter(e=>visiblePickupIds.has(e.pickupId)).slice(0,10);
  const allSafety = await db.select().from(safetyChecks); const safetyRows = allSafety.filter(s=>visibleDonationIds.has(s.donationId));
  const allImpact = await db.select().from(impactEvents); const impactRows = profile.role === "admin" || profile.role === "ngo" ? allImpact : allImpact.filter(i=>visibleDonationIds.has(i.donationId));
  const impact = impactRows.reduce((a,i)=>({meals:a.meals+i.mealsServed,foodKg:a.foodKg+i.foodKg,people:a.people+i.peopleReached,carbonKg:a.carbonKg+i.carbonKgAvoided,completed:a.completed+1}),{meals:0,foodKg:0,people:0,carbonKg:0,completed:0});
  return {profile,donations:donationRowsNamed,pickups:pickupRows,organizations:orgRows,notifications:notificationRows,events:eventRows,safetyChecks:safetyRows,impact:{...impact,available:visibleDonations.filter(d=>d.status==="available").length,activePickups:visiblePickups.filter(p=>p.status!=="delivered").length,partners:orgRowsAll.filter(o=>o.verified).length,unread:notificationRows.filter(n=>!n.read).length}};
}

export async function createDonation(email: string, payload: Record<string, unknown>) {
  const db = getDb(); const profile = await requireProfile(email); assertApproved(profile);
  if (profile.role !== "donor" || !profile.organizationId) throw new FoodLoopError("Only an approved food-donor account can publish food.", 403);
  const [org] = await db.select().from(organizations).where(eq(organizations.id,profile.organizationId)).limit(1); if (!org?.verified) throw new FoodLoopError("Your organisation must be verified before publishing food.",403);
  const title=String(payload.title??"").trim(),servings=Number(payload.servings??0),quantityKg=Number(payload.quantityKg??0); if(!title||servings<1||quantityKg<=0) throw new FoodLoopError("Food name, servings and quantity are required.");
  const [row]=await db.insert(donations).values({organizationId:profile.organizationId,createdBy:email,title,category:String(payload.category??"Cooked meals"),description:String(payload.description??""),servings,quantityKg,preparedAt:String(payload.preparedAt),pickupBy:String(payload.pickupBy),storage:String(payload.storage??"Refrigerated"),diet:String(payload.diet??"Vegetarian"),allergens:String(payload.allergens??"None declared"),address:String(payload.address??org.address),area:String(payload.area??org.area),distanceKm:.8,priority:String(payload.priority??"normal"),status:"available"}).returning();
  await db.insert(safetyChecks).values({donationId:row.id,sealed:Boolean(payload.sealed),temperatureControlled:Boolean(payload.temperatureControlled),allergenLabelled:Boolean(payload.allergenLabelled),donorDeclaration:true,notes:String(payload.safetyNotes??"Checklist completed by donor.")});
  await db.insert(notifications).values({userEmail:email,title:"Donation published",message:`${title} is now visible to verified NGOs.`,kind:"success"}); return row;
}

export async function acceptDonation(email: string, donationId: number) {
  const db=getDb(),profile=await requireProfile(email); assertApproved(profile); if(profile.role!=="ngo"||!profile.organizationId) throw new FoodLoopError("Only an approved NGO account can accept pickups.",403);
  const [org]=await db.select().from(organizations).where(eq(organizations.id,profile.organizationId)).limit(1); if(!org?.verified) throw new FoodLoopError("Your NGO must be verified before accepting food.",403);
  const [d]=await db.select().from(donations).where(and(eq(donations.id,donationId),eq(donations.status,"available"))).limit(1); if(!d) throw new FoodLoopError("This donation is no longer available.",409);
  const code=`FL-${Math.floor(1000+Math.random()*9000)}`; const [pickup]=await db.insert(pickups).values({donationId,receiverOrganizationId:profile.organizationId,volunteerName:profile.displayName,volunteerPhone:profile.phone,status:"accepted",etaMinutes:Math.max(12,Math.round(d.distanceKm*8)),verificationCode:code}).returning();
  await db.update(donations).set({status:"accepted"}).where(eq(donations.id,donationId)); await db.insert(statusEvents).values({pickupId:pickup.id,status:"accepted",note:`Pickup accepted by ${org.name}.`,actorEmail:email}); await db.insert(notifications).values({userEmail:email,title:"Pickup reserved",message:`${d.title} is assigned to your organisation. Handover code: ${code}`,kind:"success"}); return pickup;
}

export async function progressPickup(email:string,pickupId:number,nextStatus:"collected"|"delivered") {
  const db=getDb(),profile=await requireProfile(email); assertApproved(profile); if(profile.role!=="ngo"&&profile.role!=="admin") throw new FoodLoopError("Only NGO or administrator accounts can update pickups.",403);
  const [pickup]=await db.select().from(pickups).where(eq(pickups.id,pickupId)).limit(1); if(!pickup) throw new FoodLoopError("Pickup not found.",404); if(profile.role==="ngo"&&pickup.receiverOrganizationId!==profile.organizationId) throw new FoodLoopError("This pickup belongs to another organisation.",403);
  const [donation]=await db.select().from(donations).where(eq(donations.id,pickup.donationId)).limit(1); if(!donation) throw new FoodLoopError("Donation not found.",404); const now=new Date().toISOString();
  if(nextStatus==="collected"){if(pickup.status!=="accepted") throw new FoodLoopError("Only accepted pickups can be collected.",409);await db.update(pickups).set({status:"collected",collectedAt:now,etaMinutes:18}).where(eq(pickups.id,pickupId));await db.update(donations).set({status:"collected"}).where(eq(donations.id,donation.id));}
  else{if(pickup.status!=="collected") throw new FoodLoopError("Confirm collection before delivery.",409);await db.update(pickups).set({status:"delivered",deliveredAt:now,etaMinutes:0}).where(eq(pickups.id,pickupId));await db.update(donations).set({status:"delivered"}).where(eq(donations.id,donation.id));await db.insert(impactEvents).values({donationId:donation.id,mealsServed:donation.servings,foodKg:donation.quantityKg,peopleReached:Math.max(1,Math.round(donation.servings*.86)),carbonKgAvoided:Math.round(donation.quantityKg*25)/10}).onConflictDoNothing();}
  await db.insert(statusEvents).values({pickupId,status:nextStatus,note:nextStatus==="collected"?"Food collected and checked.":"Delivery verified and impact recorded.",actorEmail:email});
}

export async function reviewOrganization(email:string,organizationId:number,status:"approved"|"rejected") {
  const db=getDb(),profile=await requireProfile(email); if(profile.role!=="admin") throw new FoodLoopError("Administrator access is required.",403);
  const [org]=await db.select().from(organizations).where(eq(organizations.id,organizationId)).limit(1); if(!org) throw new FoodLoopError("Organisation not found.",404);
  await db.update(organizations).set({verified:status==="approved",approvalStatus:status}).where(eq(organizations.id,organizationId));
  const members=await db.select().from(users).where(eq(users.organizationId,organizationId)); const now=new Date().toISOString();
  for(const member of members){await db.update(users).set({status,approvedAt:status==="approved"?now:null,approvedBy:email}).where(eq(users.email,member.email));await db.insert(notifications).values({userEmail:member.email,title:status==="approved"?"Organisation approved":"Application needs attention",message:status==="approved"?`${org.name} is verified. Your ${org.type==="ngo"?"pickup":"donation"} tools are now unlocked.`:`${org.name} was not approved. Contact the FoodLoop administrator to update the application.`,kind:status==="approved"?"success":"warning"});}
}

export async function markNotificationsRead(email:string){await getDb().update(notifications).set({read:true}).where(eq(notifications.userEmail,email));}
