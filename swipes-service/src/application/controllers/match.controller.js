import { getMatchByUderIdService, addMessageService } from "../../domain/services/matchs/match.service.js";

export const getMatchByUderId = async(req, res) => {

    const resp = await getMatchByUderIdService(req.params.userId);
    return res.status(resp.code).send(resp.info);
}


export const addMessage = async(req, res) =>{
    const resp = await addMessageService(req.body);
    return res.status(resp.code).send(resp.info);
}