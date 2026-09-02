import { redirect } from "next/navigation";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import RegistrationForm from "@/components/foodloop/registration-form";
import { prepareIdentity } from "@/lib/foodloop-data";

export const dynamic = "force-dynamic";

export default async function RegisterPage(){
  const user=await requireChatGPTUser("/register");
  const profile=await prepareIdentity({email:user.email.toLowerCase(),displayName:user.displayName});
  if(profile?.onboardingComplete) redirect("/dashboard");
  return <RegistrationForm identity={{email:user.email,displayName:user.displayName}} signOutPath={chatGPTSignOutPath("/")}/>;
}
