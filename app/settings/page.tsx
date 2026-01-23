"use client";

import {
  Cog6ToothIcon,
  CpuChipIcon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { MODELS } from "../utils/listModels";

export default function Settings() {
  const [selectedModelId, setSelectedModelId] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Handle model selection
  const handleModelSelect = (modelId: number) => {
    if (modelId !== selectedModelId) {
      setSelectedModelId(modelId);
      const selectedModel = MODELS[modelId];
      showToastMessage(`Switched to ${selectedModel.model_name} model`);
    }
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
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
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-gray-100 p-4 md:p-8 transition-all duration-300 font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-gray-100 px-4 py-3 rounded-lg shadow-lg border border-slate-700 transition-all duration-300 transform translate-y-0 opacity-100 z-50 backdrop-blur-sm">
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
          <p className="text-gray-400 mt-2">
            Configure your AI models and appearance preferences
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Model Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Model Selection Card */}
            <div className="rounded-2xl p-6 bg-slate-800/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CpuChipIcon className="h-5 w-5 text-blue-400" />
                  AI Model Selection
                </h2>
                <span className="text-xs bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full">
                  Active Models: {Object.keys(MODELS).length}
                </span>
              </div>

              <p className="text-gray-400 mb-6">
                The selected model will be your default model.
              </p>

              {/* Model List */}
              <div className="space-y-4">
                {Object.values(MODELS).map((model) => {
                  const isSelected = model.id === selectedModelId;
                  return (
                    <div
                      key={model.id}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        isSelected
                          ? "bg-blue-900/20 border border-blue-500/40"
                          : "bg-slate-800/40 hover:bg-slate-800/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-6 justify-between">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Model</p>
                          <p className="font-semibold">
                            {model.model_name.split(":")[0] || "N/A"}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-400">Parameters</p>
                          <p className="font-semibold">
                            {model.model_name.split(":")[1] || "N/A"}
                          </p>
                        </div>

                        <button
                          onClick={() => handleModelSelect(model.id)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                            isSelected
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-slate-700 hover:bg-slate-600 text-gray-100"
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
            <div className="rounded-2xl p-6 bg-slate-800/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                Current Selection
              </h2>
              <div className="py-4 rounded-xl bg-slate-800/50">
                <p className="text-gray-300 font-medium">
                  {MODELS[selectedModelId]?.model_name.split(":")[0]}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Parameters:{" "}
                  {MODELS[selectedModelId]?.model_name.split(":")[1]}
                </p>
              </div>
              <div className="mt-2 pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400">
                  You can also change model during conversation.
                </p>
              </div>
            </div>

            {/* Theme Toggle Card */}
            <div className="rounded-2xl p-6 bg-slate-800/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <SwatchIcon className="h-5 w-5 text-purple-400" />
                Appearance
              </h2>

              <div className="space-y-4">
                <p className="text-gray-400">
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
                      <p className="text-sm text-gray-400 dark:text-gray-300">
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
                      onChange={toggleTheme}
                      disabled
                    />
                    <label
                      htmlFor="theme-toggle"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-14 h-8 rounded-full bg-slate-800/70 dark:bg-gray-200/70 backdrop-blur-md border border-white/10 dark:border-gray-700/50"></div>
                        <div
                          className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 ${
                            isDarkMode ? "left-7" : "left-1"
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <p className="text-sm text-gray-400">
                  <i className="fas fa-sync-alt mr-2"></i>
                  Soon available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
