import { importFacebookPost } from "@/actions/apify.action";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'editor'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { postUrl } = await request.json();
        if (!postUrl || typeof postUrl !== 'string' || !postUrl.trim()) {
            return NextResponse.json({ error: 'Missing or invalid postUrl' }, { status: 400 });
        }
        const result = await importFacebookPost(postUrl);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
    }
}