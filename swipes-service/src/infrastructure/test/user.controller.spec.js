import {
  createUser,
  getUserById,
  updateUser,
  updateToopics,
  getUsers
} from '../../application/controllers/user.controller.js';

import * as userService from '../../domain/services/users/user.service.js';

describe('user.controller', () => {
  // CREATE USER
  describe('createUser', () => {
    it('debería retornar 201 si el usuario se crea correctamente', async () => {
      jest.spyOn(userService, 'createUserService').mockResolvedValue();

      const req = { body: { email: 'test@example.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ message: 'User created successfully.' });
    });

    it('debería retornar 500 si el email ya está registrado', async () => {
      jest.spyOn(userService, 'createUserService').mockRejectedValue(new Error('email is already registered'));

      const req = { body: { email: 'duplicate@example.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'email is already registered' });
    });

    it('debería retornar 500 por cualquier otro error', async () => {
      jest.spyOn(userService, 'createUserService').mockRejectedValue(new Error('otro error'));

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Error interno del servidor.' });
    });
  });

  // GET USER BY ID
  describe('getUserById', () => {
    it('debería retornar el usuario con el status correcto', async () => {
      const mockResp = { code: 200, info: { name: 'Juan' } };
      jest.spyOn(userService, 'getUserByIdService').mockResolvedValue(mockResp);

      const req = { params: { id: '123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await getUserById(req, res);

      expect(userService.getUserByIdService).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ name: 'Juan' });
    });
  });

  // UPDATE USER
  describe('updateUser', () => {
    it('debería retornar la respuesta del servicio', async () => {
      const mockResp = { code: 200, info: { updated: true } };
      jest.spyOn(userService, 'updateUserService').mockResolvedValue(mockResp);

      const req = { body: { name: 'Nuevo nombre' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await updateUser(req, res);

      expect(userService.updateUserService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ updated: true });
    });
  });

  // UPDATE TOOPICS
  describe('updateToopics', () => {
    it('debería retornar la respuesta del servicio', async () => {
      const mockResp = { code: 200, info: { updated: true } };
      jest.spyOn(userService, 'updateToopicsService').mockResolvedValue(mockResp);

      const req = { body: { topics: ['Node.js', 'NestJS'] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await updateToopics(req, res);

      expect(userService.updateToopicsService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ updated: true });
    });
  });

  // GET USERS (FEED)
  describe('getUsers', () => {
    it('debería retornar usuarios diferentes al actual', async () => {
      const mockResp = { code: 200, info: [{ id: '456', name: 'Otro usuario' }] };
      jest.spyOn(userService, 'getFeedUserService').mockResolvedValue(mockResp);

      const req = { headers: { 'current-user': '123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await getUsers(req, res);

      expect(userService.getFeedUserService).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([{ id: '456', name: 'Otro usuario' }]);
    });
  });

});
