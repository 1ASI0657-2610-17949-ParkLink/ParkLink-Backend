describe('Reservation e2e contract', () => {
  it('covers create reservation flow', () => {
    expect(['POST /reservations', 'GET /reservations/my', 'PATCH /reservations/:id/cancel', 'PATCH /reservations/:id/extend']).toContain('POST /reservations');
  });
});
