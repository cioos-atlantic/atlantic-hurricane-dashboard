import React from "react";
import userStyles from "../styles/UserGuide.module.css";

export default function UserGuide() {
  return (
   

    
      <div className={userStyles.container}>
        <main className={userStyles.mainContent}>
          <section className={userStyles.guideCard}>
            <h2>Ocean Storm Viewer - User Guide</h2>
            <p>
              Welcome to the <b>Ocean Storm Viewer (OSV)</b>!
              This application helps you track active and historical storms,
              explore interactive maps, and view detailed storm data in real time.
            </p>
        </section>

        <section className={userStyles.guideCard}>
          <h2> Map Controls</h2>
          <ul>
            <li><b>Zoom</b>:The zoom button is located at the top right of the map. Zoom and pan across regions</li>
            <li><b>Layers</b>: The layers panel is on the bottom right. Hover to reveal layers to turn layers on or off.</li>
            <li><b>Storm Markers</b>: Click storm markers for detailed information</li>
            <li><b>Zoom and Pan</b>: Zoom and pan across regions</li>
          </ul>
        </section>

        <section className={userStyles.guideCard}>
          <h2>How to Use</h2>
          <ol>
            <li>The home page is the active storm page</li>
            <li>Select Active or Historical storms</li>
            <li>Click the info icon on the topmost right side of the map for a guided tour</li>
            <li>Interact with storm  and station markers</li>
          </ol>
        </section>
        <section className={userStyles.guideCard}>
          <h2>Data Views</h2>
          <ul>
            <li><b>Active Storms:</b> Live storm tracking</li>
            <li><b>Historical Storms:</b> Past storm records</li>
          </ul>
        </section>

        <section className={userStyles.guideCard}>
          <h2>Active Storms Page</h2>
          <ol>
            <li>The left side bar lists current active storms.</li>
            <li>It includes information such as first and last reported times.</li>
            <li>By default, the map on this page shows current station data. You can turn that off in the layers panel.</li>
          </ol>
        </section>
        <section className={userStyles.guideCard}>
          <h2>Historical Storms Page</h2>
          <ol>
            <li>The left side bar lists storms from the past year.</li>
            <li>Clicking a storm from the list will display the storm track available station data on the map.</li>
            <li>Hover over the storm marker to see storm type, category, windspeed and time.</li>
            <li>Clicking on a storm or station marker will open a storm and or station dashboard with panels for more detailed information about that storm or station. Both dashboards can be viewed simultaneously.</li>
            <li>Currently, the tool allows filtering by storm name, category, location, and date range.</li>
            <li>The filter panel is located on the top center of the screen on desktop devices and on the bottom right of the screen on mobile devices.</li>
            <li>To filter storms, hit the submit button after selecting your criteria.</li>
            <li>To clear the criteria , click the (X) button.</li>

          </ol>
        </section>

        <section className={userStyles.guideCard}>
          <h2>Guided Tour</h2>
          <ul>
            <li>Click the info (ⓘ) button on the map</li>
            <li>Select “Take a Tour”</li>
            <li>Follow highlighted steps on screen</li>
          </ul>
        </section>

        

        <section className={userStyles.guideCard}>
          <h2>Need Help?</h2>
          <p>
            If something isn’t working, refresh the page or check your connection.
            Contact support if issues persist.
          </p>
        </section>

        </main>



      </div>
    
  );
}