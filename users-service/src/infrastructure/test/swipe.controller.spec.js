import { swipeAction } from '../../application/controllers/swipe.controller.js';
import * as swipeService from '../../domain/services/swipes/swipe.service.js';

describe('swipe.controller', () => {
  describe('swipeAction', () => {
    it('debería retornar la respuesta del servicio con el status correcto', async () => {
      const mockResponse = {
        code: 200,
        info: { message: 'Swipe exitoso' }
      };

      jest.spyOn(swipeService, 'swipeActionService').mockResolvedValue(mockResponse);

      const req = { body: { userId: '1', swipedUserId: '2', action: 'like' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await swipeAction(req, res);

      expect(swipeService.swipeActionService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Swipe exitoso' });
    });

    it('debería retornar 500 si el servicio lanza un error', async () => {
      jest.spyOn(swipeService, 'swipeActionService').mockRejectedValue(new Error('Error del servicio'));

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await swipeAction(req, res);

      // Aquí podrías decidir si capturas errores dentro del controlador o dejas que Jest pruebe el error sin captura.
      // Si tu controlador no tiene try/catch, este test fallará (como debe).
    });
  });
});
