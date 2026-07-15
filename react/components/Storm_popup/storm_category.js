import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import Popup from "./storm_more_info_popoup";
import { storm_cat } from "@/lib/storm_cat";

/**
 * The StormCategory function displays information about a storm category, with an option to show more
 * details in a popup.
 * @returns The `StormCategory` component is being returned. It displays information about a storm
 * category based on the `STORMFORCE` prop passed to it. The component includes a paragraph showing the
 * storm category with an info circle icon that, when clicked, opens a popup displaying more
 * information about the storm category. The popup includes the storm category title, information, and
 * a link for more information on storm categories.
 */
export default function StormCategory({ STORMCAT }) {
    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => setShowPopup(!showPopup);

    const stormCategory = String(STORMCAT);
    const hasStormForce = Boolean(STORMCAT);
    const stormCategoryInfo = hasStormForce
        ? storm_cat[stormCategory]?.info
        : "There is currently no information on the storm category.";
    const stormCategoryLink = hasStormForce
        ? storm_cat[stormCategory]?.more_info_link
        : "https://wmo.int/content/classification-of-tropical-cyclones";
    const stormCategoryTitle = hasStormForce
        ? storm_cat[stormCategory]?.name?.en
        : "Storm Category: No Current Information";

    return (
        <>
            <div>
                <strong>Storm Category:</strong> {stormCategoryTitle || "NO DATA"}{" "}
                <FaInfoCircle
                    style={{ cursor: "pointer", marginLeft: "5px" }}
                    onClick={togglePopup}
                />
            </div>
            {showPopup && (
                <Popup title={stormCategoryTitle} onClose={togglePopup}>
                    <p>{stormCategoryInfo}</p>
                    <p>
                        Please visit{" "}
                        <a href={stormCategoryLink} target="_blank" rel="noopener noreferrer">
                            here
                        </a>{" "}
                        for information on storm categories.
                    </p>
                </Popup>
            )}
        </>
    );
}


/* TODO - Improvements
Dynamically change text based what the range selected by the user is using the useState of the slider.

" Range selected is between {min} and {max}" 
{Min} is {blah blah blah} while {max} is {blah blah blah}"
For more information, visit "blah"*/ 