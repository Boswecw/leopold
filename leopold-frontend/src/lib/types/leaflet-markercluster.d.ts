// src/lib/types/leaflet-markercluster.d.ts
declare module 'leaflet.markercluster' {
    import * as L from 'leaflet';
  
    interface MarkerClusterGroupOptions {
      showCoverageOnHover?: boolean;
      zoomToBoundsOnClick?: boolean;
      spiderfyOnMaxZoom?: boolean;
      removeOutsideVisibleBounds?: boolean;
      animate?: boolean;
      animateAddingMarkers?: boolean;
      disableClusteringAtZoom?: number;
      maxClusterRadius?: number | ((zoom: number) => number);
      polygonOptions?: L.PolylineOptions;
      singleMarkerMode?: boolean;
      spiderLegPolylineOptions?: L.PolylineOptions;
      spiderfyDistanceMultiplier?: number;
      iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
      chunkedLoading?: boolean;
    }
  
    interface MarkerCluster extends L.Marker {
      getChildCount(): number;
      getAllChildMarkers(): L.Marker[];
      getBounds(): L.LatLngBounds;
    }
  
    class MarkerClusterGroup extends L.FeatureGroup {
      constructor(options?: MarkerClusterGroupOptions);
      addLayer(layer: L.Layer): this;
      removeLayer(layer: L.Layer): this;
      clearLayers(): this;
      hasLayer(layer: L.Layer): boolean;
      refreshClusters(layers?: L.Layer[]): this;
      getVisibleParent(marker: L.Marker): L.Marker | MarkerCluster;
    }
  
    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  
    namespace L {
      export { MarkerClusterGroup, markerClusterGroup };
    }
  }