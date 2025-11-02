import { NextRequest, NextResponse } from "next/server";



const PUBLIC = [

  /^\/login($|\/)/,

  /^\/_next\//,

  /^\/favicon\.ico$/i,

  /^\/manifest\.json$/i,

  /^\/api\/public($|\/)/,

  /^\/debug\/auth($|\/)/,

];



export function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl;

  if (PUBLIC.some((r) => r.test(pathname))) return NextResponse.next();



  const authed = req.cookies.get("__emu_authed")?.value === "1";

  if (!authed) {

    const url = req.nextUrl.clone();

    url.pathname = "/login";

    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);

  }

  return NextResponse.next();

}

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };

