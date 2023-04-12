import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import HeaderNav from './header_nav'
import FooterNav from './footer_nav'

import dynamic from "next/dynamic";


export const siteTitle = 'Atlantic Hurricane Dashboard'

export default function Layout({ children, home, topNav, logo }) {
  const MapWithNoSSR = dynamic(() => import("../components/map"), {
    ssr: false
  });

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content=""
        />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <header className={styles.header}>
        <a href={logo.href}><Image src={logo.src} width={200} height={100} className='logo' /></a>
        {home ? (
          <>
            {/* Home Page Header Content */}
          </>
        ) : (
          <>
            {/* Other Page Header Content */}
          </>
        )}
        <HeaderNav navItems={topNav}></HeaderNav>
      </header>
      <main>
        {children}
        <MapWithNoSSR />
      </main>
      <footer>
        <FooterNav></FooterNav>
      </footer>
    </div>
  )
}
