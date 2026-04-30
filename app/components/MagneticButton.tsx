'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface MagneticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function MagneticButton({ children, onClick, className }: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * 0.3
      const deltaY = (e.clientY - centerY) * 0.3

      gsap.to(btn, {
        x: deltaX,
        y: deltaY,
        duration: 0.4,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)'
      })
    }

    btn.addEventListener('mousemove', handleMouseMove)
    btn.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove)
      btn.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={`magnetic-btn ${className || ''}`}
    >
      {children}
    </button>
  )
}