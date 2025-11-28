import {
    Document,
    Page,
    View,
    Text,
    Image as PDFImage,
    pdf,
} from "@react-pdf/renderer";
import toWords from "number-to-words";

const generatePDF = async ({
    customer,
    estimateItems,
    appointmentId,
    vehicleId,
    km,
    grandTotal,
    PdfHeaderImage,
    pdfFooterImage, pdfLogo,

}) => {

    const amountInWords = (amount) => {
        const wholeNumber = Math.round(amount);
        return toWords.toWords(wholeNumber).charAt(0).toUpperCase() + toWords.toWords(wholeNumber).slice(1);
    };

    const itemsPerPage = 25;
    const totalSpares = estimateItems.reduce(
        (acc, item) => acc + item.spares.length,
        0
    );
    const totalPages = Math.ceil(totalSpares / itemsPerPage);

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
                    {/* <PDFImage
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
                    /> */}


                    <PDFImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/logo/${pdfLogo}`}
                        style={{
                            height: 300,
                            width: 450,
                            position: "absolute",
                            top: "30%",
                            left: "10%",
                            opacity: 0.1,
                            zIndex: 0,
                            pointerEvents: "none"
                        }}
                    />

                    {/* Header */}
                    <PDFImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/pdf_header/${PdfHeaderImage}`}
                        style={{
                            width: 580,
                            height: 95,
                        }}
                    />

                    {/* Main Content */}
                    <View style={{ textAlign: "center", marginBottom: 10 }} fixed>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Estimate</Text>
                    </View>

                    {/* Patron and Vehicle Details Section */}
                    <View
                        style={{
                            border: "1px solid #000",
                            padding: 10,
                            marginBottom: 10,
                        }}
                    >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ width: "60%" }}>
                                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                                    Patron: {customer.prefix} {customer.customer_name}
                                </Text>
                                <Text style={{ marginLeft: 35 }}>
                                    {customer.contact.address.street}, {customer.contact.address.city}
                                </Text>
                                <Text style={{ marginLeft: 35, fontFamily: "Helvetica-Bold" }}>{customer.contact.phone}</Text>
                            </View>

                            <View style={{ flexWrap: "wrap" }}>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Estimate No:</Text> {appointmentId}{" "}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Estimate Date:</Text> {new Date().toLocaleDateString()}{" "}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Vehicle No:</Text> {vehicleId}{" "}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Vehicle Kms:</Text> {km}
                                </Text>
                            </View>

                        </View>

                        {customer.gst_number && (
                            <Text>GSTIN: {customer.gst_number}</Text>
                        )}
                    </View>

                    {/* Items Table */}
                    <View
                        style={{
                            border: "1px solid #000",
                            marginBottom: 10,
                            flex: 1,
                        }}
                    >
                        {/* Table Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                borderBottom: "1px solid #000",
                                backgroundColor: "#f0f0f0",
                                padding: 5,
                            }}
                        >
                            <Text style={{ width: "10%", textAlign: "center" }}>S.No</Text>
                            <Text style={{ width: "40%", textAlign: "left" }}>Particulars</Text>
                            <Text style={{ width: "15%", textAlign: "center" }}>Qty</Text>
                            <Text style={{ width: "15%", textAlign: "right" }}>Rate</Text>
                            <Text style={{ width: "20%", textAlign: "right" }}>Amount</Text>
                        </View>

                        {/* Items Display */}
                        {estimateItems
                            .flatMap((item) => item.spares)
                            .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                            .map((spare, index) => (
                                <View key={index} style={{ flexDirection: "row", padding: 3 }}>
                                    <Text style={{ width: "10%", textAlign: "center" }}>
                                        {pageIndex * itemsPerPage + index + 1}
                                    </Text>
                                    <Text style={{ width: "40%", textAlign: "left", fontFamily: "Helvetica-Bold" }}>
                                        {spare.spareList || "N/A"}
                                    </Text>
                                    <Text style={{ width: "15%", textAlign: "center" }}>
                                        {spare.qty || "0"}
                                    </Text>
                                    <Text style={{ width: "15%", textAlign: "right" }}>
                                        {parseFloat(spare.price || 0).toFixed(2)}
                                    </Text>
                                    <Text style={{ width: "20%", textAlign: "right" }}>
                                        {(parseFloat(spare.qty || 0) * parseFloat(spare.price || 0)).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                    </View>

                    {/* Total Section */}
                    {pageIndex === totalPages - 1 && (
                        <View
                            style={{
                                borderTop: "1px solid #000",
                                padding: 5,
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <View style={{ width: "80%" }}>
                                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>Amount in Words:</Text>
                                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>{`Rupees ${amountInWords(grandTotal)} Only.`}</Text>
                            </View>
                            <Text style={{ width: "20%", textAlign: "right", fontWeight: "bold" }}>
                                Total: {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}

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

                    <Text style={{ textAlign: "center", marginTop: 10 }}>
                        Page {pageIndex + 1} of {totalPages}
                    </Text>
                </Page>
            ))}
        </Document>
    );

    const pdfBlob = await pdf(<MyDocument />).toBlob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    const Timestamp = new Date().getTime();
    link.download = `Estimate_${appointmentId}_${Timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const previewPDF = async ({
    customer,
    estimateItems,
    appointmentId,
    vehicleId,
    km,
    grandTotal,
    PdfHeaderImage,
    pdfFooterImage, pdfLogo,

}) => {

    const amountInWords = (amount) => {
        const wholeNumber = Math.round(amount);
        return toWords.toWords(wholeNumber).charAt(0).toUpperCase() + toWords.toWords(wholeNumber).slice(1);
    };

    const itemsPerPage = 25;
    const totalSpares = estimateItems.reduce(
        (acc, item) => acc + item.spares.length,
        0
    );
    const totalPages = Math.ceil(totalSpares / itemsPerPage);

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
                    {/* <PDFImage
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
                    /> */}


                    <PDFImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/logo/${pdfLogo}`}
                        style={{
                            height: 300,
                            width: 450,
                            position: "absolute",
                            top: "30%",
                            left: "10%",
                            opacity: 0.1,
                            zIndex: 0,
                            pointerEvents: "none"
                        }}
                    />

                    {/* Header */}
                    <PDFImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/company/image/file/pdf_header/${PdfHeaderImage}`}
                        style={{
                            width: 580,
                            height: 95,
                        }}
                    />

                    {/* Main Content */}
                    <View style={{ textAlign: "center", marginBottom: 10 }} fixed>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Estimate</Text>
                    </View>

                    {/* Patron and Vehicle Details Section */}
                    <View
                        style={{
                            border: "1px solid #000",
                            padding: 10,
                            marginBottom: 10,
                        }}
                    >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ width: "60%" }}>
                                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                                    Patron: {customer.prefix} {customer.customer_name}
                                </Text>
                                <Text style={{ marginLeft: 35 }}>
                                    {customer.contact.address.street}, {customer.contact.address.city}
                                </Text>
                                <Text style={{ marginLeft: 35, fontFamily: "Helvetica-Bold" }}>{customer.contact.phone}</Text>
                            </View>

                            <View style={{ flexWrap: "wrap" }}>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Estimate No:</Text> {appointmentId}{" "}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Estimate Date:</Text> {new Date().toLocaleDateString()}{" "}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Vehicle No:</Text> {vehicleId}{" "}
                                </Text>
                                <Text>
                                    <Text style={{ fontWeight: "bold" }}>Vehicle Kms:</Text> {km}
                                </Text>
                            </View>

                        </View>

                        {customer.gst_number && (
                            <Text>GSTIN: {customer.gst_number}</Text>
                        )}
                    </View>

                    {/* Items Table */}
                    <View
                        style={{
                            border: "1px solid #000",
                            marginBottom: 10,
                            flex: 1,
                        }}
                    >
                        {/* Table Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                borderBottom: "1px solid #000",
                                backgroundColor: "#f0f0f0",
                                padding: 5,
                            }}
                        >
                            <Text style={{ width: "10%", textAlign: "center" }}>S.No</Text>
                            <Text style={{ width: "40%", textAlign: "left" }}>Particulars</Text>
                            <Text style={{ width: "15%", textAlign: "center" }}>Qty</Text>
                            <Text style={{ width: "15%", textAlign: "right" }}>Rate</Text>
                            <Text style={{ width: "20%", textAlign: "right" }}>Amount</Text>
                        </View>

                        {/* Items Display */}
                        {estimateItems
                            .flatMap((item) => item.spares)
                            .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                            .map((spare, index) => (
                                <View key={index} style={{ flexDirection: "row", padding: 3 }}>
                                    <Text style={{ width: "10%", textAlign: "center" }}>
                                        {pageIndex * itemsPerPage + index + 1}
                                    </Text>
                                    <Text style={{ width: "40%", textAlign: "left", fontFamily: "Helvetica-Bold" }}>
                                        {spare.spareList || "N/A"}
                                    </Text>
                                    <Text style={{ width: "15%", textAlign: "center" }}>
                                        {spare.qty || "0"}
                                    </Text>
                                    <Text style={{ width: "15%", textAlign: "right" }}>
                                        {parseFloat(spare.price || 0).toFixed(2)}
                                    </Text>
                                    <Text style={{ width: "20%", textAlign: "right" }}>
                                        {(parseFloat(spare.qty || 0) * parseFloat(spare.price || 0)).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                    </View>

                    {/* Total Section */}
                    {pageIndex === totalPages - 1 && (
                        <View
                            style={{
                                borderTop: "1px solid #000",
                                padding: 5,
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <View style={{ width: "80%" }}>
                                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>Amount in Words:</Text>
                                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>{`Rupees ${amountInWords(grandTotal)} Only.`}</Text>
                            </View>
                            <Text style={{ width: "20%", textAlign: "right", fontWeight: "bold" }}>
                                Total: {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}

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

                    <Text style={{ textAlign: "center", marginTop: 10 }}>
                        Page {pageIndex + 1} of {totalPages}
                    </Text>
                </Page>
            ))}
        </Document>
    );

    const pdfBlob = await pdf(<MyDocument />).toBlob();
    const url = URL.createObjectURL(pdfBlob);

    // Open the PDF in a new tab for preview
    window.open(url, "_blank");

};

export default generatePDF;
