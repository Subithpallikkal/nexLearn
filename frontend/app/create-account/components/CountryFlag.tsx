type Props = { iso2: string; className?: string };

export default function CountryFlag({ iso2, className = "" }: Props) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso2}.png`}
      srcSet={`https://flagcdn.com/w80/${iso2}.png 2x`}
      alt=""
      width={24}
      height={18}
      loading="lazy"
      decoding="async"
      aria-hidden
      className={`inline-block h-4.5 w-6 shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/10 ${className}`}
    />
  );
}
