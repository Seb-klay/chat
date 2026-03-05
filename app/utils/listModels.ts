export interface IModelList {
  id: number,
  model_name: string;
}

export const MODELS: Record<number, IModelList> = {
  1: {
    id: 1,
    model_name: "llama3.2:3b",
  },
  2: {
    id: 2,
    model_name: "tinyllama",
  },
  3: {
    id: 3,
    model_name: "gemma3:4b",
  },
  4: {
    id: 4,
    model_name: "qwen3-vl:2b",
  },
  5: {
    id: 5,
    model_name: "moondream:1.8b",
  },
};
