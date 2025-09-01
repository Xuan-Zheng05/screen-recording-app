import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import aj from "@/lib/arcjet";
import { validateEmail, slidingWindow, ArcjetDecision } from "arcjet";
import { NextRequest } from "next/server";
import ip from "@arcjet/ip";

const authHandlers = toNextJsHandler(auth.handler);

// Validate emails are not spammy
const emailValidation = aj.withRule(
    validateEmail({ mode: 'LIVE', block: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'] })
)

// Rate limit sign in attempts
const rateLimit = aj.withRule(
    slidingWindow({
        mode: "LIVE",
        interval: '2m',
        max: 2,
        characteristics: ['fingerprint']
    })
)

const proctedAuth = async (req: NextRequest): Promise<ArcjetDecision> => {
    const session = await auth.api.getSession({ headers: req.headers});

    let userId: string;

    if (session?.user?.id) {
        userId = session.user.id;     
    } else {
        userId = ip(req) || '127.0.0.1'
    }

    if (req.nextUrl.pathname.startsWith('/api/auth/sign-in')) {
        const body = await req.clone().json();

        if (typeof body.email === 'string') {
            return emailValidation.protect(req, { email: body.email });
        }
    }
    return rateLimit.protect(req, { fingerprint: userId } );
}

export const { GET } = authHandlers

export const POST = async (req: NextRequest) => {
    const decision = await proctedAuth(req);

    if (decision.isDenied()) {
        if (decision.reason.isEmail()) {
            return new Response("Email validation failed", { status: 400 });
        }

        if (decision.reason.isRateLimit()) {
            return new Response("Rate limit exceeded", { status: 429 });
        }

        if (decision.reason.isShield()) {
            return new Response("Malicious action detected", { status: 403 });
        }
    }
    return authHandlers.POST(req);
}