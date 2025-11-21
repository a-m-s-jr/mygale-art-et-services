/* eslint-disable react/react-in-jsx-scope */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") || "MYGALE Art & Services"

  // ImageResponse takes the React element as the first argument
  // and the options object (width/height) as the second.
  // The old signature often involved three arguments, causing the error.
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#003366",
        color: "white",
        fontSize: 64,
        padding: "40px",
        textAlign: "center",
      }}
    >
      {title}
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}