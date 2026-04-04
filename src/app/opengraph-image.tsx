import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "SOWA — Skillnet Offshore Wind Academy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0C2340 0%, #1A3A5C 50%, #0C2340 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(0, 168, 120, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(74, 144, 217, 0.08)",
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: "#00A878",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "white",
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            SOWA
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 28,
            color: "#00A878",
            fontWeight: 600,
            marginBottom: 16,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Skillnet Offshore Wind Academy
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.8)",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Ireland&apos;s national careers platform for offshore wind energy
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #00A878 0%, #4A90D9 50%, #00A878 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
