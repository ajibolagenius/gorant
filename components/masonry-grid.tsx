"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface MasonryGridProps {
    children: React.ReactNode[]
    columns?: number
    gap?: number
    className?: string
}

const MasonryGridComponent = ({ children, columns = 3, gap = 16, className }: MasonryGridProps) => {
    const [columnHeights, setColumnHeights] = useState<number[]>([])
    const [itemPositions, setItemPositions] = useState<{ top: number; left: number; width: number }[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])

    // Responsive columns
    const getColumns = () => {
        if (typeof window === "undefined") return columns
        const width = window.innerWidth
        if (width < 640) return 1
        if (width < 1024) return 2
        return columns
    }

    const [currentColumns, setCurrentColumns] = useState(getColumns())

    useEffect(() => {
        const handleResize = () => {
            setCurrentColumns(getColumns())
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [columns])

    useEffect(() => {
        const calculateLayout = () => {
            if (!containerRef.current) return

            const containerWidth = containerRef.current.offsetWidth
            const columnWidth = (containerWidth - gap * (currentColumns - 1)) / currentColumns
            const heights = new Array(currentColumns).fill(0)
            const positions: { top: number; left: number; width: number }[] = []

            itemRefs.current.forEach((item, index) => {
                if (!item) return

                // Find the shortest column
                const shortestColumnIndex = heights.indexOf(Math.min(...heights))
                const left = shortestColumnIndex * (columnWidth + gap)
                const top = heights[shortestColumnIndex]

                positions[index] = {
                    top,
                    left,
                    width: columnWidth,
                }

                // Update column height
                heights[shortestColumnIndex] += item.offsetHeight + gap
            })

            setColumnHeights(heights)
            setItemPositions(positions)

            // Set container height
            if (containerRef.current) {
                containerRef.current.style.height = `${Math.max(...heights)}px`
            }
        }

        // Use ResizeObserver to recalculate when items change size
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(calculateLayout, 100) // Small delay to ensure DOM updates
        })

        itemRefs.current.forEach((item) => {
            if (item) resizeObserver.observe(item)
        })

        calculateLayout()

        return () => {
            resizeObserver.disconnect()
        }
    }, [children, currentColumns, gap])

    return (
        <div ref={containerRef} className={cn("relative w-full overflow-x-auto", className)} style={{ minHeight: "120px" }} role="list">
            {children.map((child, index) => (
                <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className="absolute transition-all duration-300 ease-in-out"
                    style={{
                        top: itemPositions[index]?.top || 0,
                        left: itemPositions[index]?.left || 0,
                        width: itemPositions[index]?.width || "100%",
                        transform: itemPositions[index] ? "translateZ(0)" : "translateY(20px)",
                        opacity: itemPositions[index] ? 1 : 0,
                    }}
                    role="listitem"
                >
                    {child}
                </div>
            ))}
        </div>
    )
}

export const MasonryGrid = React.memo(MasonryGridComponent)
