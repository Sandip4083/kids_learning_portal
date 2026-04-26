"use client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { GameProvider } from "@/contexts/GameContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { EngagementProvider } from "@/contexts/EngagementContext";
import { ParentProvider } from "@/contexts/ParentContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function ClientProviders({ children }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AccessibilityProvider>
          <SoundProvider>
            <GameProvider>
              <EngagementProvider>
                <ParentProvider>
                  {children}
                </ParentProvider>
              </EngagementProvider>
            </GameProvider>
          </SoundProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
