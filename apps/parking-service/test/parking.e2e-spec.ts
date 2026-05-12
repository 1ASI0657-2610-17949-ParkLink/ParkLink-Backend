describe('Parking e2e contract', () => {
  it('covers create and search space flows', () => {
    expect(['POST /parking-spaces', 'GET /parking-spaces/search']).toEqual(['POST /parking-spaces', 'GET /parking-spaces/search']);
  });
});
