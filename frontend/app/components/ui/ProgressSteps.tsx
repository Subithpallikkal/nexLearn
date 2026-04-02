"use client";

import { Check } from "lucide-react";
import { clsx } from "clsx";

interface Step {
  id: number;
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={clsx("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-blue-600 border-blue-600",
                    isCurrent && "border-blue-600 bg-white",
                    !isCompleted && !isCurrent && "border-gray-300 bg-white"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={clsx(
                        "text-sm font-semibold",
                        isCurrent ? "text-blue-600" : "text-gray-400"
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                <span
                  className={clsx(
                    "mt-2 text-xs font-medium",
                    isCurrent ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    "flex-1 h-0.5 mx-4 mt-[-20px]",
                    isCompleted ? "bg-blue-600" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
