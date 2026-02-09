"use client";

//import Input from "./conversation/[id]/page"
import HomePage from "./homePage/page"
import { useTheme } from "../components/contexts/theme-provider";

export default function Home() {
  const { theme } = useTheme();

  return (
    <main style={{ backgroundColor: theme.colors.background }} >
      <HomePage></HomePage>
    </main>
  );
}