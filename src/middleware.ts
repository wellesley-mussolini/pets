import { NextResponse, type NextRequest } from "next/server";
import { Pathnames } from "./constants/pathnames.constant";
import { createClient } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createClient(request, response);

  const { data: { user } } = await supabase.auth.getUser();
  const isUserOnAuthPage = request.nextUrl.pathname === Pathnames.AUTH;
  const userIsNotAuthenticatedAndNotOnAuthPage = !user && !isUserOnAuthPage;
  const userIsAuthenticatedAndOnAuthPage = user && isUserOnAuthPage;

  if (userIsNotAuthenticatedAndNotOnAuthPage) {
    return NextResponse.redirect(new URL(Pathnames.AUTH, request.url));
  };

  if (userIsAuthenticatedAndOnAuthPage) {
    return NextResponse.redirect(new URL(Pathnames.HOME, request.url));
  };

  return response;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};