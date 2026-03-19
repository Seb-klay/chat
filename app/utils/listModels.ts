export interface IModelList {
  id: number,
  model_name: string;
}

export const MODELS: Record<number, IModelList> = {
  1: {
    id: 1,
    model_name: "deepseek-r1:7b",
  },
  2: {
    id: 2,
    model_name: "qwen3.5:9b",
  }
};
