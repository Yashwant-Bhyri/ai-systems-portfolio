import type { Metadata } from "next";
import { PortfolioV2 } from "../portfolio-v2";

/** Chinese metadata for the Chinese portal. The English page keeps the metadata
 *  declared in the root layout, so nothing about the existing deployment moves. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  alternates: {
    canonical: `${basePath}/zh/`,
    languages: {
      en: `${basePath}/`,
      "zh-Hans": `${basePath}/zh/`,
    },
  },
  title: "Bhyri Yashwant（毕亚什）— AI 系统与应用工程师",
  description:
    "毕亚什（Yashwant Bhyri）的交互式作品集：香港中文大学（深圳）计算机与人工智能方向学生，构建生产级 Agent 运行时、多模态 AI 应用、检索系统与全栈 AI 产品。",
  openGraph: {
    title: "Bhyri Yashwant（毕亚什）— AI 系统与应用工程师",
    description:
      "生产级 Agent 运行时、多模态 AI 生产系统、临床决策支持原型，以及可核查的工程证据。",
  },
};

/** The Chinese portal. Same site, same structure — only the language differs. */
export default function ChineseHome() {
  return <PortfolioV2 lang="zh" />;
}
