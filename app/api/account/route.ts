import { NextResponse } from "next/server";
import { FoodLoopError, getIdentity, prepareIdentity, registerAccount } from "@/lib/foodloop-data";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof FoodLoopError) return NextResponse.json({error:error.message},{status:error.status});
  console.error("foodloop_account_error", error);
  return NextResponse.json({error:"Account registration could not be completed. Please try again."},{status:500});
}

export async function GET(request: Request) {
  try { const identity=getIdentity(request); const profile=await prepareIdentity(identity); return NextResponse.json({identity,profile}); }
  catch(error){ return fail(error); }
}

export async function POST(request: Request) {
  try { const identity=getIdentity(request); await prepareIdentity(identity); const body=await request.json() as Record<string,unknown>; const profile=await registerAccount(identity,body); return NextResponse.json({ok:true,profile}); }
  catch(error){ return fail(error); }
}
