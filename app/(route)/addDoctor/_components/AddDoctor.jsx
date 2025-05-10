"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BarLoader } from "react-spinners";

const AddDoctor = () => {
  const onboardingFee = 169;

  const initialFormData = {
    name: "",
    email: "",
    specialization: "",
    exp: "",
    establishmentType: "",
    clinicName: "",
    place: "",
    clinicNumber: "",
    clinicService: "",
    fees: "",
    sessionTimings: "",
    message: "",
    uploadFile: "",
    accessRole: "",
    mgoodId: "",
    refBy: "",
    pincode: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState(null);
  const [isPaymentSuccess, setPaymentSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showMgoodid, setShowMgoodid] = useState("");
  const [directToSpecialization, setDirectToSpecialization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [razorpay_payment_id, setRazorpay_payment_id] = useState("");

  const handleAccessRoleChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      accessRole: value,
      fees: value === "Partner" ? 169 : prevData.fees, // Set fees to 169 if role is Partner
      mgoodId: value === "Partner" ? generate8DigitId() : "", // Generate MGood ID if role is Partner
    }));
  };

  // const handleChange = (e) => {
  //   const { id, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [id]: value,
  //   }));
  // };

  const handleChange = (e) => {
    const { id, value } = e.target;

    // For the 'clinicNumber' field, enforce 10-digit numeric input
    if (id === "clinicNumber") {
      if (/^\d*$/.test(value)) {
        // Allow only numbers
        setFormData((prevData) => ({
          ...prevData,
          clinicNumber: value.slice(0, 10), // Limit input to 10 digits
        }));
      }
    } else {
      // For other fields, update the value as usual
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      establishmentType: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    console.log(e.target.files);
    setFile(e.target.files[0]);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET); // Replace with your upload preset from Cloudinary
    formData.append("cloud_name", process.env.NEXT_CLOUDINARY_CLOUD_NAME); // Replace with your Cloudinary cloud name
    formData.append("folder", "onboarding-mgood-doc");
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

  const updateIsBoarded = async (mgoodid) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/updateIsBoarded/${mgoodid}`, // Replace with your backend route
        {
          method: "PATCH", // Use PATCH for partial updates
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Update successful:", data);
      } else {
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updatePaymentDetails = async (razorpay_payment_id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/${razorpay_payment_id}`, // Replace with your backend route
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: username,
            mgoodId: showMgoodid,
          }),
        }
      );

      const data = await response.json();
      // console.log("fnejenf", data);

      if (response.ok) {
        console.log("Update successful:", data);
      } else {
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePayment = async () => {
    try {
      // saveFormData();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/order`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            amount: onboardingFee,
          }),
        }
      );
      const data = await res.json();
      console.log(data);
      handlePaymentVerify(data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handlePaymentVerify = async (data) => {
    const options = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "MGood",
      description: "Live Mode",
      order_id: data.id,
      handler: async (response) => {
        console.log("response", response);
        setRazorpay_payment_id(response.razorpay_payment_id);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/verify`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const verifyData = await res.json();
          console.log(verifyData, "verifyData");

          if (verifyData.message) {
            toast.success("Payment successful!");
            await updateIsBoarded(showMgoodid);
            await updatePaymentDetails(razorpay_payment_id);
            setPaymentSuccess(true);
            // window.location.href = `https://mgood.org/search/${directToSpecialization}`; // Change to your desired route
          }
        } catch (error) {
          console.log(error);
        }
      },
      theme: {
        color: "#5f63b8",
      },
      method: {
        qr: true, // Explicitly include QR code option
        netbanking: true,
        card: true,
        upi: true,
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const generate8DigitId = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
    return `MID${randomDigits}`; // Prefix "MID" to the random digits
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let formDataToSubmit = { ...formData };

      if (file) {
        const uploadedFileUrl = await uploadToCloudinary(file);
        formDataToSubmit.uploadFile = uploadedFileUrl;
      }
      if (formData.clinicNumber.length !== 10) {
        toast.error("Phone number must be exactly 10 digits.");
        setIsLoading(false);
        return;
      }
      setUsername(formDataToSubmit.name);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/`,
        formDataToSubmit
      );

      setFormData(initialFormData);
      setFile(null);
      document.getElementById("uploadFile").value = "";

      setShowMgoodid(response.data.mgoodId);
      setDirectToSpecialization(response.data.specialization);
      toast.success("Form submitted successfully!");
      setIsDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading after success or failure
    }
  };

  return (
    <section className="bg-gray-100">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">
          Join <span className="text-primary">Us</span>
        </h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-5">
          <div className="lg:col-span-2 lg:py-12">
            <p className="max-w-xl text-lg">
              At MGood, we believe that access to quality healthcare should be
              seamless, efficient, and instant. Our mission is to bridge the gap
              between those seeking medical attention and qualified healthcare
              professionals, ensuring timely support and care.
            </p>
            <br />
            <h2 className="text-red-500 font-bold py-2">Disclaimer*</h2>
            <div className="pl-5">
              <ul className="max-w-xl text-lg">
                <li className="list-disc">
                  By clicking on submit button, you confirm that you agree to
                  the terms and condition of teleconsultations as defined by
                  goverment under the law of land.
                </li>
                <li className="list-disc">
                  You agree to the documents provided on the{" "}
                  <a
                    href="https://mgood.org"
                    target="_blank"
                    className="text-blue-500"
                  >
                    website
                  </a>{" "}
                  and MGood can’t be help responsible for any breach
                  done from your end.
                </li>
                <li className="list-disc">
                  We have recieved your details. Your Profile is now visible on{" "}
                  <a
                    href="https://mgood.org"
                    className="text-blue-500"
                    target="_blank"
                  >
                    mgood.org
                  </a>
                </li>
              </ul>
            </div>
            <br />
            <div className="max-w-md text-lg">
              In case of any issue. Please Contact us on
              <span className="whitespace-nowrap"> +91-8923894358 </span>
              or reach out to us at
              <a
                href="mailto:info@mgood.org"
                className="text-blue-500 underline"
              >
                &nbsp;info@mgood.org
              </a>
            </div>

            <div className="mt-8">
              <a
                href="https://mgood.org"
                className="text-2xl font-bold text-primary"
                target="_blank"
              >
                Mgood.org
              </a>
            </div>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="name">
                  Name
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Name"
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Email address (Not Mandatory)"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="border-2 rounded-md text-slate-400">
                <label className="sr-only" htmlFor="accessRole">
                  Role
                </label>
                <select
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  id="accessRole"
                  value={formData.accessRole}
                  onChange={handleAccessRoleChange}
                  required
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  <option value="Doctor">Doctor</option>
                  <option value="Partner">Mgood Partner</option>
                </select>
              </div>

              <div className="border-2 rounded-md text-slate-400">
                <label className="sr-only" htmlFor="specialization">
                  Specialization
                </label>
                <select
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  id="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Specialization
                  </option>
                  {[
                    "Dental",
                    "Ortho",
                    "Derma",
                    "Patho",
                    "Pedo",
                    "Physiotherapy",
                    "General Physician",
                    "Dietician",
                    "Gyane",
                    "Psychiatry",
                    "Cardio",
                    "Neuro",
                    "Urology",
                    "Pulmonologist",
                    "General Surgeon",
                    "Radiology",
                    "Hair Transplant Clinics",
                    "Plastic Surgeon",
                    "Ayurveda",
                    "Homeopathy",
                    "Eye",
                    "ENT",
                    "Primary Healthcare Centres",
                    "Yoga Instructors",
                    "Pharmacy",
                    "Diagnostic Centres",
                    "Associate",
                    "RMP",
                  ].map((specialization) => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="exp">
                  Experience
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Experience in Years"
                  type="number"
                  id="exp"
                  min="1"
                  value={formData.exp}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col px-3 gap-2">
                <p className="text-primary">Choose Type of Establishment</p>
                <div className="flex gap-4">
                  <input
                    type="radio"
                    id="Owner of Establishment"
                    value="Owner of Establishment"
                    checked={
                      formData.establishmentType === "Owner of Establishment"
                    }
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label
                    htmlFor="Owner of Establishment"
                    className="text-sm text-slate-400"
                  >
                    Owner of Establishment
                  </label>
                </div>
                <div className="flex gap-4">
                  <input
                    type="radio"
                    id="Consultant Doctor"
                    value="Consultant Doctor"
                    checked={formData.establishmentType === "Consultant Doctor"}
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label
                    htmlFor="Consultant Doctor"
                    className="text-sm text-slate-400"
                  >
                    Consultant Doctor
                  </label>
                </div>
                <div className="flex gap-4">
                  <input
                    type="radio"
                    id="Rented at other Establishment"
                    value="Rented at other Establishment"
                    checked={
                      formData.establishmentType ===
                      "Rented at other Establishment"
                    }
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label
                    htmlFor="Rented at other establishment"
                    className="text-sm text-slate-400"
                  >
                    Rented at other Establishment
                  </label>
                </div>
                <div className="flex gap-4">
                  <input
                    type="radio"
                    id="Practicing at Home"
                    value="Practicing at Home"
                    checked={
                      formData.establishmentType === "Practicing at Home"
                    }
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label
                    htmlFor="Practicing at Home"
                    className="text-sm text-slate-400"
                  >
                    Practicing at Home
                  </label>
                </div>
              </div>

              {/* Additional form fields */}
              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="clinicName">
                  Clinic Name/Estd.
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Clinic/Estd. Name"
                  type="text"
                  id="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="place">
                  Place
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Place"
                  type="text"
                  id="place"
                  value={formData.place}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="clinicNumber">
                  Clinic/Estd. Phone Number
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Clinic/Estd. Phone Number"
                  type="number"
                  id="clinicNumber"
                  value={formData.clinicNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="clinicService">
                  Clinic/Estd. Services
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Clinic/Estd. Services"
                  type="text"
                  id="clinicService"
                  value={formData.clinicService}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex">
                <div className="flex items-center justify-center">
                  <i className="p-2 text-xl">₹</i>
                </div>
                <div className="border-2 rounded-md w-full">
                  <label className="sr-only" htmlFor="fees">
                    Fees
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 p-3 text-sm "
                    placeholder="Fees"
                    type="number"
                    id="fees"
                    value={formData.fees}
                    // readOnly={!isAmountEditable}
                    onChange={handleChange}
                    disabled={formData.accessRole === "Partner"}
                    required
                  />
                </div>
              </div>

              {formData.accessRole !== "Partner" && (
                <div className="border-2 rounded-md">
                  <label className="sr-only" htmlFor="sessionTimings">
                    Session Timings
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Session Timings"
                    type="text"
                    id="sessionTimings"
                    value={formData.sessionTimings}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">
                  Upload image or PDF of owners proof
                </p>
                <div className="border-2 rounded-md flex">
                  <label className="sr-only" htmlFor="uploadFile">
                    Upload image or PDF of owners proof
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Upload image or PDF of owners proof"
                    type="file"
                    id="uploadFile"
                    // value={formData.uploadFile}
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="pincode">
                  Pincode
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Pincode"
                  type="text"
                  id="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="refBy">
                  Ref. By
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Ref. By"
                  type="text"
                  id="refBy"
                  value={formData.refBy}
                  onChange={handleChange}
                />
              </div>

              <div className="border-2 rounded-md">
                <label className="sr-only" htmlFor="message">
                  Message
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Message"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-20 backdrop-blur-sm flex-col gap-4">
          <BarLoader color="green" height={15} width={200} />
          <p className="font-bold text-xl">Submitting...</p>
        </div>
      )}

      {isDialogOpen && !isPaymentSuccess && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold text-center">
              One Step Away From Becoming A Part Of MGood
            </h2>
            <div className="mt-4 text-center">
              <p className="text-lg text-gray-600 mb-6">
                Click below to Continue.
              </p>
            </div>
            <div className="flex justify-around">
              {/* Go To MGood Button */}
              <button
                className="bg-primary text-white px-4 py-2 rounded-lg"
                onClick={handlePayment}
              >
                Continue
              </button>
              {/* Close Button */}
              {/* <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setIsDialogOpen(false);
                  setShowMgoodid("");
                }}
              >
                Close
              </button> */}
            </div>
          </div>
        </div>
      )}

      {isPaymentSuccess && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-3xl font-bold text-center text-green-600">
              🎉 Congratulations! 🎉Your MGoodID is {showMgoodid}
            </h2>
            <p className="text-lg text-gray-700 mt-4 text-center">
              You are now part of MGood! We’re excited to have you on board.
            </p>
            <div className="flex justify-around mt-6">
              {/* Go To MGood Button */}
              <button
                className="bg-primary text-white px-6 py-2 rounded-lg"
                onClick={() => {
                  window.location.href = `https://mgood.org/search/${directToSpecialization}`; // Change to your desired route
                }}
              >
                Go To Dashboard
              </button>
              {/* Close Button */}
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded-lg"
                onClick={() => {
                  setIsDialogOpen(false);
                  setShowMgoodid("");
                  setPaymentSuccess(false);
                }} // Close the dialog
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddDoctor;