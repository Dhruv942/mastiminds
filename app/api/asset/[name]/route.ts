import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Whitelist – sirf yehi images serve hongi (path traversal prevent)
const ALLOWED = new Set([
  "space_red", "space_blue", "missile_red", "missile_blue", "explode",
  "icon_home", "icon_panjat", "king", "villain", "tiang",
  "standleft", "standright", "climbleft", "climbright",
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const baseName = name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "");

  if (!ALLOWED.has(baseName)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseDir = path.join(process.cwd(), "private-assets", "images");
  const filePath = path.join(baseDir, `${baseName}.png`);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
