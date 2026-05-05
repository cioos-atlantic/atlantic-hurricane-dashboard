

export function getTourSteps({ isActive, isHistorical, hasStorms, hasStations }) {
  const steps = [
    {
      selector: ".header_nav",
      content: "Welcome to the Ocean Storm Viewer (OSV)."
    }
  ];


  if (isActive) {
    steps.push({
      selector: ".storm_search_result",
      content:
        "This panel shows active storms. Click on one to see the storm track and data."
    });
  }
   if (isHistorical) {
    steps.push({
      selector: ".historical_storm_search_result",
      content:
        "This panel shows historical storms. Click on one to see the storm track and data."
    });
  }

  if (hasStorms) {
    steps.push({
      selector: ".leaflet-container",
      content:
        "Hover storm markers to preview details. Click to explore."
    });
  }

  if (hasStations) {
    steps.push({
      selector: ".leaflet-container",
      content:
        "Click station markers to view environmental data."
    });
  }


  if (isHistorical) {
    steps.push({
      selector: ".filter-icons-list", 
      content:
        "Filter storms or draw on the map to refine your view."
    });
  }

  steps.push(
   
    {
      selector: ".leaflet-control-zoom",
      content: "Use zoom controls to explore."
    }
  );

  return steps;
}