import { idSymbol } from '@ngx-dino/core';
import { Edge } from '@ngx-dino/network';
import { FeatureCollection, Geometry, Feature } from 'geojson';
import { pick } from 'lodash';

import { Cartesian2dProjection } from './cartesian-2d-projection';


export class EdgesGeojson implements FeatureCollection<Geometry> {
  type: 'FeatureCollection' = 'FeatureCollection';
  features: Feature<Geometry, { [name: string]: any; }>[];

  constructor(edges: Edge[], projection: Cartesian2dProjection) {
    this.features = edges.map(e => {
      const p1 = projection.toLngLat(...e.source);
      const p2 = projection.toLngLat(...e.target);
      return {
        id: e[idSymbol],
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[p1.lng, p1.lat], [p2.lng, p2.lat]]
        },
        properties: pick(e, ['stroke', 'strokeWidth', 'transparency', idSymbol])
      };
    });
  }
}
