import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        const session = await auth()
        if (!session?.user?.id) {
          throw new Error("Unauthorized")
        }

        return {
          allowedContentTypes: [
            "image/jpeg", 
            "image/png", 
            "image/gif", 
            "video/mp4", 
            "video/quicktime", 
            "video/webm", 
            "audio/webm", 
            "audio/mpeg", 
            "audio/wav"
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }: { blob: any, tokenPayload?: string | null }) => {
        // This callback is called once the upload is completed on Vercel's side.
        console.log("Blob upload completed", blob, tokenPayload)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } 
    )
  }
}
