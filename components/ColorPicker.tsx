"use client";
import { useState } from 'react';
import { ColorTheme } from '../lib/theme';
import { colorThemes, themeCategories } from '../config/themes';
import { Button } from "@/components/ui/button"

interface ColorPickerProps {
  currentTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
  variant?: 'floating' | 'header';
}

export function ColorPicker({ currentTheme, onThemeChange, variant = 'floating' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(currentTheme.category);

  const filteredThemes = colorThemes.filter(theme => theme.category === activeCategory);

  const containerClass = variant === 'header'
    ? "relative"
    : "color-picker-container fixed bottom-30 right-30 z-100";

  const panelClass = variant === 'header'
    ? "absolute top-full right-0 mt-2"
    : "fixed bottom-100 right-30";

  // Function to get the right background for preview
  const getPreviewBackground = (theme: ColorTheme) => {
    // Add image theme support
    if (theme.category === 'image' && theme.backgroundImage) {
      return `url('${theme.backgroundImage}')`;
    }
    if (theme.category === 'gradient') {
      // For gradient themes, show the actual gradient background
      return theme.background;
    }
    // For other themes, use the card background
    return theme.cardBackground;
  };

  // Function to determine if we need glass effect
  const needsGlassEffect = (theme: ColorTheme) => {
    return theme.category === 'gradient' && theme.cardBackground.includes('rgba');
  };

  return (
    <div className={containerClass}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3"
        style={{
          backgroundColor: "transparent",
          borderColor: currentTheme.cardBorder,
          color: currentTheme.digitColor
        }}
        aria-label="Change theme colors"
      >
        Theme
      </Button>

      {/* Color Picker Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className={`${panelClass} w-80 max-h-96 rounded-xl shadow-2xl overflow-hidden z-50 transition-all duration-300`}
            style={{
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.cardBorder}`,
              boxShadow: currentTheme.shadow,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            {/* Category Tabs - Dynamic Theming */}
            <div 
              className="flex border-b"
              style={{
                backgroundColor: `${currentTheme.cardBorder}10`,
                borderBottomColor: currentTheme.cardBorder
              }}
            >
              {themeCategories.map((category) => (
                <button
                  key={category.id}
                  className={`flex-1 p-3 text-xs font-medium transition-all duration-200 ${
                    activeCategory === category.id 
                      ? 'border-b-2' 
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    color: activeCategory === category.id 
                      ? currentTheme.digitColor 
                      : `${currentTheme.separatorColor}80`,
                    backgroundColor: activeCategory === category.id 
                      ? currentTheme.background 
                      : 'transparent',
                    borderBottomColor: activeCategory === category.id 
                      ? currentTheme.digitColor 
                      : 'transparent'
                  }}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm">{category.icon}</span>
                    <span className="hidden sm:block">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Theme Grid */}
            <div className="p-4 grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {filteredThemes.map((theme) => (
                <button
                  key={theme.id}
                  className={`h-16 rounded-lg transition-all duration-200 text-center border-2 hover:scale-105 relative overflow-hidden ${
                    currentTheme.id === theme.id 
                      ? 'ring-2 ring-offset-2' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    onThemeChange(theme);
                    setIsOpen(false);
                  }}
                  style={{
                    background: getPreviewBackground(theme),
                    // Add backgroundSize for image themes
                    ...(theme.category === 'image' && theme.backgroundImage && {
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }),
                    borderColor: currentTheme.id === theme.id ? theme.digitColor : theme.cardBorder,
                    color: theme.digitColor,
                    ...(currentTheme.id === theme.id && {
                      ringColor: theme.digitColor,
                      ringOffsetColor: currentTheme.background
                    }),
                    ...(needsGlassEffect(theme) && {
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    })
                  }}
                >
                  {/* Glass overlay for gradient themes */}
                  {theme.category === 'gradient' && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundColor: theme.cardBackground,
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)'
                      }}
                    />
                  )}
                  
                  {/* Content - Only show for non-image themes */}
                  {theme.category !== 'image' && (
                    <div className="relative z-10">
                      <div className="mb-2">
                        <span className="text-2xl font-bold">Aa</span>
                      </div>
                      <div className="text-xs font-medium opacity-90">
                        {theme.name}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
