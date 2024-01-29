"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";

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
                onboarded: true
            },
            {upsert: true} //means updating and inserting depending if value exist or not
            );

            if(path === '/profile/edit'){
                revalidatePath(path) //next.js function that allows you to revalidate data with a specific data
                            // useful when you want to update cached data without waiting for revalidation period to expire
            }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export async function fetchUser(userId: string){
    try {
        connectToDB();

        return await User.findOne({id: userId})
        // .populate({
        //     path: 'communities',
        //     model: Community
        // })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string){
    try {
        connectToDB();

        //TODO: Populate Community

        //Find all threads authored by the user with the given user Id
        const threads = await User.findOne({id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate:{
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        })

        return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
}
