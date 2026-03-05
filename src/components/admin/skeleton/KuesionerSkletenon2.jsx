export const KuesionerSkeleton1 = () => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full animate-pulse">
            {/* Top Row Skeleton */}

            <div className="flex justify-between items-start mb-4">
                <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                    <div className="h-5 w-5 bg-slate-200 rounded-md"></div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="mb-4 flex-grow">
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                </div>
            </div>

            {/* Tipe Badge Skeleton */}
            <div className="mb-4">
                <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
            </div>

            {/* Main Button Skeleton */}
            <div className="h-9 w-full bg-slate-200 rounded-lg mb-3"></div>

            {/* Action Buttons Skeleton */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                <div className="h-8 bg-slate-100 rounded-lg"></div>
                <div className="h-8 bg-slate-100 rounded-lg"></div>
                <div className="h-8 bg-slate-100 rounded-lg"></div>
            </div>
        </div>
    );
};

export const StatistikSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border-b-4 border-slate-100 shadow-sm">
                <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 w-12 bg-slate-200 rounded"></div>
            </div>
        ))}
    </div>
);

export const ToolbarSkeleton = () => (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 animate-pulse">
        {/* Tombol Tambah Skeleton */}
        <div className="h-10 w-44 bg-slate-200 rounded-lg"></div>
        
        {/* Filter Group Skeleton */}
        <div className="flex flex-col md:flex-row bg-slate-100 p-1 rounded-xl gap-1">
            <div className="flex bg-white/50 p-1 rounded-lg gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-16 md:w-20 bg-slate-200 rounded-lg"></div>
                ))}
            </div>
            <div className="h-10 w-full md:w-40 bg-slate-200 rounded-lg"></div>
        </div>
    </div>
);