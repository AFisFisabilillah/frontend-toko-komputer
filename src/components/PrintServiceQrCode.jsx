import {Button} from "antd";
import {PrinterOutlined} from "@ant-design/icons";
import React, {useEffect, useRef} from "react";
import {QRCodeCanvas} from "qrcode.react";
import {useReactToPrint} from "react-to-print";
import '../index.css';
import dayjs from "dayjs";
export const PrintServiceQrCode = ({service}) => {
    const printRef = useRef();
    useEffect(() => {
        console.log(printRef.current)
    })
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'qr service'
    })

    const createdAt = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    const landingPageUrl  = import.meta.env.VITE_LANDING_PAGE_URL;
    return (
        <>
            <div>
                <div ref={printRef} className="thermal hidden print:block">
                    <h3 className={"text-2xl font-bold"}>AhTaufix</h3>

                    <div className="flex justify-center my-2">
                        <QRCodeCanvas
                            value={landingPageUrl+"/check-service?service_code="+service.service_code}
                            size={120}
                        />
                    </div>
                    <h2 className={"text-md font-bold text-md"}>
                        {service.service_code}
                    </h2>
                    <div className="mx-6 text-xs">
                        <p>Laptop : {service.laptop_brand +" "+ service.laptop_model } </p>
                    </div>
                    <p className={"text-xs"}>Scan untuk info servis</p>
                    <p className={"text-xs"}>Terima kasih 🙏</p>
                    <p >{createdAt}</p>
                </div>
            </div>
            <Button
                icon={<PrinterOutlined />}
                size="large"
                onClick={handlePrint}
                className="w-full"
            >
                Print Receipt
            </Button>
        </>
    )
}