import { User } from "../../../infrastructure/databases/connection.js";

export const createUserService = async (user) => {
  try {
    const newUser = new User({
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      birthDate: user.birthDate,
      interesting: [],
      likes: [],
    });

    await newUser.save();
    return true;

  } catch (error) {
    if (error.code === 11000) {
      // Error por email duplicado
      throw new Error("The email is already registered.");
    }else{
      throw new Error("Error creating the user.");
    }

  }
};



export const getUsersService = (email) =>{
  // const search = users.filter(user => user.email !== email);
  // return search
}


export const loginService = async(user) =>{

  try {
    const search = await User.find({email:user.email, password: user.password}).exec();

    if (search[0].email) {
      return search;
    }

  } catch (error) {
    throw new Error("Error login.");
  }

  console.log(search)

}
