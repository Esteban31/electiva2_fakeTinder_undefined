import jwt from 'jsonwebtoken';
import { generateToken, login } from '../../application/controllers/auth.controller.js';
import * as userService from '../../domain/services/users/user.service.js';

// Mock de process.env
process.env.JWT_KEY = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '3600';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked_jwt_token')
}));

describe('auth.controller', () => {

  describe('generateToken', () => {

    it('debería retornar 401 si las credenciales son inválidas', () => {
      const req = { body: { user: 'wrong', apikey: 'wrong_key' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      generateToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('debería retornar un token si las credenciales son válidas', () => {
      const req = { body: { user: { email: 'admin' }, apikey: 'test_secret_key' } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      generateToken(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        token: 'mocked_jwt_token',
        expiresIn: '3600'
      });
    });

  });

  describe('login', () => {

    it('debería retornar datos y token si el usuario es válido', async () => {
      const mockUser = {
        _id: '123',
        fullName: 'Test User',
        email: 'test@example.com',
        birthDate: '1990-01-01',
        isNewUser: false,
        profilePicture: 'pic.jpg'
      };

      jest.spyOn(userService, 'loginService').mockResolvedValue([mockUser]);

      const req = { body: { email: 'test@example.com', password: '1234' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await login(req, res);

      expect(userService.loginService).toHaveBeenCalledWith(req.body);
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
        id: '123',
        fullName: 'Test User',
        email: 'test@example.com',
        access_token: 'mocked_jwt_token'
      }));
    });

    it('debería retornar 401 si no hay usuario válido', async () => {
      jest.spyOn(userService, 'loginService').mockResolvedValue([{}]);

      const req = { body: { email: 'wrong@example.com', password: '1234' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
    });

    it('debería retornar 500 si ocurre un error', async () => {
      jest.spyOn(userService, 'loginService').mockRejectedValue(new Error('DB error'));

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'DB error' });
    });

  });

});
