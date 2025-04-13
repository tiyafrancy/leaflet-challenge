// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });

// Create the map object with center and zoom options.
let myMap = L.map("map", {
  center: [37.1, -95.7],
  zoom: 4
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(myMap);

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let earthquakeLayer = L.layerGroup();
let tectonicLayer = L.layerGroup();

let baseMaps = {
  "Basemap": basemap,
  "Street": street
};

let overlays = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicLayer
};
// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      color: "white",
      fillColor: getColor(feature.geometry.coordinates[2]), 
      fillOpacity: 0.5,
      weight: 1.5,
      radius: getRadius(feature.properties.mag)
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "red";
    else if (depth > 70) return "orange";
    else if (depth > 50) return "yellow";
    else if (depth > 30) return "green";
    else if ( depth > 10) return "purple";
    else return "black"
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 4;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    const depthIntervals = [0, 10, 30, 50, 70, 90];
    const colors = ["black", "purple", "green", "yellow", "orange", "red"];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthIntervals.length; i++){
      div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' + depthIntervals[i] + (depthIntervals[i + 1] ? '&ndash;' + depthIntervals[i + 1] + '<br>' : '<br>');
    }
    return div;
  };

  // Finally, add the legend to the map.
legend.addTo(myMap);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    function plateStyle() {
      return {
        color: 'blue',
        weight: 2
      };
    }


    // Then add the tectonic_plates layer to the map.
    L.geoJson(plate_data, {
      style: plateStyle
    }).addTo(myMap);
  });
});
