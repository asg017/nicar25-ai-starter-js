# NICAR25: AI Starter Pack in JavaScript for Data Journalism

This repo contains the code and tipsheet for the [*"AI starter pack: JavaScript"*](https://schedules.ire.org/nicar-2025/index.html#1175) class at [NICAR25](https://www.ire.org/training/conferences/nicar-2025/), happening on Friday March 7,  @ 2:15pm.


[SLIDES](https://docs.google.com/presentation/d/1bFHQg6DAoiKJ7G_yGF2mM1X3WWtN6tTGQMbZuvg2678/edit?usp=sharing)

## Part 1: Embeddings

- [Simon Willison Embeddings Talk](https://www.youtube.com/watch?time_continue=50&v=ArnMdc-ICCM&source_ve_path=MjM4NTE)
- Embeddings inference:
  - [Ollama](https://ollama.com/)
  - [transformers.js](https://huggingface.co/docs/transformers.js/en/index)
  - [llama.cpp](https://github.com/ggml-org/llama.cpp)
  - [sqlite-lembed](https://github.com/asg017/sqlite-lembed)
- Datasets:
  - [NBC News Headlines Scraper](https://github.com/asg017/nbc-headlines-scraper)
  - [NICAR25 Schedule](https://schedules.ire.org/nicar-2025/), w/ JSON
- [sqlite-vec](https://github.com/asg017/sqlite-vec)
  - [`sqlite-vec` embedding visualizer demo](https://observablehq.com/d/04bc1c1b0de9db7c)
- Additional links
  - [Nomic Atlas](https://atlas.nomic.ai/) (embeddings visualization tool, product)
  - [Latent Scopes](https://github.com/enjalot/latent-scope) (embedding visualization tool, open source)

Embeddings models I recommend (local-only)

| Name                                                                                                        | #Dimensions | Release Date    |
| ----------------------------------------------------------------------------------------------------------- | ----------- | --------------- |
| [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)   | 384         | ~August 2021    |
| [`mixedbread-ai/mxbai-embed-xsmall-v1`](https://huggingface.co/mixedbread-ai/mxbai-embed-xsmall-v1)         | 384         | ~September 2024 |
| [`nomic-ai/nomic-embed-text-v1.5`](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5)                   | 768         | ~February 2024  |
| [`Snowflake/snowflake-arctic-embed-m-v2.0`](https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0) | 768         | ~December 2024  |

## Part 2: Structured Output Generation

- [Derek Willis "LLM Extraction Challenge"](https://thescoop.org/archives/2025/01/27/llm-extraction-challenge-fundraising-emails/index.html) ([Repository](https://github.com/dwillis/LLM-Extraction-Challenge))
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [OpenAI's Structured Output Guide](https://platform.openai.com/docs/guides/structured-outputs)


Small, **local** LLMs I recommend for trying structred output generation:

- [`microsoft/Phi-4-mini-instruct`](https://huggingface.co/microsoft/Phi-4-mini-instruct)
- [`meta-llama/Llama-3.2-3B`](https://huggingface.co/meta-llama/Llama-3.2-3B)
- [`google/gemma-2-2b`](https://huggingface.co/google/gemma-2-2b)
- [`mistralai/Mistral-Small-24B-Instruct-2501`](https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501)

## Running yourself

Download the following software:
- [Node.js](https://nodejs.org/en/download)
- [Ollama](https://ollama.com/download)
- VS Code, with Jupyter notebooks

```bash
# step 1: `git clone` this repository
git clone https://github.com/asg017/nicar25-ai-starter-js.git


# step 2: with ollama installed, run:
ollama pull all-minilm
```

Open the `nicar25-ai-starter-js` folder in VS Code. Then in the terminal inside VS Code, run:

```bash
npm install
npm run download
```

And you should be set!