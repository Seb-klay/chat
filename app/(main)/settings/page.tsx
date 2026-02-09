"use client";

import {
  Cog6ToothIcon,
  CpuChipIcon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTheme } from "../../components/contexts/theme-provider";
import { useModel } from "../../components/contexts/model-provider";

export default function Settings() {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const { theme, mode, toggleTheme } = useTheme();
  const isDarkMode = mode === 'dark';
  const { selectedModel, allModels, updateModel } = useModel();

  // Handle model selection
  const handleModelSelect = (modelId: number) => {
    if (modelId !== selectedModel.id) {
      const newModel = allModels.find(m => m.id === modelId);
    
      if (newModel) {
        updateModel(newModel);
        showToastMessage(`Switched to ${newModel.model_name}`);
      }
    }
  };

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: theme.colors.background, color: theme.colors.primary}} className="flex flex-col h-dvh p-4 md:p-8 transition-all duration-300 font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div  style={{backgroundColor: theme.colors.tertiary_background}} className="fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg border border-slate-700 transition-all duration-300 transform translate-y-0 opacity-100 z-50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <i className="fas fa-check-circle text-green-400"></i>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cog6ToothIcon className="h-5 w-5 text-blue-400" />
            Settings
          </h1>
          <p style={{color: theme.colors.secondary}} className="mt-2">
            Configure your AI models and appearance preferences
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Model Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Model Selection Card */}
            <div style={{backgroundColor: theme.colors.background_second}} className="rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CpuChipIcon className="h-5 w-5 text-blue-400" />
                  AI Model Selection
                </h2>
                <span className="text-xs bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full">
                  Active Models: {allModels.length}
                </span>
              </div>

              <p style={{color: theme.colors.secondary}} className="mb-6">
                The selected model will be your default model.
              </p>

              {/* Model List */}
              <div className="space-y-4">
                {allModels.map((model) => {
                  const isSelected = model.id === selectedModel.id;
                  return (
                    <div
                      key={model.id}
                      style={{
                        backgroundColor: isSelected 
                          ? theme.colors.tertiary_background
                          : "transparent",
                      }}
                      className={`p-4 rounded-xl transition-all duration-300`}
                    >
                      <div className="flex items-center gap-6 justify-between">
                        <div className="text-center">
                          <p style={{color: theme.colors.secondary}} className="text-sm">Model</p>
                          <p className="font-semibold">
                            {model.model_name.split(":")[0] || "N/A"}
                          </p>
                        </div>

                        <div className="text-center">
                          <p style={{color: theme.colors.secondary}} className="text-sm">Parameters</p>
                          <p className="font-semibold">
                            {model.model_name.split(":")[1] || "N/A"}
                          </p>
                        </div>

                        <button
                          onClick={() => handleModelSelect(model.id)}
                          className={`text-gray-100 px-4 py-2 rounded-lg transition-all duration-300 ${
                            isSelected
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-slate-700 hover:bg-slate-600"
                          }`}
                        >
                          {isSelected ? <>Selected</> : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Theme Settings */}
          <div className="space-y-6">
            {/* Selected Model Info */}
            <div style={{backgroundColor: theme.colors.background_second}} className="rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                Current Selection
              </h2>
              <div className="py-2">
                <p className="font-medium">
                  {selectedModel.model_name.split(":")[0]}
                </p>
                <p style={{color: theme.colors.secondary}} className="text-sm mt-1">
                  Parameters:{" "}
                  {selectedModel.model_name.split(":")[1] || " - "}
                </p>
              </div>
              <div className="mt-2 pt-4 border-t border-gray-700/50">
                <p style={{color: theme.colors.secondary}} className="text-sm">
                  You can also switch model during conversation.
                </p>
              </div>
            </div>

            {/* Theme Toggle Card */}
            <div style={{backgroundColor: theme.colors.background_second}} className="rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <SwatchIcon className="h-5 w-5 text-purple-400" />
                Appearance
              </h2>

              <div className="space-y-4">
                <p style={{color: theme.colors.secondary}}>
                  Choose between light and dark mode for the interface.
                </p>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between mt-8 p-4 rounded-xl bg-slate-900/50 dark:bg-gray-100/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${isDarkMode ? "bg-slate-800" : "bg-gray-200"}`}
                    >
                      {isDarkMode ? (
                        <MoonIcon
                          className={`h-5 w-5 ${isDarkMode ? "text-yellow-300" : "text-indigo-200"}`}
                        />
                      ) : (
                        <SunIcon
                          className={`h-5 w-5 ${isDarkMode ? "text-yellow-200" : "text-yellow-500"}`}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {isDarkMode ? "Dark Mode" : "Light Mode"}
                      </h3>
                      <p style={{color: theme.colors.secondary}} className="text-sm">
                        {isDarkMode
                          ? "For the night owls."
                          : "Brighter interface."}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="theme-toggle"
                      className="sr-only"
                      checked={isDarkMode}
                      onChange={() => { toggleTheme(!isDarkMode) }}
                    />
                    <label
                      htmlFor="theme-toggle"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-14 h-8 rounded-full bg-slate-800/70 dark:bg-gray-200/70 backdrop-blur-md border border-white/10 dark:border-gray-700/50"></div>
                        <div
                          className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 ${
                            isDarkMode ? "left-7" : "left-1"
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
