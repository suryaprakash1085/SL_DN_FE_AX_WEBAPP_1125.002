import {
    Document,
    Page,
    View,
    Text,
    Image as PDFImage,
    pdf,
} from "@react-pdf/renderer";

import toWords from "number-to-words";
import { space } from "postcss/lib/list";
import QRCode from "qrcode";

const generatePDFInvoice = async ({
    customer,
    estimateItems,
    appointmentId,
    vehicleId,
    km,
    grandTotal,
    totalTax,
    PdfHeaderImage,
    pdfFooterImage,
    pdfLogo,
    invoiceId,
    companyDetails,
    upi,
}) => {
    console.log('PDF Generation Data:', {
        customer,
        estimateItems,
        appointmentId,
        vehicleId,
        km,
        totalTax,
        PdfHeaderImage,
        pdfFooterImage,
        pdfLogo,
        invoiceId,
        companyDetails,
        upi,
    });

    const amountInWords = (amount) => {
        const wholeNumber = Math.round(amount);
        return toWords.toWords(wholeNumber).charAt(0).toUpperCase() + toWords.toWords(wholeNumber).slice(1);
    };

    const itemsPerPage = 250;
    const totalSpares = estimateItems.reduce(
        (acc, item) => acc + estimateItems.length, // item.spares.length,
        0
    );
    const totalPages = Math.ceil(totalSpares / itemsPerPage);

    const taxDetails = {
        value: grandTotal,
        cgst: totalTax / 2,
        sgst: totalTax / 2,
        totalTax: totalTax,
    };

    let upiDetails = {
        pa: upi,
        pn: companyDetails[0]?.company_name,
        tn: "ARG's 7 Cars" + " - " + appointmentId,
        am: grandTotal?.toFixed(2),
        cu: "INR",
    };
    let upiLink = `upi://pay?pa=${encodeURIComponent(
        upiDetails.pa
    )}&pn=${encodeURIComponent(upiDetails.pn)}&tn=${encodeURIComponent(
        upiDetails.tn
    )}&am=${encodeURIComponent(upiDetails.am)}&cu=${encodeURIComponent(
        upiDetails.cu
    )}`;

    const qrCodeDataUrl = await QRCode.toDataURL(upiLink);

    const InvoiceDocument = () => (
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
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/logo/${pdfLogo}`}
                                        style={{
                                            height: 200,
                                            width: 450,
                                            position:"absolute",
                                            top:"30%",
                                            left:"10%",
                                            opacity:0.1,
                                            zIndex:0,
                                            pointerEvents:"none"
                                        }}
                                    />

                    {/* Header Section */}
                    {/* <View style={{ textAlign: "center", marginBottom: 10 }} fixed>
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
                                <Text
                                    style={{
                                        fontSize: 20,
                                        fontWeight: "bolder",
                                        marginLeft: 80,
                                        fontFamily: "Helvetica-Bold",
                                    }}
                                >
                                    ARG's 7 Cars
                                </Text>
                                <Text
                                    style={{
                                        fontWeight: "light",
                                        fontStyle: "italic",
                                        marginLeft: 80,
                                    }}
                                >
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
                    </View> */}

                    <PDFImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/pdf_header/${PdfHeaderImage}`}
                        style={{
                            width: 580,
                            height: 95,
                        }}
                    />

                    <View>
                        <Text
                            style={{
                                fontWeight: "bold",
                                fontSize: 16,
                                textAlign: "center",
                            }}
                        >
                            Invoice
                        </Text>
                    </View>

                    {/* Patron and Vehicle Details */}
                    <View
    style={{
        borderWidth: 1,
        borderColor: "#000",
        padding: 10,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    }}
>
    {/* First Column - Customer Details */}
    <View style={{ width: "60%" }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Patron:</Text>
  <Text style={{ marginLeft: 28,fontFamily: 'Helvetica-Bold' }}>
    {customer.prefix} {customer.customer_name}
  </Text>
</View>


        <Text style={{ marginLeft: 63 }}>
            {customer.contact.address.street}, {customer.contact.address.city}
        </Text>
        <Text style={{ fontFamily: "Helvetica-Bold", marginLeft: 63 }}>
            {customer.contact.phone}
        </Text>
        {km && km > 0 ? (
            <View>
                <Text style={{fontFamily: "Helvetica-Bold"  }}>Next Service:{km + 10000} KM /{"  "}
                    {new Date(
                        new Date().setMonth(new Date().getMonth() + 6)
                    ).toLocaleDateString("en-GB")}</Text>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                   
                </Text>
            </View>

        ) : null}
    </View>

    {/* Second Column - Invoice Details */}
    <View style={{ width: "40%", alignItems: "flex-start" }}>
  {[
    { label: "Invoice No:", value: invoiceId },
    { label: "Invoice Date:", value: new Date().toLocaleDateString("en-GB") },
    { label: "Vehicle No:", value: vehicleId },
    ...(km > 0 ? [{ label: "Vehicle Kms:", value: km }] : [])
  ].map((item, index) => (
    <View key={index} style={{ flexDirection: "row", marginBottom: 2 }}>
      <Text style={{ width: 110, fontWeight: "bold" }}>
        {item.label}
      </Text>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>
        {item.value}
      </Text>
    </View>
  ))}
</View>

    {/* Third Column - (Optional content goes here) */}
   
</View>

                    {/* Items Table */}
                    <View
                        style={{ border: "1px solid #000", marginBottom: 10, flex: 1 }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                borderBottom: "1px solid #000",
                                backgroundColor: "#f0f0f0",
                                padding: 5,
                            }}
                        >
                            <Text style={{ width: "10%", textAlign: "left" }}>
                                S.No
                            </Text>
                            <Text style={{ width: "40%", textAlign: "left" }}>
                                Particulars
                            </Text>
                            <Text style={{ width: "10%", textAlign: "center" }}>Qty</Text>
                            <Text style={{ width: "10%", textAlign: "right" }}>
                                Rate
                            </Text>
                            <Text style={{ width: "10%", textAlign: "right" }}>
  {totalTax !== 0 ? "GST%" : ""}
</Text>
<Text style={{ width: "20%", textAlign: "right" }}>
  Amount
</Text>

                        </View>

                        {/* Render items for the current page */}
                        {estimateItems
                            .slice(
                                pageIndex * itemsPerPage,
                                (pageIndex + 1) * itemsPerPage
                            )
                            .map((item, index) => (
                                <View
                                    key={index}
                                    style={{ flexDirection: "row", padding: 1 }}
                                >
                                    <Text style={{ width: "10%", textAlign: "center" }}>
                                        {index + 1 + pageIndex * itemsPerPage}
                                    </Text>
                                    <Text
                                        style={{ width: "40%", textAlign: "left", fontFamily: "Helvetica-Bold" }}
                                    >{`${item.spareList || item.spares[0]?.spareList}  ${item.reportedIssue === "N/A" ? "" :'-'+ item.reportedIssue}`}</Text>
                                    <Text style={{ width: "10%", textAlign: "center" }}>
                                        {item.qty || item.spares[0]?.qty}
                                    </Text>
                                    <Text style={{ width: "10%", textAlign: "right" }}>
                                        {parseFloat(item.price || item.spares[0]?.price).toFixed(2)}
                                    </Text>
                                    {/* {customer.gst_number ? ( */}
                                    <Text style={{ width: "10%", textAlign: "right" }}>
  {totalTax !== 0 && (item.tax || item.spares?.[0]?.tax) > 0
    ? (item.tax || item.spares?.[0]?.tax) + '%'
    : ''}
</Text>



                                    {/* ) : null} */}
                                    <Text style={{ width: "20%", textAlign: "right" }}>
                                        {parseFloat(item.qty * item.price || item.spares[0]?.qty * item.spares[0]?.price).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                    </View>

                    {/* Only add the footer on the last page */}
                    {pageIndex === totalPages - 1 && (
                        <>
                            {/* Total Section */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    borderTop: "1px solid #000",
                                    padding: 2,
                                }}
                            >
                                <View style={{ width: "80%", fontWeight: "bold" }}>
                                    <Text style={{ textAlign: "left", fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                                        Amount in Words :{" "}
                                    </Text>
                                    <Text style={{ textAlign: "left", fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                                        {"Rupees " + amountInWords(grandTotal) + " Only."}
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        width: "80%",
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                        fontFamily: "Helvetica-Bold"
                                    }}
                                >
                                    Total :{" "}
                                    {"Rs." +
                                        (grandTotal - totalTax?.toFixed(2)).toLocaleString(
                                            undefined,
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                </Text>
                            </View>

                            {/* Tax Details Section - Only show if tax value is not 0 */}
                           

                            {/* Similarly, hide GST Total if tax is 0 */}
                            {totalTax !== 0 && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Text
                                        style={{
                                            width: "80%",
                                            textAlign: "right",
                                            fontWeight: "bold",
                                            fontSize: 12,
                                            fontFamily: "Helvetica-Bold"
                                        }}
                                    >
                                        GST Total: {"Rs." + totalTax?.toFixed(2)}
                                    </Text>
                                </View>
                            )}


{totalTax !== 0 && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Text
                                    style={{
                                        width: "80%",
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                        fontFamily: "Helvetica-Bold"
                                    }}
                                >
                                    Overall Total:{" "}
                                    {"Rs." +
                                        grandTotal.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                </Text>
                            </View>
)}
                            {/* Footer Section */}
                            <View
                                style={{
                                    borderTop: "1px solid #000",
                                    paddingTop: 10,
                                    backgroundColor: "#f0f0f0",
                                    padding: 10,
                                    marginTop: "auto",
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginBottom: 10,
                                    }}
                                >
                                    <View style={{ width: "50%" }}>
                                        <Text
                                            style={{
                                                fontWeight: "bold",
                                                marginBottom: 5,
                                                fontStyle: "underline",
                                            }}
                                        >
                                            Bank Details:
                                        </Text>
                                        <Text style={{ fontWeight: "bold" }}>
                                            ARG's 7 Cars & Sree Jaya Finserve
                                        </Text>
                                        <Text>{companyDetails[0].bank_name}</Text>
                                        <Text>Account No: {companyDetails[0].account_no}</Text>
                                        <Text>IFSC Code: {companyDetails[0].ifsc_code}</Text>
                                        <Text>GPay: {companyDetails[0].gpay_number}</Text>
                                    </View>
                                    {totalTax !== 0 && (
                <>
                  <View
                    style={{
                      width: "1px",
                      height: "100%",
                      backgroundColor: "#000",
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                  ></View>
                  <View
                    style={{
                      width: "45%",
                      border: "1px solid #000",
                      padding: 5,
                    }}
                  >
                    <Text
                      style={{ fontWeight: "bold", marginBottom: 5 }}
                    >
                      Tax Details:
                    </Text>
                    <Text>Value: {taxDetails.value.toFixed(2)}</Text>
                    <Text>CGST: {taxDetails.cgst.toFixed(2)}</Text>
                    <Text>SGST: {taxDetails.sgst.toFixed(2)}</Text>
                    <Text>
                      Total Tax: {taxDetails.totalTax?.toFixed(2)}
                    </Text>
                  </View>
                </>
              )}

                                    <View
                                        style={{
                                            width: "1px",
                                            height: "100%",
                                            backgroundColor: "#000",
                                            marginLeft: 10,
                                            marginRight: 10,
                                        }}
                                    ></View>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                        }}
                                    >
                                        <PDFImage
                                            src={qrCodeDataUrl}
                                            style={{ width: 70, height: 70 }}
                                        />
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginTop: 10,
                                    }}
                                >
                                    <View style={{ width: "60%", textAlign: "left" }}>
                                        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                                            Our Services:
                                        </Text>
                                        {/* <Text>
                  Multi Brand Car Service & Accessories, Bodyshop work
                  (Painting, Tinkering, Electrical & AC Repair)
                </Text>
                <Text style={{ marginBottom: 5 }}>
                  HDFC Bank & Kotak Mahindra Bank Car Loans Service,
                  Insurance Renewal & Claim Service
                </Text> */}
                                        <Text>{companyDetails[0].services}</Text>
                                    </View>
                                    <View
                                        style={{
                                            width: "50%",
                                            textAlign: "right",
                                            alignSelf: "flex-start",
                                        }}
                                    >
                                        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                                            For ARG's 7 Cars
                                        </Text>
                                        <Text style={{ marginBottom: 5, paddingTop: 50 }}>
                                            Authorized Signature
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: "auto",
                                }}
                            >
                                <View style={{ width: "100%" }}>
                                    <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                                        Subscidary:
                                    </Text>
                                </View>
                            </View> */}
                            <View
                                style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <View
                                    style={{
                                        width: "50%",
                                        marginLeft: 0,
                                        position: "static",
                                    }}
                                >
                                    {/* Footer Section */}
                                    {pageIndex === totalPages - 1 && (
                                        <PDFImage
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/pdf_footer/${pdfFooterImage}`}
                                            style={{
                                                width: 550,
                                                height: 100,
                                            }}
                                        />
                                    )}
                                </View>
                                <View
                                    style={{
                                        width: "50%",
                                        marginLeft: 50,
                                        position: "static",
                                    }}
                                >
                                   {/* <PDFImage
                                        src="/icons/ARG_s 7Fitness2.jpg"
                                        style={{ height: 50, width: 250 }}
                                    /> */}
                                </View>
                            </View>
                        </>
                    )}
                </Page>
            ))}
        </Document>
    );

    const pdfBlob = await pdf(<InvoiceDocument />).toBlob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    const Timestamp = new Date().getTime();
    link.download = `Invoice_JB_${appointmentId}_${Timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default generatePDFInvoice;
