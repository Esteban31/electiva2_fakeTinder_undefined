import { createUserService, getUsersService } from "../services/users/index.js";

export const createUser = (req, res) => {
  try {
    createUserService(req.body);
    return res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};


export const getAvailableUsers = (req, res) => {
  const users = getUsersService(req.headers.currentuser)

  res.status(200).send(users)
};
