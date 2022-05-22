import { memo } from 'react';

function AppPlaceholder() {
  function generatePlaceholder() {
    const component = [];
    for (let i = 0; i < 8; i++) {
      component.push(
        <div key={i} className="flex animate-pulse space-x-4">
          <div className="h-10 w-10 rounded-full bg-slate-200"></div>
          <div className="flex-1 space-y-3 py-2">
            <div className="h-2 w-40 rounded bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-2 rounded bg-slate-400"></div>
            </div>
          </div>
        </div>
      );
    }

    return component;
  }

  return <>{generatePlaceholder()}</>;
}

export default memo(AppPlaceholder);
