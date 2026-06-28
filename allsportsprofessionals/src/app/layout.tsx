import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AllSportsProfessionals | Premier Sports Academy in Thane",
  description:
    "AllSportsProfessionals is Thane's premier sports academy offering world-class coaching in Badminton, Swimming, Basketball & Martial Arts. Founded by National Champion Rahul Joshi. Located at One Indiabulls, Thane.",
  keywords: [
    "sports academy thane",
    "badminton coaching thane",
    "swimming classes thane",
    "basketball training thane",
    "martial arts thane",
    "AllSportsProfessionals",
    "Rahul Joshi badminton",
    "national champion coach",
    "sports training one indiabulls",
    "best sports academy mumbai",
    "professional sports coaching",
    "kids sports classes thane",
  ],
  authors: [{ name: "AllSportsProfessionals" }],
  creator: "AllSportsProfessionals",
  publisher: "AllSportsProfessionals",
  metadataBase: new URL("https://allsportsprofessionals.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AllSportsProfessionals | Premier Sports Academy in Thane",
    description:
      "World-class coaching in Badminton, Swimming, Basketball & Martial Arts. Founded by National Champion Rahul Joshi.",
    url: "https://allsportsprofessionals.com",
    siteName: "AllSportsProfessionals",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AllSportsProfessionals - Premier Sports Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AllSportsProfessionals | Premier Sports Academy in Thane",
    description:
      "World-class coaching in Badminton, Swimming, Basketball & Martial Arts by National Champion Rahul Joshi.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "AllSportsProfessionals",
  description:
    "Premier sports academy offering world-class coaching in Badminton, Swimming, Basketball & Martial Arts.",
  url: "https://allsportsprofessionals.com",
  telephone: "+91-XXXXXXXXXX",
  address: {
    "@type": "PostalAddress",
    streetAddress: "One Indiabulls Centre",
    addressLocality: "Thane",
    addressRegion: "Maharashtra",
    postalCode: "400601",
    addressCountry: "IN",
  },
  founder: {
    "@type": "Person",
    name: "Rahul Joshi",
    description: "National Level Badminton Champion",
  },
  sport: ["Badminton", "Swimming", "Basketball", "Martial Arts"],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "06:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "07:00",
      closes: "18:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0f" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
