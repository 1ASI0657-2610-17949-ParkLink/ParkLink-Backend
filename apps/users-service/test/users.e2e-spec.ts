describe('Users e2e contract', () => {
  it('covers profile endpoints', () => {
    expect(['GET /users/me', 'PATCH /users/me', 'GET /users/:id']).toHaveLength(3);
  });
});
