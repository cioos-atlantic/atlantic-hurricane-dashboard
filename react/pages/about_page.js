import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { siteTitle } from '@/components/layout';
import aboutStyles from '../styles/About.module.css';
import Image from "next/image";
import { pastAtlStorms } from '@/data/pastStormsDetails';
import parse from 'html-react-parser';
import { faq } from '@/data/faq';
import { basePath } from "@/next.config";



/**
* The About component is responsible for rendering the About page of the Atlantic Hurricane Dashboard.
* It includes sections for extreme storms and hurricanes, past Atlantic Canada storms, and how to find more information.
*/

export default function About(){

  const router = useRouter();
  

  return(
    <div className={aboutStyles.container}>
     
      <main className={aboutStyles.mainContent}>
        <section className={aboutStyles.aboutSection}>
          <h1>Table of Content</h1>
            <ol >
              <li >
                <a href="#section1" aria-label="Go to Extreme Storms and Hurricanes section"> Extreme Storms and Hurricanes</a>
                <ul>
                  {faq.map((question, index) => (
                    <li key={`${question.title}-toc`}>
                      <a href={`#section1.${index}`}>{question.title}</a>
                    </li>
                  ))}
                </ul>

              </li>
            
              <li >
                <a href="#section2" aria-label="Go to Some Past Atlantic Canada Storms section">Some Past Atlantic Canada Storms</a>
                <ul>
                  {pastAtlStorms.map((storm, index) => (
                      <li key={`${storm.title}-toc`}>
                        <a href={`#section2.${index}`}>{storm.title}</a>
                      </li>
                    ))}
                </ul>
              </li>
              <li >
                <a href="#section3" aria-label="Go to How to Find more Information section">How to Find more Information</a>
                </li>
              
            </ol>

            <br />
            <br />

            

              <h2 id="section1">Extreme Storms and Hurricanes</h2>
              <div>
                {faq.map((question, index) => (
                  <div key={`${question.title}-content`}>
                    <h3 className={aboutStyles.subheading} id={`section1.${index}`}>
                      {question.title}
                    </h3>
                    <div className={aboutStyles.lightText}>{parse(question.details)}</div>
                    <br />
                  </div>
                ))}
              </div>
                    
              <br />
              <br />
              <h2  id="section2">Some Past Atlantic Canada Storms</h2>
            
              <p>
              Learn more about each storm and go to that specific past time frame and see data from that storm that exists within our application. 
              </p>
              <div>
                {pastAtlStorms.map((storm, index) => (
                  <div key={`${storm.title}-content`}>
                    <h3 className={aboutStyles.subheading} id={`section2.${index}`}
                    aria-label={`Learn more about the storm: ${storm.title}`}
                    role="button"
                    tabIndex="0"
                    onClick={() =>{console.log(`${storm.title} clicked`)
                                    handleStormNameClick(storm.name, storm.year, router)}}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStormNameClick(storm.name, storm.year, router);
                      }
                      }}> 
                        {storm.title}

                    </h3>
                    <div className={aboutStyles.lightText}>{parse(storm.details)}</div>
                    <br></br>
                    <figure className={aboutStyles.imageContainer}>
                      <Image
                        src={storm.img}
                        alt={storm.imgAlt}
                        className={aboutStyles.aboutPageImg}
                        width={350}
                        height={315}
                      />
                      <figcaption className={aboutStyles.imageCaption}>{parse(storm.imgCaption)}</figcaption>
                    </figure>
                  </div>
                ))}

              </div>

              <br />
              <br />
              <h2 id="section3">How to Find more Information</h2>
              <ul>
                <li >
                  <a href= "https://en.wikipedia.org/wiki/List_of_hurricanes_in_Canada " target="_blank" rel="noopener noreferrer" aria-label="Learn about hurricanes in Canada on Wikipedia">
                    Hurricanes in Canada 
                  </a>
                </li>
                <li >
                  <a href= "https://www.nspower.ca/about-us/articles/details/articles/2022/11/29/you-asked-we-answer-extreme-weather-and-our-power-grid" target="_blank" rel="noopener noreferrer" aria-label="Learn more about extreme weather and power grids on Nova Scotia Power Blog">
                    Nova Scotia Power Blog 
                  </a>
                </li>
              </ul>

          
        </section>
      </main>
    </div>
  )
}


/**
 * Handles the click event on a past Atlantic Canada storm's title.
 * It constructs a URL with the storm's name and year, and navigates to that URL using the provided router.
 
 */

export function handleStormNameClick(stormName, stormYear, router){
  const url = `/?page=historical&name=${stormName}&season=${stormYear}`;
  console.log(url)
  router.push(url);
  
  
}