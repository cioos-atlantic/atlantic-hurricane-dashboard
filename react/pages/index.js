// https://www.freecodecamp.org/news/best-practices-for-security-of-your-react-js-application/

// Checkout DOMPurify for security https://github.com/cure53/DOMPurify
// used with dangerouslySetInnerHTML()

// URL Validation:
// function validateURL(url) {
// 	const parsed = new URL(url)
// 	return ['https:', 'http:'].includes(parsed.protocol)
// }
// <a href={validateURL(url) ? url : ''}>This is a link!</a>

import React, { useState } from "react";
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Drawer from '../components/drawer'
import StormSearch from "@/components/storm_search";

const top_nav = [
  { name: "Home", href: "/" },
  { name: "Active Storms", href: "/active" },
  { name: "Historical Storms", href: "/historical" },
  { name: "About Hurricanes", href: "/hurricanes" },
]

const logo = {
  src: "/cioos-atlantic_EN.svg",
  alt: "CIOOS Atlantic - Hurricane Dashboard",
  href: "https://cioosatlantic.ca/"
}


export default function StormDashboard(props) {

  return (
    <Layout topNav={top_nav} logo={logo}>
      <Drawer element_id="left-side" classes="left">
        <StormSearch />
        <hr />
        <div id="storm_details">

        </div>
        <div id="storm_timeline">

        </div>
      </Drawer>
    </Layout>
  )
}
