// import { NextResponse } from "next/server";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function middleware(request) {
  console.log("Middleware triggered");

  // Retrieve session from Kinde
  // const { isAuthenticated } = getKindeServerSession();

  // // Check if the user is authenticated
  // if (!(await isAuthenticated())) {
  //   console.log("User not authenticated. Redirecting to login...");

  //   // Perform the redirect using NextResponse.redirect
  //   return NextResponse.redirect(
  //     new URL("/api/auth/login?post_login_redirect_url=/", request.url)
  //   );
  // }

  // return NextResponse.next();
}

// Matching paths to apply the middleware
export const config = {
  matcher: ["/dashboard"], // Add other protected paths as needed
};
