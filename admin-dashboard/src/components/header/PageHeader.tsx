"use client";

import React from "react";

// Reusable Header Component
export interface PageHeaderProps {
  title: string;
  subtitle?: string;

  /** New preferred way (CTA button etc.) */
  action?: React.ReactNode;

  /** Backward compatibility (existing pages) */
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right (CTA area) */}
        {(action || children) && (
          <div className="flex items-center gap-3">
            {action ?? children}
          </div>
        )}
      </div>
    </div>
  );
}
