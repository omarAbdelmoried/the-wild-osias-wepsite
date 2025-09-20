import { auth } from "@/app/_lips/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/account"],
};


