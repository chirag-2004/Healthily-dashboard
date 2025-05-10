// "use client";
// import React, { useEffect } from "react";
// import Header from "@/app/_components/Header";
// import Dashboard from "./_components/Dashboard";
// import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
// import { redirect } from "next/navigation";
// // import axios from "axios";
// const page = () => {
//   // const { getUser } = getKindeServerSession();
//   // const user = await getUser();

//   const { user } = useKindeBrowserClient();

//   // Validate the user against your backend database
//   useEffect(() => {
//     const validateUser = async () => {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-user`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: user?.email }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to validate user");
//       }

//       const data = await response.json();

//       if (!data.exists) {
//         console.log("Access denied: User does not exist in the database");
//         return redirect("/access-denied"); // Redirect to an access denied page
//       }

//       console.log(
//         "Access granted: User is authenticated and exists in the database"
//       );
//     };

//     if (user?.email) {
//       validateUser();
//     }
//   }, []);

//   // const data = await response.json();

//   // if (!data.exists) {
//   //   console.log("Access denied: User does not exist in the database");
//   //   return redirect("/access-denied"); // Redirect to an access denied page
//   // }

//   return (
//     <div>
//       {/* Header */}
//       <Header />
//       {/* Dashboard */}
//       <Dashboard user={user} />
//     </div>
//   );
// };

// export default page;

"use client";
import React, { useEffect, useState } from "react";
import Header from "@/app/_components/Header";
import Dashboard from "./_components/Dashboard";
// import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { redirect } from "next/navigation";
import axios from "axios";

const Page = () => {
  // const { user } = useKindeBrowserClient();
  const [isValidUser, setIsValidUser] = useState(false); // Track user validation status
  const [loading, setLoading] = useState(true); // Track loading state

  // useEffect(() => {
  //   const validateUser = async () => {
  //     try {
  //       const response = await axios.post(
  //         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkRole`,
  //         { email: user?.email } // Send the email in the body
  //       );

  //       console.log(response);

  //       if (!response.ok) {
  //         throw new Error("Failed to validate user");
  //       }

  //       const data = await response.json();
  //       console.log(data);

  //       if (data.exists === "true") {
  //         setIsValidUser(true);
  //       } else {
  //         console.log("Access denied: User does not exist in the database");
  //         redirect("/access-denied"); // Redirect if user is not found
  //       }
  //     } catch (error) {
  //       console.error("Validation error:", error);
  //       redirect("/access-denied"); // Redirect on error
  //     } finally {
  //       setLoading(false); // Set loading to false after validation
  //     }
  //   };

  //   if (user?.email) {
  //     validateUser();
  //   } else {
  //     setLoading(false); // Stop loading if no user
  //   }
  // }, [user?.email]);

  // Show a loading spinner or message until validation completes
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // Render only if the user is validated
  // if (isValidUser) {
  return (
    <div>
      {/* Header */}
      <Header />
      {/* Dashboard */}
      <Dashboard />
    </div>
  );
  // }

  // Optionally, return null if neither condition is met (shouldn't happen due to redirects)
  // return null;
};

export default Page;
