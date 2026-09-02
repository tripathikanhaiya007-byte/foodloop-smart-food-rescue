import { NextResponse } from "next/server";
import { acceptDonation, createDonation, FoodLoopError, getDashboard, getIdentity, markNotificationsRead, prepareIdentity, progressPickup, reviewOrganization, updateProfile } from "@/lib/foodloop-data";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof FoodLoopError) return NextResponse.json({error:error.message},{status:error.status});
  console.error("foodloop_api_error", error);
  return NextResponse.json({error:"FoodLoop could not complete this request. Please try again."},{status:500});
}

export async function GET(request: Request) {
  try {
    const identity=getIdentity(request); await prepareIdentity(identity);
    return NextResponse.json(await getDashboard(identity.email));
  } catch(error) { return fail(error); }
}

export async function POST(request: Request) {
  try {
    const identity=getIdentity(request); await prepareIdentity(identity);
    const body=await request.json() as {action?:string;[key:string]:unknown};
    switch(body.action){
      case "create_donation": await createDonation(identity.email,body); break;
      case "accept_donation": await acceptDonation(identity.email,Number(body.donationId)); break;
      case "progress_pickup": await progressPickup(identity.email,Number(body.pickupId),String(body.status) as "collected"|"delivered"); break;
      case "review_organization": await reviewOrganization(identity.email,Number(body.organizationId),String(body.status) as "approved"|"rejected"); break;
      case "update_profile": await updateProfile(identity.email,body); break;
      case "mark_notifications_read": await markNotificationsRead(identity.email); break;
      default: throw new FoodLoopError("Unknown action.",400);
    }
    return NextResponse.json({ok:true,data:await getDashboard(identity.email)});
  } catch(error) { return fail(error); }
}
