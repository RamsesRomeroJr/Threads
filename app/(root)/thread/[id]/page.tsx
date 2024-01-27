import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string }}) => {
    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    const thread = await fetchThreadById(params.id);

    return (
        <section className="relative">
            <div>
            <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={user?.id || ""}
                parentId={thread.parentId}
                content={thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
            />
            </div>
            <div className="mt-7">
                <Comment
                    threadId={thread.id}
                    currentUserImg={user.imageUrl}
                    currentUserId={JSON.stringify(userInfo._id)} //not sure if it'll always be a string or a mongoose object so we do JSON.stringify to make sure it is
                />
            </div>
        </section>
    )
}

export default Page;
