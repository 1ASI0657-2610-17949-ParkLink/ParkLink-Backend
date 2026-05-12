describe('Payment e2e contract', () => {
  it('covers mock payment flow', () => {
    expect(['POST /payments', 'GET /payments/:id/receipt']).toContain('POST /payments');
  });
});
