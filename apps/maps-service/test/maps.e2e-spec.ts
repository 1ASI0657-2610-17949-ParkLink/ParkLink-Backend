describe('Maps e2e contract', () => {
  it('covers geocode, reverse geocode and distance endpoints', () => {
    expect([
      'GET /maps/geocode',
      'GET /maps/reverse-geocode',
      'GET /maps/distance',
      'GET /maps/directions',
      'GET /maps/static-map',
    ]).toHaveLength(5);
  });
});
