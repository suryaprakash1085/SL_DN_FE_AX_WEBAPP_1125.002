import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    Image as PDFImage,
    pdf,
  } from "@react-pdf/renderer";
import numberToWords from 'number-to-words';

const PDFGenerator = async ({ estimateItems, customer, appointmentId, km, grandTotal, vehicleId }) => {
  const amountInWords = (amount) => {
    const wholeNumber = Math.round(amount);
    return (
      numberToWords.toWords(wholeNumber).charAt(0).toUpperCase() +
      numberToWords.toWords(wholeNumber).slice(1)
    );
  };

  const itemsPerPage = 25; // Set the number of items per page
  const totalSpares = estimateItems.reduce(
    (acc, item) => acc + item.spares.length,
    0
  ); // Calculate total spares
  const totalPages = Math.ceil(totalSpares / itemsPerPage); // Calculate total pages

  const MyDocument = () => (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page
          key={pageIndex}
          size="A4"
          style={{
            padding: 20,
            fontSize: 10,
            fontFamily: "Times-Roman",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "100vh",
          }}
        >
          {/* Watermark */}
          <PDFImage
            src="/icons/Arg_s7Cars Logo.png"
            style={{
              height: 300,
              width: 450,
              position: "absolute",
              top: "30%",
              left: "10%",
              opacity: 0.1,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          {/* Header Section */}
          <View style={{ textAlign: "center", marginBottom: 10 }} fixed>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 10,
                borderBottom: "2px solid #000",
              }}
            >
              <PDFImage
                src="/icons/pdf_head.png"
                style={{ height: 75, width: 75 }}
              />
              <PDFImage
                src="/icons/Arg_s7Cars Logo.png"
                style={{ height: 100, width: 150 }}
              />
              <View style={{ textAlign: "center", flexGrow: 1 }}>
                <PDFImage
                  src="/icons/ayyanar.png"
                  style={{ height: 30, width: 130, marginRight: 350 }}
                />
                <Text style={{ fontSize: 20, fontWeight: "bolder", marginLeft: 80 }}>
                  ARG's 7 Cars
                </Text>
                <Text style={{ fontWeight: "light", fontStyle: "italic", marginLeft: 80 }}>
                  Perfectus Immutatio
                </Text>
                <Text style={{ marginLeft: 80 }}>
                  No 366, Thiruthangal Road, Sivakasi - 626130
                </Text>
                <Text style={{ marginLeft: 80 }}>
                  Contact: 77080 03008, 72003 77707
                </Text>
                <Text style={{ marginLeft: 80 }}>
                  GSTIN: 33BGFPA9032E1ZY
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 16, textAlign: "center" }}>
              Estimate
            </Text>
          </View>
          {/* Patron and Vehicle Details Section */}
          <View style={{ border: "1px solid #000", padding: 10, marginBottom: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", alignContent: "space-between" }}>
              <View style={{ width: "60%" }}>
                <Text>
                  Patron: {customer.prefix} {customer.customer_name}
                </Text>
                <Text>
                  {customer.contact.address.street}, {customer.contact.address.city}
                </Text>
                <Text>
                  {customer.contact.phone}
                </Text>
              </View>
              <View style={{ flexDirection: "column" }}>
                <View style={{ flexDirection: "row" }}>
                  <Text>Estimate No :</Text>
                  <Text style={{ textAlign: "left" }}>{appointmentId}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text>Estimate Date :</Text>
                  <Text style={{ textAlign: "left" }}>
                    {new Date().toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text>Vehicle No :</Text>
                  <Text style={{ textAlign: "left" }}>{vehicleId}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text>Vehicle Kms :</Text>
                  <Text style={{ textAlign: "left" }}>{km}</Text>
                </View>
              </View>
            </View>
            {customer.gst_number && (
              <View style={{ padding: 1, width: "30%", marginBottom: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Text>GSTIN: {customer.gst_number || "N/A"}</Text>
              </View>
            )}
          </View>

          {/* Items Table Section */}
          <View style={{ border: "1px solid #000", marginBottom: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", borderBottom: "1px solid #000", backgroundColor: "#f0f0f0", padding: 5 }}>
              <Text style={{ width: "10%", textAlign: "center" }}>S.No</Text>
              <Text style={{ width: "40%", textAlign: "left" }}>Particulars</Text>
              <Text style={{ width: "15%", textAlign: "center" }}>Qty</Text>
              <Text style={{ width: "15%", textAlign: "center" }}>Rate</Text>
              <Text style={{ width: "20%", textAlign: "center" }}>Amount</Text>
            </View>

            {/* Items Display */}
            {estimateItems.flatMap((item) => ({
              reportedIssue: item.reportedIssue,
              type: item.type,
              spares: item.spares,
              estimatedAmount: item.estimatedAmount
            }))
            .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
            .map((item, index) => (
              <View key={index} style={{ flexDirection: "column", padding: 1 }}>
                <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 5, color: "#444", paddingLeft: 10 }}>
                  Reported Issue: {item.reportedIssue}
                </Text>
                {item.type && (
                  <Text style={{ fontSize: 10, marginBottom: 1, color: "#666", paddingLeft: 10 }}>
                    Type: {item.type}
                  </Text>
                )}
                {item.spares.map((spare, spareIndex) => (
                  <View key={spareIndex} style={{ flexDirection: "row", padding: 3 }}>
                    <Text style={{ width: "10%", textAlign: "center" }}>
                      {pageIndex * itemsPerPage + index + spareIndex + 1}
                    </Text>
                    <Text style={{ width: "40%", textAlign: "left", paddingLeft: 5 }}>
                      {spare.spareList || "N/A"}
                    </Text>
                    <Text style={{ width: "15%", textAlign: "center" }}>
                      {spare.qty || "0"}
                    </Text>
                    <Text style={{ width: "15%", textAlign: "right", paddingRight: 10 }}>
                      ₹{parseFloat(spare.price || 0).toFixed(2)}
                    </Text>
                    <Text style={{ width: "20%", textAlign: "right", paddingRight: 10 }}>
                      ₹{(parseFloat(spare.qty || 0) * parseFloat(spare.price || 0)).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={{ borderBottom: "1px solid #000", marginVertical: 10 }} />
              </View>
            ))}
          </View>
          <View style={{ borderBottom: "1px solid #000", marginVertical: 5 }} />
          {/* Total Section */}
          {pageIndex === totalPages - 1 && (
            <>
              <View style={{ flexDirection: "row", borderTop: "1px solid #000", padding: 5 }}>
                <View style={{ width: "80%", fontWeight: "bold" }}>
                  <Text style={{ textAlign: "left", fontSize: 8 }}>
                    Amount in Words :{" "}
                  </Text>
                  <Text style={{ textAlign: "left", fontSize: 10 }}>
                    {"Rupees " + amountInWords(grandTotal) + " Only."}
                  </Text>
                </View>
                <Text style={{ width: "80%", textAlign: "right", fontWeight: "bold", fontSize: 16 }}>
                  Total :{" Rs."}
                  {grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={{ width: "100%" }}>
                <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                  Subscidary:
                </Text>
              </View>
              <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "50%", marginLeft: 0, position: "static" }}>
                  <PDFImage src="/icons/ARG_s 7Fitness2.jpg" style={{ height: 50, width: 250 }} />
                </View>
                <View style={{ width: "50%", marginLeft: 50, position: "static" }}>
                  <PDFImage src="/icons/ARG_s 7Fitness2.jpg" style={{ height: 50, width: 250 }} />
                </View>
              </View>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Page {pageIndex + 1} of {totalPages}
              </Text>
            </>
          )}
        </Page>
      ))}
    </Document>
  );

  return await pdf(<MyDocument />).toBlob();
};

export default PDFGenerator;