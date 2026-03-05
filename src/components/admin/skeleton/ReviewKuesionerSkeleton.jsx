export default function ReviewKuesionerSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-2 w-full skeleton"></div>

        <div className="p-7 space-y-5">
          <div className="h-8 w-2/3 rounded skeleton"></div>

          <div className="space-y-2">
            <div className="h-4 w-full rounded skeleton"></div>
            <div className="h-4 w-5/6 rounded skeleton"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-16 rounded-lg skeleton"></div>
            <div className="h-16 rounded-lg skeleton"></div>
          </div>
        </div>
      </div>

      {/* QUESTIONS */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <div className="flex gap-4">

            <div className="w-8 h-8 rounded-full skeleton"></div>

            <div className="flex-1 space-y-5">
              <div className="h-5 w-3/4 rounded skeleton"></div>

              <div className="space-y-3">
                <div className="h-12 rounded-xl skeleton"></div>
                <div className="h-12 rounded-xl skeleton"></div>
                <div className="h-12 rounded-xl skeleton"></div>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}