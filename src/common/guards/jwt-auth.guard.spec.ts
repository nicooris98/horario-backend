import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

const mockCanActivate = jest.fn();

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(
    () =>
      class MockPassportGuard {
        canActivate = mockCanActivate;
      },
  ),
}));

const mockContext = (): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({}) }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  it('se construye sobre la estrategia passport "jwt"', () => {
    expect(AuthGuard).toHaveBeenCalledWith('jwt');
  });

  it('delega canActivate en el guard de passport', () => {
    mockCanActivate.mockReturnValue(true);
    const guard = new JwtAuthGuard();

    expect(guard.canActivate(mockContext())).toBe(true);
    expect(mockCanActivate).toHaveBeenCalled();
  });

  it('propaga el rechazo del guard de passport', () => {
    mockCanActivate.mockImplementation(() => {
      throw new Error('Unauthorized');
    });
    const guard = new JwtAuthGuard();

    expect(() => guard.canActivate(mockContext())).toThrow('Unauthorized');
  });
});
