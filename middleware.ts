import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import aj from "@/lib/arcjet";
import { shield, detectBot } from "arcjet";
import { createMiddleware } from "@arcjet/next";

const arcjetMiddleware = createMiddleware(
    aj
        .withRule(shield({ mode: "LIVE" }))
        .withRule(
        detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE", "GOOGLE_CRAWLER"],
        })
    )
);

// 2. Define the main middleware function
export async function middleware(request: NextRequest) {
    // First, run the Arcjet middleware to block bots and other threats
    const arcjetDecision = await arcjetMiddleware(request);
    if (arcjetDecision) {
        return arcjetDecision;
    }

    // Next, perform the authentication check using an Edge-compatible helper
    const session = getSessionCookie(request, {
        cookieName: "session_token", // Default value, but explicit for clarity
        cookiePrefix: "better-auth",   // Default value, but explicit for clarity
    });

    // If there is no session, redirect to the sign-in page
    if (!session) {
        const signInUrl = new URL("/sign-in", request.url);
        return NextResponse.redirect(signInUrl);
    }

    // If the user is authenticated, continue to the requested page
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
}