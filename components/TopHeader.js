import Image from "next/image";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="h-24 px-6 lg:px-10 flex items-center justify-center">
        <Image
          src="/logo-text.png"
          alt="EnVoiture"
          width={320}
          height={80}
          className="h-auto w-auto max-w-[220px] lg:max-w-[320px]"
          priority
        />
      </div>
    </header>
  );
}