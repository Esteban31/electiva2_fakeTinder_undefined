import {swipeActionService} from "../../domain/services/swipes/swipe.service.js"

export const swipeAction = async(req, res) => {

    const resp = await swipeActionService(req.body);
    return res.status(resp.code).send(resp.info);
}