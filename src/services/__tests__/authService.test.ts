import MockAdapter from 'axios-mock-adapter';
import api from '../../utils/api';
import { login, register } from '../authService';

const mock = new MockAdapter(api);

describe('authService', () => {
  afterEach(() => {
    mock.reset(); // Reset mocks after each test
  });

  it('should login a user successfully', async () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { id: 1, email: 'test@example.com', roles: ['User'] },
    };
    mock.onPost('/auth/login').reply(200, mockResponse);

    const credentials = { email: 'test@example.com', password: 'password123' };
    const result = await login(credentials);

    expect(result).toEqual(mockResponse);
  });

  it('should register a user successfully', async () => {
    const mockResponse = {
      token: 'fake-jwt-token-new-user',
      user: { id: 2, email: 'new@example.com', roles: ['User'] },
    };
    mock.onPost('/auth/register').reply(200, mockResponse);

    const userData = { 
      email: 'new@example.com', 
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      nisNumber: 'NIS123456',
      phone: '0801234567'
    };
    const result = await register(userData);

    expect(result).toEqual(mockResponse);
  });

  it('should handle login error', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

    const credentials = { email: 'test@example.com', password: 'wrongpassword' };
    await expect(login(credentials)).rejects.toThrow();
  });

  it('should handle registration error', async () => {
    mock.onPost('/auth/register').reply(400, { message: 'User already exists' });

    const userData = { 
      email: 'existing@example.com', 
      password: 'password123',
      firstName: 'Existing',
      lastName: 'User',
      nisNumber: 'NIS654321',
      phone: '0809876543'
    };
    await expect(register(userData)).rejects.toThrow();
  });
});
