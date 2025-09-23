import { Match } from "../../../infrastructure/databases/connection.js";


export const getMatchByUderIdService = async (userId) => {
    try {
      const matches = await Match.find({
        $or: [{ firstUser: userId }, { secondUser: userId }]
      })
        .populate('firstUser')
        .populate('secondUser')
        .exec();
  
      
      if (!matches.length) {
        return {
          info: {
            message: "No matches found",
            data: [],
          },
          code: 404,
        };
      }
  
      const matchedUsers = matches.map(match => {
        if (String(match.firstUser._id) === String(userId)) {
          return {
            id:match.id,
            user:match.secondUser,
            chatHistory: match.chatsHistory
          };
        } else {
          return {
            id:match.id,
            user:match.firstUser,
            chatHistory: match.chatsHistory
          };
        }
      });
  
      return {
        info: {
          message: "",
          data: matchedUsers,
        },
        code: 200,
      };
  
    } catch (error) {
      return {
        info: {
          message: error.message,
          data: [],
        },
        code: 500,
      };
    }
}; 





export const addMessageService=async (data) =>{

  try {
    const search = await Match.findOneAndUpdate(
      { _id: data.id },
      { $push: { chatsHistory: data.newMessage } }, 
      // { new: true } 
    );

    return {
      info: {
        message: "Message sent",
        data: [],
      },
      code: 200,
    };
  } catch (error) {
    return {
      info: {
        message: error.message,
        data: [],
      },
      code: 500,
    };
  }

}
  
