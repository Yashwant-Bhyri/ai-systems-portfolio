import type { Metadata } from "next";
import { PortfolioV2 } from "./portfolio-v2";

export const metadata: Metadata = {
  title: "Yashwant Bhyri — AI Application & Agent Engineer",
  description:
    "Interactive portfolio of Yashwant Bhyri, a CUHK-Shenzhen computer science student building AI agents, multimodal applications, retrieval systems, and production AI runtimes — every system shown as a live operational replay.",
};

export default function Home() {
  return <PortfolioV2 />;
}
