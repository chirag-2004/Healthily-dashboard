'use client'

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import axios from "axios";
import { BarLoader } from "react-spinners"


function PrescriptionForm() {
  const [prescriptionData, setPrescriptionData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    diagnosis: '',
    medications: '',
    instructions: '',
    doctorName: '',
    doctorRegistrationNo: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file,`prescription_${prescriptionData.patientName}_${prescriptionData.date}.pdf`);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET); // Replace with your upload preset from Cloudinary
    formData.append("cloud_name", process.env.NEXT_CLOUDINARY_CLOUD_NAME); // Replace with your Cloudinary cloud name
    formData.append("folder", "mgood-prescriptions");
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CLOUDINARY_URL, // Replace with your Cloudinary cloud name
        formData
      );
      return response.data.secure_url; // URL of uploaded file
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
    }
  };

const savePrescription = async (prescriptionUrl, name) => {
  try {

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescription`,
      {
        name: name,
        url: String(prescriptionUrl), // Ensure it's a string
      }
    );

    if (response.status === 201) {
      setLoading(false);
      alert("Prescription saved successfully!");
    } else {
      throw new Error("Failed to save prescription");
    }
  } catch (error) {
    console.error("Error saving prescription:", error);
    alert("Failed to save prescription. Please try again.");
  }
};



  const generatePrescription = async () => {
    const prescriptionContent = `
      <div style="font-family: Arial, sans-serif;">
        <!-- First Page: Prescription -->
        <div style="padding: 10px; max-width: 800px; margin: 0 auto; page-break-after: always;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <img src="/mgood_logo.jpg" alt="Logo" style="width: 150px; height: auto; margin-right: 20px;"/>
            
            <div style="text-align: center; flex-grow: 1;">
              <h2 style="color: #000; margin: 0; padding: 0;">Medical Prescription</h2>
              <p style="color: #000; margin: 5px 0;">Date: ${prescriptionData.date}</p>
            </div>
            
            <div style="text-align: right;">
              <p style="color: #000; margin: 0;">Dr. ${prescriptionData.doctorName}</p>
              <p style="color: #000; margin: 0;">Reg No: ${prescriptionData.doctorRegistrationNo}</p>
            </div>
          </div>

          <div style="margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
            <p style="color: #000; margin: 0;"><strong>Patient Name:</strong> ${prescriptionData.patientName}</p>
            <p style="color: #000; margin: 0;"><strong>Age:</strong> ${prescriptionData.patientAge}</p>
            <p style="color: #000; margin: 0;"><strong>Gender:</strong> ${prescriptionData.patientGender}</p>
          </div>

          <div style="margin-bottom: 15px;">
            <h3 style="color: #000; margin: 0; padding-bottom: 5px;">Diagnosis:</h3>
            <p style="color: #000; margin: 0; padding-left: 20px;">${prescriptionData.diagnosis}</p>

            <h3 style="color: #000; margin: 10px 0 5px 0;">Medications:</h3>
            <p style="color: #000; margin: 0; padding-left: 20px; white-space: pre-line;">${prescriptionData.medications}</p>

            <h3 style="color: #000; margin: 10px 0 5px 0;">Instructions:</h3>
            <p style="color: #000; margin: 0; padding-left: 20px; white-space: pre-line;">${prescriptionData.instructions}</p>
          </div>

          <div style="margin-top: 80px;">
            <div style="width: 100%; border-bottom: 1px solid #000;"></div>
            <div style="width: 100%; display: flex; justify-content: flex-end; margin-top: 10px;">
              <div style="text-align: center; width: 300px;">
                <p style="color: #000; margin: 0 0 5px 0; font-size: 12px;">This is a computer generated document and does not require signature. Doctor name is mentioned for reference.</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; padding: 15px; background-color: #f8f8f8; border: 1px solid #ddd; font-size: 12px;">
            <h4 style="color: #000; margin: 0 0 10px 0; text-decoration: underline;">Important Disclaimers:</h4>
            <ol style="color: #444; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 5px;">MGood is a facilitator between doctors and patients, and is not responsible for the quality of care or treatment provided by the doctor.</li>
              <li style="margin-bottom: 5px;">This prescription is for informational purposes only, and patients are advised to seek a second opinion or consult with their primary care physician before starting any new treatment.</li>
              <li style="margin-bottom: 5px;">In case of an emergency, please call emergency services or visit the nearest hospital.</li>
            </ol>
          </div>

          <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666;">
              <span>Info@mgood.org</span>
              <span>www.mgood.org</span>
              <span>Any issues : +918923894358</span>
            </div>
          </div>
        </div>

        <!-- Second Page: Invoice -->
        <div style="padding: 10px; max-width: 800px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <img src="/mgood_logo.jpg" alt="Logo" style="width: 150px; height: auto;"/>
            <div style="text-align: right;">
              <h2 style="color: #000; margin: 0; padding: 0;">INVOICE</h2>
              <p style="color: #000; margin: 5px 0;">Date: ${prescriptionData.date}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #000; margin: 0; padding-bottom: 5px;"><strong>Patient Details:</strong></h3>
            <p style="color: #000; margin: 0;"><strong>Name:</strong> ${prescriptionData.patientName}</p>
            <p style="color: #000; margin: 0;"><strong>Doctor:</strong> Dr. ${prescriptionData.doctorName}</p>
            <p style="color: #000; margin: 0;"><strong>Reg No:</strong> ${prescriptionData.doctorRegistrationNo}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; color: black;">
            <tr style="background-color: #f8f8f8;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Amount</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">Consultation Fee</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹51.00</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">Service Charges</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹50.00</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">Platform Fee</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹50.00</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Subtotal</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹151.00</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px;">GST</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹18.00</td>
            </tr>
            <tr style="background-color: #f8f8f8;">
              <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Total Amount</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">₹169.00</td>
            </tr>
          </table>

          <div style="margin-bottom: 20px;">
            <p style="color: #000; margin: 5px 0;"><strong>Payment Status:</strong> Paid</p>
            <p style="color: #000; margin: 5px 0;"><strong>Payment Method:</strong> Online Payment</p>
            <p style="color: #000; margin: 5px 0;"><strong>Payment received to MGood via online method</strong></p>
          </div>

          <div style="font-size: 12px; color: #666; margin-top: 40px;">
            <p style="margin: 0 0 5px 0;"><strong>Terms & Conditions:</strong></p>
            <ol style="margin: 0; padding-left: 20px;">
              <li>This is a computer generated invoice.</li>
              <li>Payment is non-refundable once the consultation is completed.</li>
              <li>Any disputes should be raised within 7 days of consultation.</li>
            </ol>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Thank you for choosing MGood!</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
              <span>Info@mgood.org</span>
              <span>www.mgood.org</span>
              <span>Any issues : +918923894358</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = prescriptionContent;
    document.body.appendChild(container);

    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.body.appendChild(script);

      script.onload = async () => {
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `prescription_${prescriptionData.patientName}_${prescriptionData.date}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { 
            scale: 2,
            letterRendering: true,
            useCORS: true,
            scrollY: 0,
            windowWidth: document.documentElement.clientWidth
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            putTotalPages: true,
            compress: true
          }
        };

        await html2pdf().set(opt).from(container).save();
        const pdfBlob = await html2pdf().from(container).set(opt).outputPdf('blob');
        const prescriptionUrl =  await uploadToCloudinary(pdfBlob);
        await savePrescription(prescriptionUrl,prescriptionData.patientName);
        document.body.removeChild(container);
        document.body.removeChild(script);

        setPrescriptionData({
          patientName: "",
          patientAge: "",
          patientGender: "",
          diagnosis: "",
          medications: "",
          instructions: "",
          doctorName: "",
          doctorRegistrationNo: "",
          date: new Date().toISOString().split("T")[0],
        });
      };

      script.onerror = () => {
        alert('Error loading PDF generator. Please try again.');
        document.body.removeChild(container);
        document.body.removeChild(script);
      };
      


    } 
    catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      document.body.removeChild(container);
    }

  };
  const handleSubmit  = async (e) => {
    e.preventDefault();
    setLoading(true);
    generatePrescription();

  };
  return (
    <div>
      <Card className="w-full h-full max-w-2xl mx-auto bg-gray-500">
        <CardHeader>
          <CardTitle className="text-white">Generate Prescription</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName" className="text-white">
                  Patient Name
                </Label>
                <Input
                  id="patientName"
                  name="patientName"
                  value={prescriptionData.patientName}
                  onChange={handleInputChange}
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <Label htmlFor="patientAge" className="text-white">
                  Patient Age
                </Label>
                <Input
                  id="patientAge"
                  name="patientAge"
                  type="number"
                  value={prescriptionData.patientAge}
                  onChange={handleInputChange}
                  required
                  className="bg-white text-black"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="patientGender" className="text-white">
                Gender
              </Label>
              <Input
                id="patientGender"
                name="patientGender"
                value={prescriptionData.patientGender}
                onChange={handleInputChange}
                required
                className="bg-white text-black"
              />
            </div>

            <div>
              <Label htmlFor="diagnosis" className="text-white">
                Diagnosis
              </Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={prescriptionData.diagnosis}
                onChange={handleInputChange}
                required
                className="bg-white text-black min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="medications" className="text-white">
                Medications
              </Label>
              <Textarea
                id="medications"
                name="medications"
                value={prescriptionData.medications}
                onChange={handleInputChange}
                required
                className="bg-white text-black h-32"
                placeholder="Enter each medication on a new line"
              />
            </div>

            <div>
              <Label htmlFor="instructions" className="text-white">
                Instructions
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={prescriptionData.instructions}
                onChange={handleInputChange}
                className="bg-white text-black h-24"
                placeholder="Enter any special instructions"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctorName" className="text-white">
                  Doctor Name
                </Label>
                <Input
                  id="doctorName"
                  name="doctorName"
                  value={prescriptionData.doctorName}
                  onChange={handleInputChange}
                  required
                  className="bg-white text-black"
                />
              </div>
              <div>
                <Label htmlFor="doctorRegistrationNo" className="text-white">
                  Reg no.
                </Label>
                <Input
                  id="doctorRegistrationNo"
                  name="doctorRegistrationNo"
                  value={prescriptionData.doctorRegistrationNo}
                  onChange={handleInputChange}
                  required
                  className="bg-white text-black"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white"
            >
              Generate PDF Prescription
            </Button>
          </form>
        </CardContent>
      </Card>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-20 backdrop-blur-sm flex-col gap-4">
          <BarLoader color="green" height={15} width={200} />
          <p className="font-bold text-xl">Uploading...</p>
        </div>
      )}
    </div>
  );
}

export default PrescriptionForm;