"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void>{
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                path
            },
            {upsert: true} //means updating and inserting depending if vlaue exist or not
            );

            if(path === '/profile/edit'){
                revalidatePath(path) //next.js function that allows you to revalidate data with a specific data
                            // useful when you want to update cached data without waiting for revalidation period to expire
            }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}
