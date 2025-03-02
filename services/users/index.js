import { users } from "../../usersData.js";

export const createUserService = (user) => {
  const search = users.find((item) => item.email === user.email);


  if (search === undefined) {
    users.push(user);
    return true
  } else {
    throw new Error("This email address is already in use");
  }
};


export const getUsersService = (email) =>{
  const search = users.filter(user => user.email !== email);
  return search
}
