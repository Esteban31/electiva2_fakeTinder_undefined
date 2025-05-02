import { Swipe } from "../../../infrastructure/databases/connection.js";
import { getUserByIdService } from "../users/user.service.js";


export const swipeActionService = async(data) => {

  const search =  await Swipe.findOne({userId:data.userId,targetUserId: data.targetUserId}).exec()


  if (!search?._id) {//No Existe un like al usuario
    
    const newSwipe = new Swipe({
      userId: data.userId,
      targetUserId: data.targetUserId,
      action: data.action,
    });

    await newSwipe.save();


    // Search an Match with the current swipe
    const iLikeHer = await Swipe.findOne({userId:data.userId, targetUserId:data.targetUserId})
    const sheLikesMe = await Swipe.findOne({userId:data.targetUserId, targetUserId:data.userId})

    if (iLikeHer?._id && sheLikesMe?._id) {//IT'S A MATCH

      // Retornamos la información de cada usuario para poder mostrarla
      const person1 = await getUserByIdService(data.userId)
      const person2 = await getUserByIdService(data.targetUserId)

      return {
        info: {
          message: "IT'S A MATCH",
          data: [
            {user1:person1.info.data},
            {user2:person2.info.data}
          ]
        },
        code: 200,
      };
    }else{
      return {
        info: {
          message: "Swipe saved",
          data: []
        },
        code: 200,
      };
    }

  } else {
    return {
      info: {
        message: "Swipe already registered",
        data: []
      },
      code: 200,
    };
  }
};

export const getMatchSwipesService = (email) => {

  const matches = swipes.filter(
    (item) =>
      item.emailUser === email &&
      item.action === "Like" &&
      swipes.some(
        (other) =>
          other.emailUser === item.targetEmailUser &&
          other.targetEmailUser === item.emailUser &&
          other.action === "Like"
      )
  );

  console.log(matches);

  return matches;
};
