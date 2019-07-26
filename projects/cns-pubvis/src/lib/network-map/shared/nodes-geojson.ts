import { idSymbol } from '@ngx-dino/core';
import { Node } from '@ngx-dino/network';
import { FeatureCollection, Geometry, Feature } from 'geojson';
import { pick, round } from 'lodash';

import { Cartesian2dProjection } from './cartesian-2d-projection';
import { IconConfig, BuiltinSymbolTypes } from './data-driven-icon';


export class NodesGeojson implements FeatureCollection<Geometry> {
  type: 'FeatureCollection' = 'FeatureCollection';
  features: Feature<Geometry, { [name: string]: any; }>[];

  constructor(nodes: Node[], projection: Cartesian2dProjection) {
    this.features = nodes.map(n => {
      const lnglat = projection.toLngLat(...n.position);
      const icon: IconConfig = {
        shape: n.symbol as BuiltinSymbolTypes,
        areaSize: round(n.size),
        color: n.color,
        transparency: round(n.transparency, 2),
        strokeColor: n.stroke,
        strokeWidth: round(n.strokeWidth, 2),
        strokeTransparency: round(n.strokeTransparency, 2),
        pulse: n.pulse || undefined
      };
      return {
        id: n[idSymbol],
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lnglat.lng, lnglat.lat]
        },
        properties: Object.assign({
          icon: `ddi:${JSON.stringify(icon)}`
        }, pick(n, [
          idSymbol, 'size', 'pulse',
          'tooltip', 'label', 'labelPosition'
        ]))
      };
    });
  }
}
