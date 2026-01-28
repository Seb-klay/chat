"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IModelList, MODELS } from "../../utils/listModels";
import { getUserSettings, updateUserSettings } from "@/app/service";

interface ModelContextType {
  selectedModel: IModelList;
  setSelectedModel: (model: IModelList) => void;
  allModels: IModelList[];
  updateModel: (model: IModelList) => void;
  isLoading: boolean;
}

const defaultSelectedModel: ModelContextType = {
  selectedModel: MODELS[1],
  setSelectedModel: () => {},
  allModels: Object.values(MODELS),
  updateModel: () => {},
  isLoading: true,
};

const ModelContext = createContext<ModelContextType>(defaultSelectedModel);

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  // By default, always first model in the list
  const [selectedModel, setSelectedModel] = useState<IModelList>(MODELS[1]);
  const [isLoading, setIsLoading] = useState(true);
  const allModels = Object.values(MODELS);

  const updateModel = async (newModel: IModelList) => {
    setSelectedModel(newModel); // Update UI immediately (Optimistic)

    // Update DB in the background
    await updateUserSettings(null, newModel);
  };

  useEffect(() => {
    async function fetchDefaultModel() {
      try {
        const response = await getUserSettings();
        if (!response) throw new Error("User settings could not be loaded.");
        const { defaultmodel } = await response.json();
        const model = JSON.parse(defaultmodel);
        // match the ID from DB with local MODELS
        const modelOfUser = MODELS[model.id];

        if (modelOfUser) {
          setSelectedModel(modelOfUser);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDefaultModel();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        allModels,
        updateModel,
        isLoading,
      }}
    >
      {/* Prevent rendering children until model is loaded to avoid UI jumps */}
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => useContext(ModelContext);
