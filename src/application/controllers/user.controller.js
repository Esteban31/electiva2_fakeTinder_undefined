import { createUserService, getUsersService} from "../../domain/services/users/user.service.js"


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



export const getAvailableUsers = (req, res) => {
  const users = getUsersService(req.headers.currentuser)

  res.status(200).send(users)
};
