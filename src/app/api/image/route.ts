import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new NextResponse("Missing path parameter", { status: 400 });
  }

  // Construct the original imagekit URL with optimization parameters
  // tr:w-800,q-75,f-webp resizes to 800px width, 75% quality, and converts to WebP for maximum compression
  const originalUrl = `https://ik.imagekit.io/aayushrambo8/tr:w-800,q-75,f-webp/${path}`;

  try {
    const imageResponse = await fetch(originalUrl);
    
    if (!imageResponse.ok) {
        return new NextResponse("Error fetching image", { status: imageResponse.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", imageResponse.headers.get("content-type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Stream the response directly to avoid high server RAM consumption
    return new NextResponse(imageResponse.body, {
        status: 200,
        headers,
    });
  } catch (error) {
    console.error("Error fetching proxied image:", error);
    return new NextResponse("Error processing image", { status: 500 });
  }
}
