import { Swipe } from "../../../infrastructure/databases/connection.js";


export const swipeActionService = async(data) => {

  const search =  await Swipe.findOne({targetUserId: data.targetUserId}).exec()


  if (!search?._id) {//Existe un like a este usuario
    
    const newSwipe = new Swipe({
      userId: data.userId,
      targetUserId: data.targetUserId,
      action: data.action,
    });

    await newSwipe.save();

    return {
      info: {
        message: "Swipe saved",
        data: []
      },
      code: 200,
    };

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
