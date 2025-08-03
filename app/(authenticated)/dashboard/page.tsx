"use client";

import { Charts } from "./_components/charts/charts";
import { Kpis } from "./_components/kpis";

export default function Page() {
  return (
    <div>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
        <Kpis />
      </div>
      <div className="mt-4 grid lg:grid-cols-2 grid-cols-1 gap-4">
        <Charts />
      </div>
    </div>
  );
}
