// app/components/GA4.tsx
// ga4 = google analytics, 
//       kayak k8 = kubernetes
"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"
import { useEffect } from "react"

// Deklarasikan gtag pada window untuk TypeScript
declare global {
  interface Window {
    gtag: (
        command: 'config',
        targetId: string,
        config?: { page_path?: string }
    ) => void;
  }
}

export const pageview = (url: string) => {
  // Pastikan gtag ada di window sebelum memanggilnya
  if (typeof window.gtag === 'function') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

export default function GA4() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Gabungkan pathname dan search params untuk mendapatkan URL lengkap
    const url = pathname + searchParams.toString()
    pageview(url)
  }, [pathname, searchParams])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}