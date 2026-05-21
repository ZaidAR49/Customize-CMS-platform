import {importFacebookPost} from "@/actions/apify.action";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    const { postUrl } = await request.json();
    const result = await importFacebookPost(postUrl);
    return NextResponse.json(result);
}