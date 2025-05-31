import { createUserService, getUserByIdService, updateUserService, updateToopicsService, getFeedUserService} from "../../domain/services/users/user.service.js"


export const createUser = async (req, res) => {
  try {
    await createUserService(req.body);
    return res.status(201).send({ message: "User created successfully." });

  } catch (error) {
    if (error.message.includes('email is already registered')) {
      return res.status(500).send({ message: error.message });
    }

    return res.status(500).send({ message: "Error interno del servidor." });
  }
};




// GET USER BY ID
export const getUserById = async (req,res)=>{

  const resp = await getUserByIdService(req.params.id);
  return res.status(resp.code).send(resp.info);
}




// UPDATE USER
export const updateUser = async(req,res)=>{

  const resp = await updateUserService(req.body)
  return res.status(resp.code).send(resp.info);
 
}


// UPDATE TOOPICS
export const updateToopics = async(req,res)=>{

  const resp = await updateToopicsService(req.body)
  return res.status(resp.code).send(resp.info);
 
}


// GET USERS DIFFERENT TO THE CURRENT USER
export const getUsers = async(req, res) => {
  const resp = await getFeedUserService(req.headers["current-user"], req.headers["location"])

  return res.status(resp.code).send(resp.info);
};
