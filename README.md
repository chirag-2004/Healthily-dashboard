# Healthily Dashboard (Part of Project Healthily by Team MIDROUTE)

This is the admin and doctor-facing dashboard for the Healthily platform, built with [Next.js](https://nextjs.org/). It is a key component of the **Healthily** project, developed by **Team MIDROUTE**. The dashboard provides tools for healthcare professionals and administrators to manage teleconsultation requests, onboard new doctors/partners, generate prescriptions, and join video consultation rooms.

## Project Overview: Healthily by Team MIDROUTE

The **Healthily** project consists of multiple components working together:

*   **Patient Frontend:** [https://github.com/DHRUVGANGAL/Healthily-User](https://github.com/DHRUVGANGAL/Healthily-User)
    *   **Deployed Patient Frontend:** [https://healthily-user.vercel.app](https://healthily-user.vercel.app)
*   **This Repository (Doctor Dashboard Frontend):** [https://github.com/DHRUVGANGAL/Healthily-dashboard](https://github.com/DHRUVGANGAL/Healthily-dashboard)
    *   **Deployed Doctor Dashboard:** [https://healthily-dashboard.onrender.com](https://healthily-dashboard.onrender.com)
*   **Backend:** [https://github.com/DHRUVGANGAL/healthily-backend](https://github.com/DHRUVGANGAL/healthily-backend)
    *   **Deployed Backend:** [https://healthily-backend-8s57.onrender.com](https://healthily-backend-8s57.onrender.com)

**Supporting Materials:**
*   **Documentation:** [https://drive.google.com/drive/folders/1LZsuSrA5w55e9CKWmdkgQ4a1BVCk4VJj?usp=drive_link](https://drive.google.com/drive/folders/1LZsuSrA5w55e9CKWmdkgQ4a1BVCk4VJj?usp=drive_link)
*   **Demo Video:** [https://drive.google.com/drive/folders/1dyNGo_04Wa5TQCKDgw-a0MFSUKqMZUzC?usp=drive_link](https://drive.google.com/drive/folders/1dyNGo_04Wa5TQCKDgw-a0MFSUKqMZUzC?usp=drive_link)
*   **Sample Generated Prescription:** [https://drive.google.com/drive/folders/1coGx7zimmeHeIKUJMlIpZtuhyJ0XZfdm?usp=drive_link](https://drive.google.com/drive/folders/1coGx7zimmeHeIKUJMlIpZtuhyJ0XZfdm?usp=drive_link)

## Healthily Dashboard Overview

The Healthily Dashboard serves as the operational interface for doctors and platform administrators. Key functionalities include real-time management of incoming teleconsultation appointments, a system for adding new healthcare providers to the platform, and a tool for creating and digitally managing prescriptions.

## Key Features

*   **Real-time Teleconsultation Management:**
    *   View a live dashboard of incoming teleconsultation requests from patients.
    *   Receive audio notifications for new requests.
    *   Accept or decline appointment requests.
    *   Timer indicating time left to act on a pending request.
    *   Real-time status updates powered by Socket.IO.
*   **Doctor/Partner Onboarding:**
    *   A comprehensive form to add new doctors or partners to the Healthily platform.
    *   Collects details like name, specialization, experience, clinic information, fees, etc.
    *   Supports uploading proof of ownership documents (images/PDFs) directly to Cloudinary.
*   **Prescription Generation & Management:**
    *   Form to input patient details, diagnosis, medications, and instructions.
    *   Client-side generation of a formatted PDF prescription (including a simulated invoice).
    *   Uploads the generated PDF to Cloudinary.
    *   Saves the prescription URL to the backend.
*   **Video Consultation Rooms:**
    *   Seamless integration with ZegoCloud for doctors to join one-on-one video consultation rooms with patients.
*   **Responsive Design:** Interface designed to be usable across different screen sizes.

## Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (with App Router)
    *   [React](https://reactjs.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Shadcn UI](https://ui.shadcn.com/) (for UI components like Dialogs, Cards, Inputs)
*   **Real-time Communication:**
    *   [Socket.IO Client](https://socket.io/docs/v4/client-api/) (for dashboard appointment updates)
    *   [ZegoCloud UIKit Prebuilt](https://www.zegocloud.com/) (for video call functionality)
*   **API Communication:** [Axios](https://axios-http.com/)
*   **File Storage:** [Cloudinary](https://cloudinary.com/) (for doctor onboarding documents and prescriptions)
*   **PDF Generation:** [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (loaded via CDN for client-side PDF creation)
*   **Styling & UI:**
    *   CSS Modules, PostCSS
    *   Lucide React (for icons)
    *   React Spinners (for loading indicators)
*   **Notifications:** `sonner` (for toast notifications)

## Project Structure

The project follows the Next.js App Router structure:

    ├── app/
    │   ├── (route)/                # Grouped routes
    │   │   ├── Room/               # Video consultation room for doctors
    │   │   ├── addDoctor/          # Doctor/Partner onboarding form
    │   │   ├── dashboard/          # Main dashboard for managing appointments
    │   │   └── prescriptions/      # Prescription generation form
    │   ├── _components/            # Global components (Header)
    │   ├── fonts/                  # Local fonts (Geist)
    │   ├── globals.css             # Global styles
    │   ├── layout.js               # Root layout
    │   └── page.js                 # Homepage/Login prompt
    ├── components/
    │   └── ui/                     # Shadcn UI components
    ├── lib/                        # Utility functions
    ├── public/                     # Static assets (images, notification sound)
    ├── .gitignore
    ├── middleware.js               # (Currently has commented out auth logic)
    ├── next.config.mjs
    ├── package.json
    ├── tailwind.config.js
    └── README.md                   # This file

## Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables. These are crucial for connecting to backend services, video call functionality, and file uploads.

    NEXT_PUBLIC_BACKEND_URL=http://localhost:YOUR_BACKEND_PORT # Or your deployed backend URL (e.g., https://healthily-backend-8s57.onrender.com)

    # ZegoCloud Credentials for Video Calls
    NEXT_PUBLIC_ZEGOCLOUD_APP_ID=YOUR_ZEGOCLOUD_APP_ID
    NEXT_PUBLIC_ZEGOCLOUD_SECRET=YOUR_ZEGOCLOUD_SERVER_SECRET

    # Cloudinary Credentials for File Uploads
    NEXT_PUBLIC_CLOUDINARY_PRESET=your_cloudinary_upload_preset
    NEXT_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name # Note: Standard is NEXT_PUBLIC_ for client-side access
    NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload # Full Cloudinary upload URL

**Note on `NEXT_CLOUDINARY_CLOUD_NAME`:** If this variable is intended for client-side use (which it appears to be in `AddDoctor.jsx` and `PrescriptionForm.jsx`), it should ideally be prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`). Ensure your Cloudinary setup matches the variable names used.

## Getting Started

First, ensure you have Node.js (v18 or later recommended) and npm/yarn/pnpm installed.

1.  **Clone the repository:**

        git clone https://github.com/DHRUVGANGAL/Healthily-dashboard.git
        cd Healthily-dashboard

2.  **Install dependencies:**

        npm install
        # or
        yarn install
        # or
        pnpm install

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary variables as described in the "Environment Variables" section.

4.  **Run the development server:**

        npm run dev
        # or
        yarn dev
        # or
        pnpm dev

5.  Open [http://localhost:3000](http://localhost:3000) (or your configured port) with your browser to see the result. The initial page prompts for login and redirects to `/dashboard`.

## Authentication (Note)

The `middleware.js` file and some commented-out code in page components suggest that [Kinde Auth](https://kinde.com/) was considered or partially implemented for authentication. However, the currently active `Header.jsx` and page logic do not seem to be using Kinde. If authentication is required, you may need to re-integrate or complete the Kinde Auth setup, or implement an alternative authentication mechanism.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. Remember to configure your environment variables in the Vercel project settings.

---
This README provides a comprehensive guide to understanding, setting up, and running the Healthily Dashboard, as part of the larger Healthily project by Team MIDROUTE.
Use code with caution.
Markdown


## Key Features

*   **Real-time Teleconsultation Management:**
    *   View a live dashboard of incoming teleconsultation requests from patients.
    *   Receive audio notifications for new requests.
    *   Accept or decline appointment requests.
    *   Timer indicating time left to act on a pending request.
    *   Real-time status updates powered by Socket.IO.
*   **Doctor/Partner Onboarding:**
    *   A comprehensive form to add new doctors or partners to the Healthily platform.
    *   Collects details like name, specialization, experience, clinic information, fees, etc.
    *   Supports uploading proof of ownership documents (images/PDFs) directly to Cloudinary.
*   **Prescription Generation & Management:**
    *   Form to input patient details, diagnosis, medications, and instructions.
    *   Client-side generation of a formatted PDF prescription (including a simulated invoice).
    *   Uploads the generated PDF to Cloudinary.
    *   Saves the prescription URL to the backend.
*   **Video Consultation Rooms:**
    *   Seamless integration with ZegoCloud for doctors to join one-on-one video consultation rooms with patients.
*   **Responsive Design:** Interface designed to be usable across different screen sizes.

## Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (with App Router)
    *   [React](https://reactjs.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Shadcn UI](https://ui.shadcn.com/) (for UI components like Dialogs, Cards, Inputs)
*   **Real-time Communication:**
    *   [Socket.IO Client](https://socket.io/docs/v4/client-api/) (for dashboard appointment updates)
    *   [ZegoCloud UIKit Prebuilt](https://www.zegocloud.com/) (for video call functionality)
*   **API Communication:** [Axios](https://axios-http.com/)
*   **File Storage:** [Cloudinary](https://cloudinary.com/) (for doctor onboarding documents and prescriptions)
*   **PDF Generation:** [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (loaded via CDN for client-side PDF creation)
*   **Styling & UI:**
    *   CSS Modules, PostCSS
    *   Lucide React (for icons)
    *   React Spinners (for loading indicators)
*   **Notifications:** `sonner` (for toast notifications)

## Project Structure

The project follows the Next.js App Router structure:

    ├── app/
    │   ├── (route)/                # Grouped routes
    │   │   ├── Room/               # Video consultation room for doctors
    │   │   ├── addDoctor/          # Doctor/Partner onboarding form
    │   │   ├── dashboard/          # Main dashboard for managing appointments
    │   │   └── prescriptions/      # Prescription generation form
    │   ├── _components/            # Global components (Header)
    │   ├── fonts/                  # Local fonts (Geist)
    │   ├── globals.css             # Global styles
    │   ├── layout.js               # Root layout
    │   └── page.js                 # Homepage/Login prompt
    ├── components/
    │   └── ui/                     # Shadcn UI components
    ├── lib/                        # Utility functions
    ├── public/                     # Static assets (images, notification sound)
    ├── .gitignore
    ├── middleware.js               # (Currently has commented out auth logic)
    ├── next.config.mjs
    ├── package.json
    ├── tailwind.config.js
    └── README.md                   # This file

## Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables. These are crucial for connecting to backend services, video call functionality, and file uploads.

    NEXT_PUBLIC_BACKEND_URL=http://localhost:YOUR_BACKEND_PORT # Or your deployed backend URL

    # ZegoCloud Credentials for Video Calls
    NEXT_PUBLIC_ZEGOCLOUD_APP_ID=YOUR_ZEGOCLOUD_APP_ID
    NEXT_PUBLIC_ZEGOCLOUD_SECRET=YOUR_ZEGOCLOUD_SERVER_SECRET

    # Cloudinary Credentials for File Uploads
    NEXT_PUBLIC_CLOUDINARY_PRESET=your_cloudinary_upload_preset
    NEXT_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name # Note: Standard is NEXT_PUBLIC_ for client-side access
    NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload # Full Cloudinary upload URL

**Note on `NEXT_CLOUDINARY_CLOUD_NAME`:** If this variable is intended for client-side use (which it appears to be in `AddDoctor.jsx` and `PrescriptionForm.jsx`), it should ideally be prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`). Ensure your Cloudinary setup matches the variable names used.

## Getting Started

First, ensure you have Node.js (v18 or later recommended) and npm/yarn/pnpm installed.

1.  **Clone the repository:**

        git clone https://github.com/your-username/Healthily-dashboard.git
        cd Healthily-dashboard

2.  **Install dependencies:**

        npm install
        # or
        yarn install
        # or
        pnpm install

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary variables as described in the "Environment Variables" section.

4.  **Run the development server:**

        npm run dev
        # or
        yarn dev
        # or
        pnpm dev

5.  Open [http://localhost:3000](http://localhost:3000) (or your configured port) with your browser to see the result. The initial page prompts for login and redirects to `/dashboard`.

## Authentication (Note)

The `middleware.js` file and some commented-out code in page components suggest that [Kinde Auth](https://kinde.com/) was considered or partially implemented for authentication. However, the currently active `Header.jsx` and page logic do not seem to be using Kinde. If authentication is required, you may need to re-integrate or complete the Kinde Auth setup, or implement an alternative authentication mechanism.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. Remember to configure your environment variables in the Vercel project settings.

