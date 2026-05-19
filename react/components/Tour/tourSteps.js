

export function getTourSteps({ isActive, isHistorical, }) {
  const steps = [
    {
      selector: ".header_nav",
      content: "Visit the historical or active storm pages to explore data and features. You can also visit the about storms or user guide pages for more information."
    }
  ];


  if (isActive) {
    steps.push({
      selector: ".storm_search_result",
      content:
        "This panel shows active storms. Click on one to see the storm track and data."
    }, {
      selector: ".leaflet-container",
      content:
        "Click station markers to view environmental data."
    });
  }
   if (isHistorical) {
    steps.push({
      selector: ".historical_storm_search_result",
      content:
        "This panel shows historical storms. Click on one to see the storm track and data."
    }, {
      selector: ".filters", 
      content:
        "Filter storms or draw on the map to refine your view."
    }, {
      selector: ".filter-submit-button", 
      content:
        "Click here to apply filters and update the storm list."
    });
  }

  steps.push(
   {   selector: ".leaflet-control-layers",
      content: "Use the layer control to toggle different map layers."
    },
    {
      selector: ".leaflet-control-zoom",
      content: "Use zoom controls to explore."
    },
    {
      selector: ".body",
      content: "Have fun exploring this tool!"
    }
  );

  return steps;
}