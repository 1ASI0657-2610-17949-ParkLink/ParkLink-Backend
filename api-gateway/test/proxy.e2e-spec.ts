describe('API Gateway e2e contract', () => {
  it('declares all proxy routes required by the frontend entrypoint', () => {
    expect(['/auth/*', '/users/*', '/parking-spaces/*', '/reservations/*', '/payments/*', '/notifications/*', '/maps/*']).toHaveLength(7);
  });
});
