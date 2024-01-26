import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    text: {
        type: String,
        require: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    parentID: {
        type: String
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ]
});

//first time models isn't going to exist so it'll fall back on creating mongoose model thread,
//every time after it will already have a model thread
const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
