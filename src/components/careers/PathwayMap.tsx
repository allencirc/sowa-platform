"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Badge, SectorBadge } from "@/components/ui/Badge";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Career } from "@/lib/types";
import Link from "next/link";

// ─── Colours per sector ────────────────────────────────────
const sectorColours: Record<string, { bg: string; border: string; text: string }> = {
  "Operations & Maintenance": { bg: "#0C2340", border: "#0C2340", text: "#ffffff" },
  "Marine Operations": { bg: "#1E6091", border: "#1E6091", text: "#ffffff" },
  Electrical: { bg: "#F59E0B", border: "#F59E0B", text: "#1A1A2E" },
  "Survey & Design": { bg: "#7C3AED", border: "#7C3AED", text: "#ffffff" },
  "Health, Safety & Environment": { bg: "#DC2626", border: "#DC2626", text: "#ffffff" },
  "Policy & Regulation": { bg: "#059669", border: "#059669", text: "#ffffff" },
  "Project Management": { bg: "#EA580C", border: "#EA580C", text: "#ffffff" },
};

const allSectors = Object.keys(sectorColours);

// ─── Layout positions by sector (hand-tuned for visual clarity) ──
const nodePositions: Record<string, { x: number; y: number }> = {
  // Operations & Maintenance — left column
  "onshore-wind-technician": { x: 0, y: 0 },
  "blade-technician": { x: 0, y: 160 },
  "offshore-wind-turbine-technician": { x: 0, y: 320 },
  "offshore-installation-manager": { x: 0, y: 500 },
  // Marine Operations — centre-left
  "marine-coordinator": { x: 350, y: 80 },
  "offshore-logistics-manager": { x: 350, y: 280 },
  // Survey & Design — centre
  "offshore-wind-data-analyst": { x: 660, y: 0 },
  "owe-project-engineer": { x: 660, y: 200 },
  // Electrical — centre-right
  "electrical-engineer-substations": { x: 660, y: 400 },
  // HSE — right
  "hse-advisor-offshore-wind": { x: 970, y: 80 },
  // Policy — right
  "consenting-and-environmental-specialist": { x: 970, y: 280 },
  // Project Management — right bottom
  "owe-commercial-manager": { x: 970, y: 440 },
};

// ─── Custom Node ──────────────────────────────────────────
type CareerNodeData = Record<string, unknown> & {
  career: Career;
  colours: { bg: string; border: string; text: string };
};

function CareerNode({ data }: NodeProps<Node<CareerNodeData>>) {
  const { career, colours } = data;
  const [hovered, setHovered] = useState(false);

  // Elevate the entire React Flow node wrapper when hovered so the tooltip
  // renders above all sibling nodes (which share the same z-plane).
  useEffect(() => {
    if (!hovered) return;
    // Walk up to the .react-flow__node wrapper that React Flow creates
    const nodeEl = document.querySelector(
      `.react-flow__node[data-id="${career.slug}"]`
    ) as HTMLElement | null;
    if (nodeEl) {
      nodeEl.style.zIndex = "1000";
      return () => {
        nodeEl.style.zIndex = "";
      };
    }
  }, [hovered, career.slug]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-3 !h-3" />

      <div
        className="rounded-lg px-4 py-3 shadow-md cursor-pointer transition-transform hover:scale-105 min-w-[200px] max-w-[240px]"
        style={{
          backgroundColor: colours.bg,
          borderLeft: `4px solid ${colours.border}`,
          color: colours.text,
        }}
      >
        <div className="text-sm font-semibold leading-tight">{career.title}</div>
        <div className="text-xs mt-1 opacity-75">{career.entryLevel}</div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 pointer-events-none">
          <h4 className="text-sm font-bold text-text-primary mb-1">
            {career.title}
          </h4>
          <p className="text-xs text-text-secondary mb-2 line-clamp-3">
            {career.description}
          </p>
          {career.salaryRange && (
            <p className="text-xs font-semibold text-secondary">
              {formatCurrency(career.salaryRange.min)} – {formatCurrency(career.salaryRange.max)}
            </p>
          )}
          <p className="text-[10px] text-text-muted mt-2">Click to view details</p>
        </div>
      )}
    </div>
  );
}

const nodeTypes = { career: CareerNode };

// ─── Inner Map (needs ReactFlowProvider context) ──────────
function PathwayMapInner({ careers }: { careers: Career[] }) {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set(allSectors));

  const toggleSector = useCallback((sector: string) => {
    setActiveSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) {
        if (next.size > 1) next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  }, []);

  const showAll = useCallback(() => {
    setActiveSectors(new Set(allSectors));
  }, []);

  const filteredCareers = useMemo(
    () => careers.filter((c) => activeSectors.has(c.sector)),
    [careers, activeSectors]
  );

  const filteredSlugs = useMemo(
    () => new Set(filteredCareers.map((c) => c.slug)),
    [filteredCareers]
  );

  const nodes: Node<CareerNodeData>[] = useMemo(
    () =>
      filteredCareers.map((career) => ({
        id: career.slug,
        type: "career",
        position: nodePositions[career.slug] ?? { x: 500, y: 300 },
        data: {
          career,
          colours: sectorColours[career.sector] ?? sectorColours["Operations & Maintenance"],
        },
      })),
    [filteredCareers]
  );

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    for (const career of filteredCareers) {
      for (const conn of career.pathwayConnections) {
        if (!filteredSlugs.has(conn.to)) continue;
        result.push({
          id: `${career.slug}-${conn.to}`,
          source: career.slug,
          target: conn.to,
          type: "default",
          animated: conn.type === "progression",
          style: {
            stroke: conn.type === "lateral" ? "#9CA3AF" : "#00A878",
            strokeWidth: 2,
            strokeDasharray: conn.type === "lateral" ? "6 4" : undefined,
          },
          label: conn.timeframe,
          labelStyle: { fontSize: 10, fill: "#6B7280" },
          labelBgStyle: { fill: "#F7F9FC", fillOpacity: 0.9 },
          labelBgPadding: [4, 2] as [number, number],
        });
      }
    }
    return result;
  }, [filteredCareers, filteredSlugs]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      router.push(`/careers/${node.id}`);
    },
    [router]
  );

  return (
    <div>
      {/* Sector filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={showAll}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer",
            activeSectors.size === allSectors.length
              ? "bg-primary text-white border-primary"
              : "bg-white text-text-secondary border-gray-200 hover:border-primary"
          )}
        >
          All Sectors
        </button>
        {allSectors.map((sector) => (
          <button
            key={sector}
            onClick={() => toggleSector(sector)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer",
              activeSectors.has(sector)
                ? "text-white border-transparent"
                : "bg-white text-text-secondary border-gray-200 hover:border-gray-400"
            )}
            style={
              activeSectors.has(sector)
                ? { backgroundColor: sectorColours[sector].bg, borderColor: sectorColours[sector].border }
                : undefined
            }
          >
            {sector}
          </button>
        ))}
      </div>

      {/* React Flow canvas */}
      <div
        className="h-[520px] rounded-xl border border-gray-200 bg-white overflow-hidden"
        role="img"
        aria-label="Interactive career pathway map showing connections between offshore wind energy roles. Use the list below on mobile for an accessible version."
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e5e7eb" gap={24} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-white !border-gray-200 !shadow-md !rounded-lg"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-3 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-secondary" />
          <span>Progression</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-gray-400" />
          <span>Lateral move</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Fallback ──────────────────────────────────────
function MobileFallback({ careers }: { careers: Career[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Career[]>();
    for (const c of careers) {
      const list = map.get(c.sector) ?? [];
      list.push(c);
      map.set(c.sector, list);
    }
    return map;
  }, [careers]);

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([sector, items]) => (
        <div key={sector}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: sectorColours[sector]?.bg }}
            />
            <h3 className="text-sm font-semibold text-text-primary">{sector}</h3>
          </div>
          <div className="space-y-2 pl-5">
            {items.map((career) => (
              <div key={career.slug}>
                <Link
                  href={`/careers/${career.slug}`}
                  className="group flex items-start gap-3 p-3 rounded-lg bg-surface-card border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {career.title}
                      </span>
                      <Badge variant="default">{career.entryLevel}</Badge>
                    </div>
                    {career.salaryRange && (
                      <p className="text-xs text-text-muted">
                        {formatCurrency(career.salaryRange.min)} – {formatCurrency(career.salaryRange.max)}
                      </p>
                    )}
                    {career.pathwayConnections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {career.pathwayConnections.map((conn) => (
                          <span
                            key={conn.to}
                            className="inline-flex items-center text-[10px] text-text-muted"
                          >
                            <ChevronRight className="h-3 w-3" />
                            {conn.to.replace(/-/g, " ")}
                            <span className="ml-1 text-secondary">({conn.timeframe})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted shrink-0 mt-1 group-hover:text-primary transition-colors" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Exported Component ──────────────────────────────────
export function PathwayMap({ careers }: { careers: Career[] }) {
  return (
    <>
      {/* Desktop: React Flow */}
      <div className="hidden md:block">
        <ReactFlowProvider>
          <PathwayMapInner careers={careers} />
        </ReactFlowProvider>
      </div>

      {/* Mobile: grouped list */}
      <div className="md:hidden">
        <MobileFallback careers={careers} />
      </div>
    </>
  );
}
