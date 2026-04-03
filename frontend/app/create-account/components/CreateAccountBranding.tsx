export default function CreateAccountBranding() {
  return (
    <div className="flex min-h-0 shrink-0 flex-col items-center justify-between gap-4 overflow-hidden bg-transparent p-7 text-center md:flex-none md:basis-[49%] md:gap-5 md:p-10">
      <img
        src="/namelogo.svg"
        alt="NexLearn"
        className="mx-auto h-auto w-[min(220px,82%)] shrink-0 object-contain md:w-[min(260px,92%)]"
      />
      <img
        src="/create_form_sticker.svg"
        alt=""
        className="mx-auto w-full max-w-72 shrink-0 object-contain object-bottom max-h-52 md:max-h-64 md:max-w-80"
      />
    </div>
  );
}
