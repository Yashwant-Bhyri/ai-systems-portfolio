#!/usr/bin/env python3
"""Reproduce the bounded s1 AIME24 numeric fixture.

Dependencies:
  python >= 3.9
  pip install transformers

This script downloads only public HF JSONL samples and the pinned tokenizer
files. It does not load model weights or execute s1 repository code.

The thinking-token extraction mirrors the official s1 script:
  https://raw.githubusercontent.com/simplescaling/s1/77272c6e925d610257a50b520bad15330b513389/eval/compute_sample_stats.py

It prints the complete numeric fixture to stdout. Redirect stdout outside the
repository if a regenerated copy is needed.
"""

from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone

from transformers import AutoTokenizer


SOURCE_REPO = "https://github.com/simplescaling/s1"
SOURCE_SCRIPT = (
    "https://raw.githubusercontent.com/simplescaling/s1/"
    "77272c6e925d610257a50b520bad15330b513389/eval/compute_sample_stats.py"
)
TOKENIZER = "Qwen/Qwen2.5-32B-Instruct"
TOKENIZER_REVISION = "5ede1c97bbab6ce5cda5812749b4c0bdf79b18dd"
DATASET_REVISION = "91f0c2b0555f44a613c127da71defe781c63048c"
DATASET_BASE = (
    "https://huggingface.co/datasets/simplescaling/results/resolve/"
    f"{DATASET_REVISION}/"
)

RUNS = (
    {
        "id": "forcing1k",
        "label": "1k cap",
        "intervention": "cap",
        "samples": (
            "forcing1k/qfq__1k_qr_bt_dm_po/"
            "samples_aime24_nofigures_2025-01-19T19-53-37.520864.jsonl"
        ),
        "metadata": (
            "forcing1k/qfq__1k_qr_bt_dm_po/"
            "results_2025-01-19T19-53-37.520864.json"
        ),
    },
    {
        "id": "forcing2k",
        "label": "2k cap",
        "intervention": "cap",
        "samples": (
            "forcing2k/qfq__1k_qr_bt_dm_po/"
            "samples_aime24_nofigures_2025-01-19T19-49-41.959238.jsonl"
        ),
        "metadata": (
            "forcing2k/qfq__1k_qr_bt_dm_po/"
            "results_2025-01-19T19-49-41.959238.json"
        ),
    },
    {
        "id": "forcing4k",
        "label": "4k cap",
        "intervention": "cap",
        "samples": (
            "forcing4k/qfq__1k_qr_bt_dm_po/"
            "samples_aime24_nofigures_2025-01-19T20-00-01.490918.jsonl"
        ),
        "metadata": (
            "forcing4k/qfq__1k_qr_bt_dm_po/"
            "results_2025-01-19T20-00-01.490918.json"
        ),
    },
    {
        "id": "forcing8k",
        "label": "8k cap",
        "intervention": "cap",
        "samples": (
            "forcing8k/qfq__1k_qr_bt_dm_po/"
            "samples_aime24_nofigures_2025-01-19T07-13-06.088130.jsonl"
        ),
        "metadata": (
            "forcing8k/qfq__1k_qr_bt_dm_po/"
            "results_2025-01-19T07-13-06.088130.json"
        ),
    },
    {
        "id": "forcingignore4wait",
        "label": "Wait x4",
        "intervention": "wait",
        "samples": (
            "forcingignore4wait/qfq__1k_qr_bt_dm_po/"
            "samples_aime24_nofigures_2025-01-20T11-30-06.032968.jsonl"
        ),
        "metadata": (
            "forcingignore4wait/qfq__1k_qr_bt_dm_po/"
            "results_2025-01-20T11-30-06.032968.json"
        ),
    },
    {
        "id": "forcingignore6wait",
        "label": "Wait x6",
        "intervention": "wait",
        "samples": (
            "forcingignore6wait/qfq__1k_qr_bt_dm_po/"
            "samples_aime24_nofigures_2025-01-20T11-32-43.046324.jsonl"
        ),
        "metadata": (
            "forcingignore6wait/qfq__1k_qr_bt_dm_po/"
            "results_2025-01-20T11-32-43.046324.json"
        ),
    },
)


def read_jsonl(relative_path: str) -> list[dict]:
    url = DATASET_BASE + relative_path
    with urllib.request.urlopen(url) as response:
        text = response.read().decode("utf-8")
    return [json.loads(line) for line in text.splitlines() if line.strip()]


def extract_samples(records: list[dict], tokenizer) -> list[dict]:
    samples = []
    for record in records:
        response = record["filtered_resps"][0]
        if isinstance(response, list):
            response = response[0]

        thinking = "\n".join(
            response.split("<|im_start|>answer")[0].split("\n")[1:-1]
        )
        correct = int(record["exact_match"])
        if correct not in (0, 1):
            raise ValueError(f"Non-binary exact_match for doc {record['doc_id']}")

        samples.append(
            {
                "docId": record["doc_id"],
                "correct": correct,
                "thinkingTokens": len(tokenizer.tokenize(thinking)),
            }
        )
    return samples


def build_fixture() -> dict:
    tokenizer = AutoTokenizer.from_pretrained(
        TOKENIZER,
        revision=TOKENIZER_REVISION,
        use_fast=True,
    )

    runs = []
    stable_doc_ids = None
    for definition in RUNS:
        samples = extract_samples(
            read_jsonl(definition["samples"]),
            tokenizer,
        )
        doc_ids = [sample["docId"] for sample in samples]
        if len(samples) != 30:
            raise ValueError(
                f"{definition['id']} has {len(samples)} samples; expected 30"
            )
        if stable_doc_ids is None:
            stable_doc_ids = doc_ids
        elif doc_ids != stable_doc_ids:
            raise ValueError(
                f"{definition['id']} does not preserve the first run's docId order"
            )

        runs.append(
            {
                "id": definition["id"],
                "label": definition["label"],
                "intervention": definition["intervention"],
                "artifact": DATASET_BASE + definition["samples"],
                "metadataArtifact": DATASET_BASE + definition["metadata"],
                "n": len(samples),
                "correct": sum(sample["correct"] for sample in samples),
                "thinkingTokensSum": sum(
                    sample["thinkingTokens"] for sample in samples
                ),
                "samples": samples,
            }
        )

    return {
        "sourceRepo": SOURCE_REPO,
        "sourceScript": SOURCE_SCRIPT,
        "tokenizer": TOKENIZER,
        "tokenizerRevision": TOKENIZER_REVISION,
        "datasetRevision": DATASET_REVISION,
        "retrievedAt": datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
        "runs": runs,
    }


if __name__ == "__main__":
    print(json.dumps(build_fixture(), indent=2))
