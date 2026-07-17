# opencode-go Models

Last refreshed: 2026-07-17

Source: `opencode models opencode-go --refresh --verbose`

- `opencode-go/deepseek-v4-flash` - Fast, low-cost text-only DeepSeek V4 variant with 1M context; best default for cheap coding and reasoning runs.
- `opencode-go/deepseek-v4-pro` - Stronger text-only DeepSeek V4 variant with 1M context; use for harder coding and reasoning when cost matters less.
- `opencode-go/glm-5.2` - Zhipu text-only long-context model with 1M context; useful for large code or text-heavy analysis.
- `opencode-go/grok-4.5` - xAI reasoning model with text and image input and 500K context; useful for multimodal coding and analysis.
- `opencode-go/kimi-k3` - Moonshot multimodal reasoning model with 1M context; useful for long-context work over text, images, and video.
- `opencode-go/mimo-v2.5` - Xiaomi low-cost multimodal model with 1M context; useful for broad, cheap agent runs over text, images, audio, or video.
- `opencode-go/mimo-v2.5-pro` - Xiaomi Pro text-only model with 1M context; use for heavier coding or reasoning than base MiMo.
- `opencode-go/minimax-m3` - MiniMax multimodal model with 1M context; a balanced agent-worker option for text, image, and video inputs.
- `opencode-go/qwen3.7-max` - Alibaba's stronger Qwen3.7 agent model with 1M text-only context; use for harder planning, coding, and tool-use reasoning.
- `opencode-go/qwen3.7-plus` - Cost-effective Qwen3.7 model with text and image input; use for everyday coding, productivity, and vision-language tasks.

Reference sources:

- OpenCode Data catalogs: [DeepSeek](https://opencode.ai/data/deepseek), [Zhipu](https://opencode.ai/data/zhipuai), [xAI](https://opencode.ai/data/xai), [Moonshot](https://opencode.ai/data/moonshot), [Xiaomi](https://opencode.ai/data/xiaomi), [MiniMax](https://opencode.ai/data/minimax), and [Qwen](https://opencode.ai/data/qwen)
