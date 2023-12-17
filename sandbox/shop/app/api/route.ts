import { createBlobSas } from "../../utils/blobStore";
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const f = searchParams.get('f')
    return NextResponse.json(await createBlobSas(f, true))
}

