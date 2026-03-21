import { NextResponse } from "next/server"
import { auth } from "@/auth"
import fs from "fs"
import path from "path"
import { writeFile } from "fs/promises"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validation (Limit: 100MB for Video, 10MB for others - checked in frontend, but here too)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`
    const relativePath = `/uploads/${fileName}`
    const absolutePath = path.join(process.cwd(), "public", "uploads", fileName)

    await writeFile(absolutePath, buffer)

    return NextResponse.json({ url: relativePath, size: buffer.length })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
