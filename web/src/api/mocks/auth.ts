import type { AuthResponse } from '../../types';

const demoUser = {
  id: '1',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
};

export const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (email === 'demo@example.com' && password === 'password') {
    return {
      user: demoUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  throw new Error('Invalid email or password');
};

export const mockRegister = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (data.email === 'existing@example.com') {
    throw new Error('Email already exists');
  }

  return {
    user: {
      id: '1',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 900,
  };
};
