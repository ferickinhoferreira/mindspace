import { NextResponse } from "next/server"
import { auth } from "@/auth"
import fs from "fs"
import path from "path"
import { pipeline } from "stream"
import { promisify } from "util"

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

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`
    const relativePath = `/uploads/${fileName}`
    const absolutePath = path.join(process.cwd(), "public", "uploads", fileName)

    // Ensure directory exists
    const dir = path.dirname(absolutePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Using streams to be more memory efficient/robust
    const readableStream = file.stream()
    const writableStream = fs.createWriteStream(absolutePath)
    
    // @ts-ignore
    await pump(readableStream, writableStream)

    return NextResponse.json({ 
      url: relativePath, 
      size: file.size,
      message: "Upload successful"
    })
  } catch (error) {
    console.error("Upload error detail:", error)
    return NextResponse.json({ error: "Upload failed: " + (error as Error).message }, { status: 500 })
  }
}
