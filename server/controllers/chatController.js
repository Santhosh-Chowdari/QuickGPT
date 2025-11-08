import Chat from "../models/Chat.js"

//API Controller for creating a new chat
export const createChat = async(req, res)=>{
    try{
        const userId = req.user._id
        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }
        await Chat.create(chatData)
        res.json({succsess: true, message: "Chat Created"})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}

//API Controller for getting all chats
export const getChats = async(req, res)=>{
    try{
        const userId = req.user._id
        const chats = await Chat.find({userId}).sort({updatedAt: -1})
        res.json({succsess: true, chats})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}

//API Controller for deleting a chat
export const deleteChat = async(req, res)=>{
    try{
        const userId = req.user._id
        const {chatId} = req.body
        await Chat.deleteOne({_id: chatId, userId})
        res.json({succsess: true, message: "Chat Deleted"})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}