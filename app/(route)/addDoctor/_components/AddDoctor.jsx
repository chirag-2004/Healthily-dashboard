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
  // DialogTrigger, // Not used as dialog is opened programmatically
} from "@/components/ui/dialog";
import { BarLoader } from "react-spinners";

const AddDoctor = () => {
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
    refBy: "",
    pincode: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [directToSpecialization, setDirectToSpecialization] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAccessRoleChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      accessRole: value,
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "clinicNumber") {
      if (/^\d*$/.test(value)) {
        setFormData((prevData) => ({
          ...prevData,
          clinicNumber: value.slice(0, 10),
        }));
      }
    } else {
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
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append("cloud_name", process.env.NEXT_CLOUDINARY_CLOUD_NAME);
    formData.append("folder", "onboarding-mgood-doc");
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CLOUDINARY_URL,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
    }
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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/`,
        formDataToSubmit
      );

      setFormData(initialFormData);
      setFile(null);

      // Corrected part:
      const uploadFileElement = document.getElementById("uploadFile");
      if (uploadFileElement && uploadFileElement instanceof HTMLInputElement) {
        uploadFileElement.value = ""; // Clears the file input
      }
      // End of corrected part
      

      if (response.data.specialization) {
        setDirectToSpecialization(response.data.specialization);
      }
      toast.success("Form submitted successfully!");
      setIsDialogOpen(true); // Open success dialog
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
              At Healtily, we believe that access to quality healthcare should be
              seamless, efficient, and instant. Our mission is to bridge the gap
              between those seeking medical attention and qualified healthcare
              professionals, ensuring timely support and care.
            </p>
            <br />
            
            
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
                  <option value="Partner">Partner</option>
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
                    "Dental", "Ortho", "Derma", "Patho", "Pedo",
                    "Physiotherapy", "General Physician", "Dietician", "Gyane",
                    "Psychiatry", "Cardio", "Neuro", "Urology", "Pulmonologist",
                    "General Surgeon", "Radiology", "Hair Transplant Clinics",
                    "Plastic Surgeon", "Ayurveda", "Homeopathy", "Eye", "ENT",
                    "Primary Healthcare Centres", "Yoga Instructors", "Pharmacy",
                    "Diagnostic Centres", "Associate", "RMP",
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
                    checked={formData.establishmentType === "Owner of Establishment"}
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label htmlFor="Owner of Establishment" className="text-sm text-slate-400">
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
                  <label htmlFor="Consultant Doctor" className="text-sm text-slate-400">
                    Consultant Doctor
                  </label>
                </div>
                <div className="flex gap-4">
                  <input
                    type="radio"
                    id="Rented at other Establishment"
                    value="Rented at other Establishment"
                    checked={formData.establishmentType === "Rented at other Establishment"}
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label htmlFor="Rented at other Establishment" className="text-sm text-slate-400"> {/* Corrected typo in htmlFor */}
                    Rented at other Establishment
                  </label>
                </div>
                <div className="flex gap-4">
                  <input
                    type="radio"
                    id="Practicing at Home"
                    value="Practicing at Home"
                    checked={formData.establishmentType === "Practicing at Home"}
                    onChange={handleRadioChange}
                    className="appearance-none h-5 w-5 border-2 border-slate-400 rounded-full checked:bg-primary cursor-pointer"
                  />
                  <label htmlFor="Practicing at Home" className="text-sm text-slate-400">
                    Practicing at Home
                  </label>
                </div>
              </div>

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
                  type="text" // Changed to text to allow handleChange to manage numeric and length
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
                    onChange={handleChange}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-green-600">
              🎉 Congratulations! 🎉
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-700 mt-4 text-center">
              Your form has been submitted successfully. We’re excited to have you on board!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-around mt-6">
            <button
              className="bg-primary text-white px-6 py-2 rounded-lg"
              onClick={() => {
                if (directToSpecialization) {
                  window.location.href = `http://localhost:3001/search/${directToSpecialization}`;
                } else {
                  window.location.href = `http://localhost:3001`;
                }
                setIsDialogOpen(false);
              }}
            >
              Go To Healtily
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded-lg"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AddDoctor;
