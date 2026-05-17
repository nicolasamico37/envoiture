export default function Card({
  title,
  children,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[32px] shadow-sm p-5 lg:p-8">
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900">
            {title}
          </h1>
        </div>
      )}

      {children}
    </div>
  );
}