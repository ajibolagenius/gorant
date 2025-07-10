"use client"

import { useState, useEffect } from "react"

export function useAccessibility() {
  const [fontSize, setFontSize] = useState("text-base")
  const [contrast, setContrast] = useState("normal")
  const [screenReaderMode, setScreenReaderMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Load accessibility preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem("accessibility_font_size")
    const savedContrast = localStorage.getItem("accessibility_contrast")
    const savedScreenReader = localStorage.getItem("accessibility_screen_reader")
    const savedReducedMotion = localStorage.getItem("accessibility_reduced_motion")

    if (savedFontSize) setFontSize(savedFontSize)
    if (savedContrast) setContrast(savedContrast)
    if (savedScreenReader) setScreenReaderMode(JSON.parse(savedScreenReader))
    if (savedReducedMotion) setReducedMotion(JSON.parse(savedReducedMotion))

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion && !savedReducedMotion) {
      setReducedMotion(true)
    }
  }, [])

  // Save accessibility preferences
  useEffect(() => {
    localStorage.setItem("accessibility_font_size", fontSize)
    localStorage.setItem("accessibility_contrast", contrast)
    localStorage.setItem("accessibility_screen_reader", JSON.stringify(screenReaderMode))
    localStorage.setItem("accessibility_reduced_motion", JSON.stringify(reducedMotion))

    // Apply contrast changes to document
    if (contrast === "high") {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add("reduce-motion")
    } else {
      document.documentElement.classList.remove("reduce-motion")
    }
  }, [fontSize, contrast, screenReaderMode, reducedMotion])

  const updateAccessibility = (setting: string, value: any) => {
    switch (setting) {
      case "fontSize":
        setFontSize(value)
        break
      case "contrast":
        setContrast(value)
        break
      case "screenReader":
        setScreenReaderMode(value)
        break
      case "reducedMotion":
        setReducedMotion(value)
        break
    }
  }

  return {
    fontSize,
    contrast,
    screenReaderMode,
    reducedMotion,
    updateAccessibility,
  }
}
