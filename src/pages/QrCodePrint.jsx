import {Button} from "antd";
import {PrinterOutlined} from "@ant-design/icons";
import React, {useRef, useState} from "react";

export default function QrCodePrint({servisId}) {
    const [showQR, setShowQR] = useState(false);
    const printRef = useRef(null);

    const handleGenerate = () => {
        setShowQR(true);
    };

    const handlePrint = ()=>{

    }
    return (
        <Button
            icon={<PrinterOutlined />}
            size="large"
            onClick={handlePrint}
            className="w-full"
        >
            Print Receipt
        </Button>
    )
}