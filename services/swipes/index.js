import { swipes } from "../../swipesData.js";

export const swipeActionService = (data) => {
  const search = swipes.find(
    (item) => item.targetEmailUser === data.targetEmailUser
  );

  console.log(search);

  if (search === undefined) {
    console.log("Lo creamos");
    swipes.push(data);
    return true;
  } else {
    console.log("No lo creamos");
    return false;
  }
};

export const getMatchSwipesService = (email) => {
  console.log(email);

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
