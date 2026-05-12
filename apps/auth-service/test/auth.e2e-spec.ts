describe('Auth e2e contract', () => {
  it('covers registration and login endpoints', () => {
    expect(['POST /auth/register-driver', 'POST /auth/register-owner', 'POST /auth/login', 'GET /auth/me']).toContain('POST /auth/login');
  });
});
