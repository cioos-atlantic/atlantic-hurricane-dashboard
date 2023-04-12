// https://www.freecodecamp.org/news/best-practices-for-security-of-your-react-js-application/

// Checkout DOMPurify for security https://github.com/cure53/DOMPurify
// used with dangerouslySetInnerHTML()

// URL Validation:
// function validateURL(url) {
// 	const parsed = new URL(url)
// 	return ['https:', 'http:'].includes(parsed.protocol)
// }
// <a href={validateURL(url) ? url : ''}>This is a link!</a>

import React from "react";
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import StormDetails from "@/lib/storms"
import dynamic from "next/dynamic";
import Drawer from '../components/drawer'

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
  const the_props = props === undefined ? props : {}

  return (
    <Layout topNav={top_nav} logo={logo}>
      <Drawer element_id="left-side" classes="left">
        <div className="">

        </div>
      </Drawer>
    </Layout>
  )
}
