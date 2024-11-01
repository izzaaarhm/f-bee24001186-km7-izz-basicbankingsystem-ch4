const authJWT = require('../auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('authJWT Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('harus mengembalikan error jika token tidak ada', () => {
    authJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Akses ditolak, token tidak ada' });
    expect(next).not.toHaveBeenCalled();
  });

  test('harus mengembalikan error jika token tidak valid', () => {
    req.headers.authorization = 'Bearer invalidToken';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Token tidak valid'), null);
    });

    authJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token tidak valid' });
    expect(next).not.toHaveBeenCalled();
  });

  test('harus melanjutkan ke next() jika token valid', () => {
    const mockUser = { id: 1, email: 'user@example.com' };
    req.headers.authorization = 'Bearer validToken';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    authJWT(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET, expect.any(Function));
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
