import {swipeActionService} from "../services/swipes/index.js"

export const action = (req, res) => {
    swipeActionService(req.body)
}