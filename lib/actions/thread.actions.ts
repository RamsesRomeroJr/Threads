import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createThread({text, author, communityId, path} : Params){
    connectToDB();

    const createdThread = await Thread.create({
        text,
        author,
        community: null,
    }); //what is this thread? it's a mongoose model

    //update user model
    await User.findByIdAndUpdate( author, {
        $push: { threads: createdThread._id }
    })

    revalidatePath(path);
};
