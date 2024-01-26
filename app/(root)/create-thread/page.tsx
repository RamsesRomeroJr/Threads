import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page(){
    const user = await currentUser();

    if(!user)return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/onboarding') //this redirects users who didn't finish onboarding but switched URL manually

    return <h1 className="head-text">Create Thread</h1>
}

export default Page;
