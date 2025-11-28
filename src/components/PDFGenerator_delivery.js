import {
    Document,
    Page,
    View,
    Text,
    Image as PDFImage,
    pdf,
} from "@react-pdf/renderer";
import toWords from "number-to-words";
import Cookies from "js-cookie"
import {
    formatDate,
} from "../../controllers/jobStatusIDControllers.js";
const printDates = new Date() || "UNKNOWN Date";
const printedBys = Cookies.get("userName") || "UNKNOWN User";

const delivery_challan_pdf = async ({
    customer,
    estimateItems,
    appointmentId,
    vehicleId,
    km,
    grandTotal,
    PdfHeaderImage,
    pdfFooterImage,
    pdfLogo,
    services,
    printDate,
    printedBy
}) => {

    const amountInWords = (amount) => {
        const wholeNumber = Math.round(amount);
        return toWords.toWords(wholeNumber).charAt(0).toUpperCase() + toWords.toWords(wholeNumber).slice(1);
    };

    const itemsPerPage = 25;
    const totalSpares = estimateItems?.reduce(
        (acc, item) => acc + item.spares.length,
        0
    ) || Math.ceil(services.length / itemsPerPage);;
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
                            Delivery Challan
                        </Text>
                    </View>

                    {/* Patron and Vehicle Details */}
                    <View
                        style={{
                            border: "1px solid #000",
                            padding: 10,
                            marginBottom: 10,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                                alignContent: "space-between",
                            }}
                        >
                            <View style={{ width: "60%" }}>
                                <Text style={{fontFamily: "Helvetica-Bold"}}>
                                    Patron: {customer.prefix} {customer.customer_name}
                                </Text>

                                <Text style={{ marginLeft: 37 }}>
                                    {customer.contact.address.street},{" "}
                                    {customer.contact.address.city}
                                </Text >
                                <Text style={{ marginLeft: 37,fontFamily: "Helvetica-Bold" }}>{customer.contact.phone}</Text>
                            </View>
                            {/* <View
         style={{
           flexDirection: "column",
           width: "40%",
           justifyContent: "center", // Center vertically
           alignItems: "center", // Center horizontally
           // minHeight: 150, // Ensures space even if data is missing
         }}
       >
         {[
           { label: "Appointment No :", value: appointmentId || "N/A" },
           { label: "Delivery Date :", value: new Date().toLocaleDateString("en-GB") },
           { label: "Vehicle No :", value: vehicleId || "N/A" },
           { label: "Vehicle Kms :", value: km || "N/A" },
         
         ].map((item, index) => (
           <View
             key={index}
             style={{
               flexDirection: "row",
               justifyContent: "center",
               alignItems: "center",
               width: "100%",
             }}
           >
             <Text style={{ fontWeight: "bold", minWidth: 130, textAlign: "right" }}>
               {item.label}
             </Text>
             <Text style={{ textAlign: "left", flex: 1, marginLeft: 5 }}>
               {item.value}
             </Text>
           </View>
         ))}
       </View> */}



                            <View
                                style={{
                                    flexDirection: "column",
                                    // width: "20%",
                                    // justifyContent: "space-between",
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <Text>Appointment No  :</Text>
                                    <Text style={{ textAlign: "left" }}>{appointmentId || "N/A"}</Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <Text>Delivery Date :</Text>
                                    <Text style={{ textAlign: "left" }}>
                                        {new Date().toLocaleDateString()}
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <Text>Vehicle No :</Text>
                                    <Text style={{ textAlign: "left" }}>{vehicleId}</Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <Text>Vehicle Kms :</Text>
                                    <Text style={{ textAlign: "left" }}>{km}</Text>
                                </View>
                            </View>



                        </View>
                        {customer.gst_number && (
                            <View
                                style={{
                                    padding: 1,
                                    width: "30%",
                                    marginBottom: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text>GSTIN: {customer.gst_number || "N/A"}</Text>
                            </View>
                        )}
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
                            <Text style={{ width: "10%", textAlign: "center" }}>
                                S.No
                            </Text>
                            <Text style={{ width: "40%", textAlign: "left" }}>
                                Particulars
                            </Text>
                            <Text
                                style={{
                                    marginLeft: "10px",
                                    width: "30%",
                                    textAlign: "left",
                                }}
                            >
                                Inspection Status
                            </Text>
                            <Text style={{ width: "50%", textAlign: "left" }}>
                                Comments
                            </Text>
                        </View>

                        {/* Render items for the current page */}
                        {services
                            .slice(
                                pageIndex * itemsPerPage,
                                (pageIndex + 1) * itemsPerPage
                            )
                            .map((service, index) => {
                                // Safely get the first item name or use a default value
                                const itemName =
                                    service.items_required && service.items_required[0]
                                        ? service.items_required[0].item_name
                                        : "No items";

                                // Safely parse comments
                                let comments = "-"; // Default value in case no comments or invalid JSON

                                if (service.comments) {
                                    try {
                                        // Attempt to parse the comments as JSON
                                        const parsedComments = JSON.parse(service.comments);
                                        comments = parsedComments[0]?.comments || "-"; // Access the comment or use default "-"
                                    } catch (error) {
                                        // If JSON parsing fails, use the comments directly
                                        comments = service.comments;
                                        // console.error("Error parsing comments, displaying as raw text:", error);
                                    }
                                }

                                return (
                                    <View
                                        key={index}
                                        style={{ flexDirection: "row", padding: 1 }}
                                    >
                                        <Text style={{ width: "10%", textAlign: "center" }}>
                                            {index + 1 + pageIndex * itemsPerPage}
                                        </Text>
                                        <Text style={{ width: "40%", textAlign: "left" }}>
                                            {`${itemName} - ${service.service_description || ""}`}
                                        </Text>
                                        <Text
                                            style={{
                                                marginLeft: "10px",
                                                width: "30%",
                                                textAlign: "left",
                                            }}
                                        >
                                            {service.service_status === "Completed"
                                                ? "Checked Ok"
                                                : "Deffered"}
                                        </Text>
                                        <Text style={{ width: "50%", textAlign: "left" }}>
                                            {comments}
                                        </Text>
                                    </View>
                                );
                            })}
                    </View>

                    {/* Signature section */}
                    <View
                        style={{
                            border: "1px solid #000",
                            padding: "50 30 10 30",
                            marginBottom: 10,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View>
                            <Text>Prepared By</Text>
                        </View>

                        <View>
                            <Text>Received By</Text>
                        </View>
                    </View>

                    {/* Footer Section */}
                    {/* <View style={{ width: "100%", textAlign: "right" }}>
                       <Text>
                         Printed by : {userId} - {user}
                       </Text>
                     </View> */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text>Date: {formatDate(printDate || printDates)}</Text>
                        <Text>Printed By: {printedBy || printedBys}</Text>
                        <Text>Print Type: Reprint</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );

    const pdfBlob = await pdf(<MyDocument />).toBlob();
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    const Timestamp = new Date().getTime();
    link.download = `Delivery_Challan_${appointmentId}_${Timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default delivery_challan_pdf;
