"use client";

import { useCallback } from "react";
import { useLanguage } from "../i18n";

/**
 * Chinese for every string the exhibit wings draw. Terms of art that engineers read in English
 * in either language (GRPO, LoRA, KV, pass@1, TTFT, GPU-s) stay in Latin script.
 */
const ZH: Record<string, string> = {
  // shell
  "Light": "概览",
  "Developer": "开发者",
  "Viewing depth": "浏览深度",
  "Pause tour": "暂停导览",
  "Play tour": "播放导览",
  "Inference": "推理",
  "Post-training": "后训练",
  "rooms": "展厅",
  "source": "来源",
  // shared scene labels
  "MATHEMATICS": "数学",
  "MULTI-STEP LOGIC": "多步逻辑",
  "REPOSITORY TASKS": "代码仓库任务",
  "Mathematics": "数学",
  "Multi-step logic": "多步逻辑",
  "Repository tasks": "代码仓库任务",
  "SOLVED": "已解决",
  "PASS@1": "PASS@1",
  "GPU-S / TASK": "GPU 秒 / 任务",
  "TOKENS / TASK": "TOKEN / 任务",
  "TOKENS": "TOKEN",
  "CHECKPOINT": "检查点",
  "FLEET": "集群",
  "rollout": "采样",
  "train": "训练",
  "eval · search": "评估 · 搜索",
  "weight sync": "权重同步",
  "idle": "空闲",
  // map
  "FLEET · 64 × GPU": "集群 · 64 × GPU",
  "θ · QWEN3-4B · LoRA B·A": "θ · QWEN3-4B · LoRA B·A",
  "EVAL · 96 TASKS · PASS@1": "评估 · 96 个任务 · PASS@1",
  "SFT update": "SFT 更新",
  "rollout ↔ train": "采样 ↔ 训练",
  "search · θ frozen": "搜索 · θ 冻结",
  "Base checkpoint": "基础检查点",
  "SFT · LoRA": "SFT · LoRA",
  "GRPO": "GRPO",
  "GRPO · 4× thinking": "GRPO · 4× 思考",
  "Length-aware RL · 4×": "长度感知 RL · 4×",
  "base": "基础",
  "SFT": "SFT",
  "4× think": "4× 思考",
  "lean 4×": "精简 4×",
  "roles reassign per GPU, not per phase": "角色按 GPU 重新分配，而非按阶段",
  // base
  "EVAL · 96 HELD-OUT TASKS · ONE SAMPLE EACH": "评估 · 96 个留出任务 · 每题一次采样",
  "TOKENS PER ATTEMPT · SORTED · SOLVED IN ROSE": "每次尝试的 TOKEN 数 · 已排序 · 已解决为玫瑰色",
  "pass@1 = solved / 96 · held-out from every training stage": "pass@1 = 已解决 / 96 · 所有训练阶段均未见过",
  // sft
  "SFT TRACES · VERIFIED": "SFT 推理轨迹 · 已验证",
  "SFT TRACES": "SFT 推理轨迹",
  "read": "阅读",
  "decompose": "分解",
  "solve": "求解",
  "check": "检验",
  "W · FROZEN · ΔW = B·A": "W · 冻结 · ΔW = B·A",
  "TRAINABLE": "可训练",
  "OF": "共",
  "SHARE": "占比",
  "EVAL · BASE → SFT": "评估 · 基础 → SFT",
  // grpo
  "BATCH · 8 PROMPTS × G = 8 ROLLOUTS · VERIFIER-SCORED": "批次 · 8 个提示 × G = 8 次采样 · 验证器打分",
  "GROUP MEAN": "组均值",
  "MEAN": "均值",
  "BATCH · 8 × G = 8": "批次 · 8 × G = 8",
  "σ = 0 · dropped": "σ = 0 · 丢弃",
  "π · POLICY · RESHAPED BY Â": "π · 策略 · 由 Â 重塑",
  "no signal · dropped": "无信号 · 丢弃",
  "π · POLICY OVER REASONING PATHS · RESHAPED BY Â": "π · 推理路径上的策略 · 由 Â 重塑",
  "EVAL · SFT → GRPO": "评估 · SFT → GRPO",
  "answers got longer": "答案变长",
  "gained": "新增",
  "regressed": "退化",
  // fleet
  "COLOCATED · BARRIER PER STEP": "共置调度 · 每步同步屏障",
  "ELASTIC CELLS · ROLE PER GPU": "弹性单元 · 每 GPU 独立角色",
  "STEPS DONE": "已完成步数",
  "WALL CLOCK · MIN": "墙钟时间 · 分钟",
  "STEP TIME · MIN": "单步时间 · 分钟",
  "GPU BUSY": "GPU 利用率",
  "RL STEPS / HOUR": "RL 步数 / 小时",
  // think
  "θ · GRPO · FROZEN": "θ · GRPO · 冻结",
  "no weight update": "无权重更新",
  "SEARCH PER TASK · VERIFIER-SELECTED": "每任务搜索 · 验证器选择",
  "ALLOWANCE": "算力预算",
  "PASS@1 vs GPU-S / TASK · 1× 2× 4× 8×": "PASS@1 对比 GPU 秒 / 任务 · 1× 2× 4× 8×",
  "lean RL": "精简 RL",
  // lean
  "TOKENS PER TASK · 4× ALLOWANCE · GRPO (OUTLINE) → LENGTH-AWARE RL (FILLED)": "每任务 TOKEN · 4× 预算 · GRPO（轮廓）→ 长度感知 RL（实心）",
  "CHANGED TASKS": "变化任务",
  // audit
  "GAINED": "新增",
  "REGRESSED": "退化",
  "NET": "净变化",
  // frontier
  "GPU-SECONDS PER CORRECT ANSWER ← CHEAPER": "每个正确答案的 GPU 秒 ← 更省",
  "PASS@1 ↑": "PASS@1 ↑",
  "GPU-S / CORRECT": "GPU 秒 / 正确答案",
  "post-training ↑ pass@1": "后训练 ↑ pass@1",
  "serving ← GPU-s / correct": "推理服务 ← GPU 秒 / 正确答案",
  // runtime receipts
  "runtime": "运行时",
  "scheduling": "调度",
  "KV reuse": "KV 复用",
  "overlap": "重叠",
  "chunked prefill": "分块预填充",
  "speculation": "投机解码",
  "GPU-s / correct answer": "GPU 秒 / 正确答案",
  "p95 latency · 96 requests": "p95 延迟 · 96 个请求",
  "tokens skipped per prefix hit": "每次前缀命中跳过的 token",
  "4 decode steps · CPU/GPU overlap": "4 个解码步 · CPU/GPU 重叠",
  "longest stream stall": "最长输出停顿",
  "serial target passes · 12 tokens": "串行目标前向次数 · 12 个 token",
};

export function useTr() {
  const { lang } = useLanguage();
  return useCallback((s: string) => (lang === "zh" ? ZH[s] ?? s : s), [lang]);
}

export function useLang() {
  return useLanguage().lang;
}
