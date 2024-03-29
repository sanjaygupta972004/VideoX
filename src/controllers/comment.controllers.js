import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";

const crateVideoComment = asyncHandler(async(req,res)=> {
   const {content} = req.body
   const {videoId} = req.params
   const owner = req.user?._id
   
   if(!content){
      throw new ApiError(400, "content is required")
   }

   if(!isValidObjectId(videoId)){
      throw new ApiError(400, "invaild videoId")
   }

   const oldComment =  await Comment.find({
      $and:[{
         video:videoId,
         owner:owner
      }]
   })


    oldComment.map((comment)=>{
      if(comment.content === content){
         throw new ApiError(400,"this comment already exit pls send another comment")
      }
    })


   const video = await Video.findById(videoId)
   if(!video){
      throw new ApiError(404, "video is not available for comment")
   }

   const comment  = await Comment.create({
      content:content,
      video:videoId,
      owner:owner
   })

   if(!comment){
      throw new ApiError(500,"something went wrong while creating comment")
   }

   return res
      .status(201)
      .json(new ApiResponse(201,comment,"comment done"))

})

const updateVideoComment = asyncHandler(async(req,res)=> {
   const{content} = req.body
   const {commentId} = req.params
   const owner = req.user?._id

   if(!isValidObjectId(commentId)){
      throw new ApiError(400,"invalid commentId")
   }

   if(!content){
      throw new ApiError(400,"content is required to updateComment")
   }

   const exitingComment  = await Comment.findById(commentId)

   if(!exitingComment){
      throw new ApiError(404,"this comment is not availabe to updating")
   }
   if(exitingComment.owner.toString() !== owner.toString()){
      throw new ApiError(403,"you are not authorized to updateComment")
   }

   const updatedComment = await Comment.findByIdAndUpdate(commentId,
      {
         content:content
      },
      {
         new:true
      }
   )
   
   if(!updatedComment){
      throw new ApiError(500, "something went to wrong while updating comment")
   }

   return res 
        .status(200)
        .json(new ApiResponse(200,updatedComment,"updated comment successfully"))

})


const deleteVideoComment = asyncHandler(async(req,res)=> {
   const {commentId} = req.params
   const owner = req.user?._id

   if(!isValidObjectId(commentId)){
      throw new ApiError(400,"invalid commentId")
   }


   const exitingComment  = await Comment.findById(commentId)


   if(!exitingComment){
      throw new ApiError(404,"this comment is not available for deleting")
   }
   if(exitingComment.owner.toString() !== owner.toString()){
      throw new ApiError(403,"you are not authorized to deleteComment")
   }

   const result = await Comment.findByIdAndDelete(commentId)

   console.log(result)
   
   if(!result){
      throw new ApiError(500, "something went to wrong while deleting comment")
   }

   return res 
        .status(200)
        .json(new ApiResponse(200,{},"updated comment successfully"))

})


const getAllVideoComments = asyncHandler(async(req,res) => {

})




export {
   crateVideoComment,
   updateVideoComment,
   deleteVideoComment,
   getAllVideoComments
}