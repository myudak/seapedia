import { ImageResponse } from "next/og";

export const alt = "SEAPEDIA marketplace multi-peran Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#171512",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 0 0 auto",
          display: "flex",
          width: 500,
          background: "#f4f1ec",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          display: "flex",
          width: 720,
          background: "rgba(23, 21, 18, 0.9)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 720,
          padding: "74px 78px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#f04438",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          MARKETPLACE INDONESIA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          SEAPEDIA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            maxWidth: 560,
            fontSize: 32,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.84)",
          }}
        >
          Belanja produk lokal dengan alur buyer, seller, driver, dan admin
          yang terhubung.
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 38 }}>
          {['Fashion', 'Food', 'Home', 'Gadget'].map((category) => (
            <div
              key={category}
              style={{
                display: "flex",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 18,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {category}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 62,
          right: 48,
          display: "flex",
          flexWrap: "wrap",
          width: 404,
          gap: 18,
        }}
      >
        {["#f04438", "#0f8b87", "#d9a441", "#2b2d31"].map(
          (color, index) => (
            <div
              key={color}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 193,
                height: 244,
                overflow: "hidden",
                border: "1px solid #ded8cf",
                borderRadius: 8,
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 158,
                  alignItems: "center",
                  justifyContent: "center",
                  background: color,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: index % 2 === 0 ? 78 : 104,
                    height: index % 2 === 0 ? 104 : 74,
                    border: "8px solid rgba(255,255,255,0.9)",
                    borderRadius: index === 1 ? 38 : 8,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: index % 2 === 0 ? 126 : 144,
                    height: 12,
                    borderRadius: 4,
                    background: "#27231f",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    width: 86,
                    height: 10,
                    borderRadius: 4,
                    background: "#b5aea4",
                  }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>,
    size,
  );
}
