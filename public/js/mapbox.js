export const displayMaps = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicmljaGNvZGUiLCJhIjoiY2tndzR2NXkzMDZzZzJ5cjFvNzUzanJscSJ9.7SlYFosXiBSTcJnD4Eye6g';
  
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/richcode/ckgw4zrfu0v4819o6tpgz7v34',
    zoom: 10,
    scrollZoom: false
    // center: [-118.660343, 34.241828],
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach(loc => {
    // create Marker
    const el = document.createElement("div");
    el.className = "marker";
    
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom"
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
      
      // Add Popup
    new mapboxgl.Popup({
      offset: 25
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}<p>`)
      .addTo(map);

    // Extend the map Bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    }
  });
}

