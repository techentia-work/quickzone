"use client";
import { useOutsideClick } from "@/hooks";
import React, { useEffect, useRef } from "react";

interface BaseModalProps {
  isOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function BaseModal({
  isOpen,
  closeModal,
  children,
  className = "",
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock body scroll
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  useOutsideClick(modalRef, closeModal, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex justify-center items-center overflow-hidden">
      <div
        ref={modalRef}
        className={`relative ${className} rounded-lg shadow-lg max-h-[90vh] overflow-hidden`}
        style={{ touchAction: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}