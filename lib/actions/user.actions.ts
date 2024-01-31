"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

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

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
 } : {
    userId: string;
    searchString? : string;
    pageNumber? : number;
    pageSize? : number;
    sortBy? : SortOrder
 }){
    try {
        connectToDB();

        //calculate the number of users to skip based on page number and page size
        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: {$ne: userId } //$ne: userId means that the id does not equeal our users Id
        }

        if(searchString.trim() !== ''){
            query.$or = [
                { userName: {$regex: regex } },
                {name: {$regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy};

        const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec()

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };

    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string){
    try {
        connectToDB()

        //find all threads created by user
        const userThreads = await Thread.find({author: userId});

        // Collect all the child thread ids (replies) from the 'children fields
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []) //empty array is default to accumalator function

        const replies = await Thread.find({//_id of thread is in childThreadIds but the author is not current User seaching
            _id: { $in: childThreadIds},
            author: {$ne: userId}
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies

    } catch (error: any) {
        throw new Error (`Failed to fetch activity ${error.message}`)
    }
}
