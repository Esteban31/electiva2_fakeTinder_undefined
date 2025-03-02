import {swipeActionService, getMatchSwipesService} from "../services/swipes/index.js"

export const swipeAction = (req, res) => {
    if (swipeActionService(req.body)) {
        return res.status(201).send({ message: "Swiped" });
    }else{
        return res.status(200).send({ message: "User already liked" });
    }
}


export const getMatchedSwipes = (req, res) => {

    const getMatchSwipes = getMatchSwipesService(req.query.email)

   return res.status(200).send(getMatchSwipes)
}