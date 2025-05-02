import {swipeActionService, getMatchSwipesService} from "../../domain/services/swipes/swipe.service.js"

export const swipeAction = async(req, res) => {

    const resp = await swipeActionService(req.body);
    return res.status(resp.code).send(resp.info);
}


export const getMatchedSwipes = (req, res) => {

    const getMatchSwipes = getMatchSwipesService(req.params.email)

   return res.status(200).send(getMatchSwipes)
}