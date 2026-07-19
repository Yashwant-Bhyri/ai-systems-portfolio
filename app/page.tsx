import type { Metadata } from "next";
import { FableExperience } from "./fable/experience";

export const metadata: Metadata = {
  title: "Yashwant Bhyri — AI Application & Agent Engineer",
  description:
    "A self-driving tour through the AI systems Yashwant Bhyri has built: a real-time AI interviewer, a multi-agent media runtime, a clinical AI pipeline, and more. CUHK, Year 4 CS & AI.",
};

export default function Home() {
  return <FableExperience />;
}
