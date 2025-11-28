"use client";
import localFont from "next/font/local";
import "./globals.css";
import { useEffect, useState } from "react";
import { metadata } from './metadata';
import Cookies from "js-cookie";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const [bgImage, setBgImage] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);

  // useEffect(() => {
  //   const storedImage = Cookies.get("companyBackground");
  //   if (storedImage) {
  //     setBgImage(storedImage);
  //   }
  // }, []);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ss`);
      const data = await response.json();
      const companyDetails = data.company_details && data.company_details[0];
      setCompanyDetails(companyDetails);
      // Check if company background is in local storage
      // const companyBackground = Cookies.get("companyBackground");

      // Cookies.set("companyBackground", companyDetails.background_image);

      setBgImage(companyDetails?.background_image);

    };

    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    document.title = metadata.title;
    // document.querySelector('link[rel="icon"]').href = metadata.favicon;
  }, []);

  return (
    <html lang="en">
      {/* pass the background to the global.css */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: "0%", backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL}/company/image/file/background/${bgImage})`, backgroundSize: 'cover' }}
      >
        {children}
      </body>
    </html>
  );
}
