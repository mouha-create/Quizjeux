import { useEffect } from "react";

interface AdSenseProps {
  slot: string;
  format?: "autorelaxed" | "fluid" | "auto";
  layout?: "in-article" | string;
  layoutKey?: string;
  style?: React.CSSProperties;
  fullWidthResponsive?: boolean;
}

export function AdSense({
  slot,
  format = "auto",
  layout,
  layoutKey,
  style,
  fullWidthResponsive = true,
}: AdSenseProps) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  const defaultStyle: React.CSSProperties = {
    display: "block",
    ...style,
  };

  return (
    <ins
      className="adsbygoogle"
      style={defaultStyle}
      data-ad-client="ca-pub-6034530639078182"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : undefined}
      {...(layout && { "data-ad-layout": layout })}
      {...(layoutKey && { "data-ad-layout-key": layoutKey })}
    />
  );
}

// Composants pré-configurés pour chaque type d'annonce
export function AdSenseAutorelaxed() {
  return (
    <AdSense
      slot="9749030953"
      format="autorelaxed"
      style={{ display: "block" }}
    />
  );
}

export function AdSenseInArticle() {
  return (
    <AdSense
      slot="7000961578"
      format="fluid"
      layout="in-article"
      style={{ display: "block", textAlign: "center" }}
    />
  );
}

export function AdSenseFluid() {
  return (
    <AdSense
      slot="6502268120"
      format="fluid"
      layoutKey="-fb+5w+4e-db+86"
      style={{ display: "block" }}
    />
  );
}

export function AdSenseAuto() {
  return (
    <AdSense
      slot="9621038446"
      format="auto"
      style={{ display: "block" }}
      fullWidthResponsive={true}
    />
  );
}

