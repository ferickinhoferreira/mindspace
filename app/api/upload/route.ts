import { NextResponse } from "next/server"
import { auth } from "@/auth"
import fs from "fs"
import path from "path"
import { pipeline } from "stream"
import { promisify } from "util"
import { put } from "@vercel/blob"

const pump = promisify(pipeline)

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // --- VERCEL BLOB SUPPORT (Production) ---
    // If BLOB_READ_WRITE_TOKEN is set, use it. This is the fix for Vercel production.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        return NextResponse.json({ 
          url: blob.url, 
          size: file.size,
          message: "Upload successful (Vercel Blob)"
        })
      } catch (blobError: any) {
        console.error("Vercel Blob Error:", blobError)
        return NextResponse.json({ 
          error: "Erro no Vercel Blob: " + blobError.message,
          tip: "Certifique-se de que o Blob Storage está CRIADO e ATIVO na aba 'Storage' do Vercel."
        }, { status: 500 })
      }
    }

    // --- LOCAL FALLBACK (Development) ---
    // Note: This only works on your local machine (localhost). 
    // Vercel production needs Blob Storage.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ 
        error: "Upload local não suportado em produção.",
        tip: "Vá no painel do Vercel -> Storage -> Connect Store -> Blob para ativar os uploads."
      }, { status: 500 })
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`
    const relativePath = `/uploads/${fileName}`
    const absolutePath = path.join(process.cwd(), "public", "uploads", fileName)

    const dir = path.dirname(absolutePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const readableStream = file.stream()
    const writableStream = fs.createWriteStream(absolutePath)
    
    // @ts-ignore
    await pump(readableStream, writableStream)

    return NextResponse.json({ 
      url: relativePath, 
      size: file.size,
      message: "Upload successful (Local)"
    })
  } catch (error) {
    console.error("Upload error detail:", error)
    return NextResponse.json({ 
      error: "Upload failed: " + (error as Error).message,
      tip: "Verifique os logs do servidor no Vercel para mais detalhes."
    }, { status: 500 })
  }
}
