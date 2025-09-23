import { getMatchByUderId, addMessage } from '../../application/controllers/match.controller.js';
import * as matchService from "../../domain/services/matchs/match.service.js";

describe('match.controller', () => {
  describe('getMatchByUderId', () => {
    it('debería retornar la respuesta del servicio con el status correcto', async () => {
      // Mock del servicio
      const mockResponse = { code: 200, info: { matches: ['match1', 'match2'] } };
      jest.spyOn(matchService, 'getMatchByUderIdService').mockResolvedValue(mockResponse);

      // Mocks de req y res
      const req = { params: { userId: '123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await getMatchByUderId(req, res);

      expect(matchService.getMatchByUderIdService).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockResponse.info);
    });
  });

  describe('addMessage', () => {
    it('debería retornar la respuesta del servicio con el status correcto', async () => {
      const mockResponse = { code: 201, info: { message: 'Mensaje agregado' } };
      jest.spyOn(matchService, 'addMessageService').mockResolvedValue(mockResponse);

      const req = { body: { text: 'Hola', userId: '123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await addMessage(req, res);

      expect(matchService.addMessageService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockResponse.info);
    });
  });
});
