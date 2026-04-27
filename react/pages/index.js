// https://www.freecodecamp.org/news/best-practices-for-security-of-your-react-js-application/

// Checkout DOMPurify for security https://github.com/cure53/DOMPurify
// used with dangerouslySetInnerHTML()

// URL Validation:
// function validateURL(url) {
// 	const parsed = new URL(url)
// 	return ['https:', 'http:'].includes(parsed.protocol)
// }
// <a href={validateURL(url) ? url : ''}>This is a link!</a>


import { useRouter } from 'next/router'
import { useEffect } from "react";
import queryString from 'query-string';
import Layout from '../components/layout'
import { basePath } from '@/next.config';
import { useNavWithHash } from '@/components/utils/navigation';




const logo = {
  src: `${basePath}/cioos-atlantic_EN.svg`,
  alt: "CIOOS Atlantic - Hurricane Dashboard",
  href: "https://cioosatlantic.ca/"
}

export default function StormDashboard() {
  const router = useRouter()
  const qs = queryString.parseUrl(process.env.BASE_URL + router.asPath)
  const nav = useNavWithHash();


  
  return (
    
    

    
    <Layout 
      topNav={nav} 
      logo={logo} 
      querystring={qs}
    ></Layout>
    
     
  )
}
