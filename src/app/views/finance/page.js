"use client";
// React and Next imports
import React from "react";
import Link from "next/link";

// Component imports - Alphabetical
import BackButton from "@/components/backButton";
import Navbar from "@/components/navbar";

// Functional package imports - Alphabetical
import { motion } from "framer-motion";

// UI package imports - Alphabetical
import { Box, Card } from "@mui/material";

// Define data constants
const allTiles = [
  {
    name: "Customers",
    img: "/icons/customerPayment.png",
    route: "/views/finance/customerPayment",
  },
  {
    name: "Supplier",
    img: "/icons/supp1.png",
    route: "/views/finance/vendorPayment",
  },
  {
    name: "Ledger Book",
    img: "/icons/expense.png",
    route: "/views/finance/ledgerBook",
  },
];

export default function Finance() {
  return (
    <div>
      <Navbar pageName="Finance" />
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          minHeight: "89vh",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "6px",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(5px)",
            zIndex: 0,
          },
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1,
          }}
        >
          {/* <BackButton /> */}
        </div>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
            width: "30%",
            maxWidth: "1200px",
            padding: "40px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {allTiles.map((tile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href={tile.route}
                passHref
                style={{ textDecoration: "none" }}
              >
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Card
                    sx={{
                      background: "rgba(12, 12, 12, 0.150)",
                      backdropFilter: "blur(50px)",
                      borderRadius: "15px",
                      padding: "20px",
                      height: "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "1",
                    }}
                  >
                    <Box
                      sx={{
                        width: "60px",
                        height: "60px",
                        marginBottom: "15px",
                      }}
                    >
                      <img
                        src={tile.img}
                        alt={tile.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          filter: "brightness(0) invert(1)",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        color: "white",
                        textAlign: "center",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      {tile.name}
                    </Box>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </Box>
      </Box>
    </div>
  );
}
