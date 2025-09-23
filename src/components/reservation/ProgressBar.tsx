import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  'Fecha y hora',
  'Información personal', 
  'Confirmación'
];

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-muted z-0">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center relative z-10">
              {/* Circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-150",
                  "border-2",
                  {
                    "bg-primary border-primary text-primary-foreground": isActive || isCompleted,
                    "bg-background border-muted text-muted-foreground": !isActive && !isCompleted
                  }
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* Label */}
              <span 
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-20 leading-tight",
                  {
                    "text-primary": isActive || isCompleted,
                    "text-muted-foreground": !isActive && !isCompleted
                  }
                )}
              >
                {stepLabels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};