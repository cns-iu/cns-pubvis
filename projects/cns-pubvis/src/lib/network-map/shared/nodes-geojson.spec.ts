import { NodesGeojson } from './nodes-geojson';

describe('NodesGeojson', () => {
  it('should create an instance', () => {
    expect(new NodesGeojson([], null)).toBeTruthy();
  });
});
