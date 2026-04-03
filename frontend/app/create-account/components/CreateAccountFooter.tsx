import Button from "@/app/components/ui/Button";

const primaryBtnClass =
  "w-full rounded-lg border-0 bg-[#1e2d3b]! py-2.5 text-sm font-semibold text-white! shadow-none hover:bg-[#1a2838]! focus:ring-2 focus:ring-[#1e2d3b]/40 focus:ring-offset-1";

type Props = {
  step: number;
  isLoading: boolean;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onRegister: () => void;
};

export default function CreateAccountFooter({
  step,
  isLoading,
  onSendOtp,
  onVerifyOtp,
  onRegister,
}: Props) {
  return (
    <div className="shrink-0 rounded-b-xl border-t border-slate-100 bg-white px-5 pt-4 pb-6 sm:px-6 md:px-7">
      {step === 1 && (
        <Button
          onClick={onSendOtp}
          isLoading={isLoading}
          className={primaryBtnClass}
          size="md"
        >
          Get Started
        </Button>
      )}
      {step === 2 && (
        <Button
          onClick={onVerifyOtp}
          isLoading={isLoading}
          className={primaryBtnClass}
          size="md"
        >
          Get Started
        </Button>
      )}
      {step === 3 && (
        <Button
          onClick={onRegister}
          isLoading={isLoading}
          className={primaryBtnClass}
          size="md"
        >
          Get Started
        </Button>
      )}
    </div>
  );
}
