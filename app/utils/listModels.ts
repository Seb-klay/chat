export interface IModelList {
  id: number,
  model_name: string;
  address?: string;
}

export const MODELS: Record<number, IModelList> = {
  1: {
    id: 1,
    model_name: "llama3.2:3b",
    address: process.env.LLAMA3_URL!,
  },
  2: {
    id: 2,
    model_name: "tinyllama",
    address: process.env.TINYLLAMA_URL!,
  },
  3: {
    id: 3,
    model_name: "gemma3:4b",
    address: process.env.GEMMA3_URL!,
  },
  4: {
    id: 4,
    model_name: "qwen3-vl:2b",
    address: process.env.QWEN3_URL!,
  },
  5: {
    id: 5,
    model_name: "moondream:1.8b",
    address: process.env.MOONDREAM_URL!,
  },
};
