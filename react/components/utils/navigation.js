import { useState, useEffect } from 'react';
import { basePath } from '@/next.config';


const top_nav = [
  { name: "Home", href: basePath },
  { name: "Active Storms", href: basePath + "?storms=active" },
  { name: "Historical Storms", href: basePath + "?storms=historical" },
  { name: "About Hurricanes", href: basePath + "?storms=hurricanes" },
];



export function useNavWithHash() {
  const [nav, setNav] = useState(top_nav);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateNav = () => {
      const hash = window.location.hash || "";

      setNav(
        top_nav.map(item => ({
          ...item,
          href: hash ? item.href + hash : item.href
        }))
      );
    };

    updateNav(); // initial

    window.addEventListener("hashchange", updateNav);

    return () => window.removeEventListener("hashchange", updateNav);
  }, []);

  return nav;
}