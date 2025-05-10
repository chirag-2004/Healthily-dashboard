import React from "react";
import AddDoctor from "./_components/AddDoctor";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { redirect } from "next/navigation";
// import { NextResponse } from "next/server";

const page = () => {
  // const { isAuthenticated } = getKindeServerSession();
  // if (!(await isAuthenticated())) {
  //   return NextResponse.redirect(
  //     new URL("/api/auth/login?post_login_redirect_url=/", request.url)
  //   );
  // }

  // const { getClaim } = getKindeServerSession();
  // const result = await getClaim("roles");
  // console.log("Role: ", result);
  // if (result?.value.some((role) => role.name === "admin")) {
  //   return <div>Access Denied</div>;
  // }

  return (
    <div>
      <AddDoctor />
    </div>
  );
};

export default page;