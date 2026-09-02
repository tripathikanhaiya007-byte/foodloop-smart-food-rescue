import { ArrowRight, CheckCircle2, Clock3, Leaf, LogOut, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import DashboardApp from "@/components/foodloop/dashboard-app";
import { prepareIdentity } from "@/lib/foodloop-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage(){
  const user=await requireChatGPTUser("/dashboard");
  const identity={email:user.email.toLowerCase(),displayName:user.displayName};
  const profile=await prepareIdentity(identity);
  if(!profile?.onboardingComplete) redirect("/register");
  const signOut=chatGPTSignOutPath("/");
  if(profile.role!=="admin"&&profile.status!=="approved") return <PendingAccount status={profile.status} name={profile.displayName} email={profile.email} signOut={signOut}/>;
  return <DashboardApp signOutPath={signOut}/>;
}

function PendingAccount({status,name,email,signOut}:{status:string;name:string;email:string;signOut:string}){
  const rejected=status==="rejected";
  return <main className="pending-page"><nav><Link className="landing-brand" href="/"><span><Leaf/></span><strong>FoodLoop<small>Smart food rescue</small></strong></Link><a href={signOut} target="_top"><LogOut/>Sign out</a></nav><section className="pending-card"><span className={rejected?"pending-icon rejected":"pending-icon"}>{rejected?<ShieldAlert/>:<Clock3/>}</span><span className="landing-kicker">ACCOUNT VERIFICATION</span><h1>{rejected?"Your application needs an update.":"Your application is in the review queue."}</h1><p>{rejected?"The administrator could not approve the current organisation details. Contact the FoodLoop administrator and provide corrected registration information.":"Thanks, "+name+". An administrator will review your organisation details before food donation or pickup tools are unlocked."}</p><div className="pending-details"><span><Mail/><div><small>Signed-in account</small><strong>{email}</strong></div></span><span><ShieldCheck/><div><small>Account protection</small><strong>ChatGPT identity verified</strong></div></span><span><CheckCircle2/><div><small>Next step</small><strong>{rejected?"Update documents with admin":"Administrator approval"}</strong></div></span></div><Link className="pending-home" href="/">Back to FoodLoop <ArrowRight/></Link></section></main>;
}
