"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface ApiMetrics {
  totalRequests: number;
  requestsToday: number;
  avgResponseTime: number;
  successRate: number;
  usageData: Array<{ date: string; count: number }>;
}

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ApiMetrics>({
    totalRequests: 0,
    requestsToday: 0,
    avgResponseTime: 0,
    successRate: 0,
    usageData: [],
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [showNewKey, setShowNewKey] = useState(false);
  const [fullKeys, setFullKeys] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchApiKeys();
    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });
      if (response.ok) {
        const createdKey = await response.json();
        setNewlyCreatedKey(createdKey.key);
        // Store the full key so we can show it later
        setFullKeys((prev) => new Map(prev).set(createdKey.id, createdKey.key));
        setShowCreateModal(false);
        setFormData({ name: "" });
        setShowKeyModal(true);
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    try {
      const response = await fetch(`/api/api-keys/${editingKey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });
      if (response.ok) {
        setEditingKey(null);
        setFormData({ name: "" });
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Failed to update API key:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKey(key);
    setFormData({ name: key.name });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingKey(null);
    setFormData({ name: "" });
  };

  const closeKeyModal = () => {
    setShowKeyModal(false);
    setNewlyCreatedKey(null);
    setShowNewKey(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return "•".repeat(key.length);
    return key.substring(0, 8) + "•".repeat(key.length - 12) + key.substring(key.length - 4);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const getChartData = () => {
    const data = metrics.usageData || [];
    if (data.length === 0) {
      // Return empty data for 7 days
      const emptyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyData.push({ date: date.toISOString().split('T')[0], count: 0 });
      }
      return emptyData;
    }
    return data;
  };

  const getMaxValue = () => {
    const data = getChartData();
    const max = Math.max(...data.map(d => d.count), 1);
    return Math.ceil(max / 500) * 500; // Round up to nearest 500
  };

  const getChartPoints = () => {
    const data = getChartData();
    const maxValue = getMaxValue();
    const width = 720; // 760 - 40 (margins)
    const height = 160; // 180 - 20 (margins)
    const pointCount = data.length;
    const stepX = width / (pointCount - 1 || 1);

    return data.map((point, index) => {
      const x = 40 + index * stepX;
      const y = 180 - (point.count / maxValue) * height;
      return { x, y, count: point.count };
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 shadow-lg dark:bg-zinc-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-white">Copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Phine</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <Link
              href="/dashboards"
              className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 px-3 py-2.5 text-sm font-medium text-purple-700 transition-colors dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Overview
            </Link>
            <button
              disabled
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors cursor-not-allowed dark:text-zinc-600"
              title="Coming soon"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              API Playground
            </button>
            <button
              disabled
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors cursor-not-allowed dark:text-zinc-600"
              title="Coming soon"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 8l7-5 7 5M5 21v-4m0 4h14M9 3v4m6-4v4M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8M9 19v-6m6 6v-6" />
              </svg>
              Use Cases
            </button>
            <button
              disabled
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors cursor-not-allowed dark:text-zinc-600"
              title="Coming soon"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Billing
            </button>
            <button
              disabled
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors cursor-not-allowed dark:text-zinc-600"
              title="Coming soon"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </nav>

          {/* User Profile */}
          <div className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-sm font-semibold text-white">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">User</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Home
          </Link>
          <span className="text-zinc-400 dark:text-zinc-600">/</span>
          <span className="text-zinc-500 dark:text-zinc-400">Pages</span>
          <span className="text-zinc-400 dark:text-zinc-600">/</span>
          <span className="text-zinc-900 dark:text-zinc-50">Overview</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Overview</h1>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Operational
            </span>
          </div>
        </div>

        {/* API Usage Card with Lavender Gradient */}
        <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">API Usage</h2>
              <svg className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mb-2 text-sm text-white/90">Monthly plan</p>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-0 rounded-full bg-white/40"></div>
          </div>
          <div className="flex items-center justify-between text-sm text-white/90">
            <span>0/1,000 Credits</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">Pay as you go</span>
              <svg className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* API Metrics Section */}
        <div className="mb-8 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Requests</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {metricsLoading ? "..." : metrics.totalRequests.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">All time</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Requests Today</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {metricsLoading ? "..." : metrics.requestsToday.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Last 24 hours</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Avg Response Time</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {metricsLoading ? "..." : metrics.avgResponseTime > 0 ? `${metrics.avgResponseTime}ms` : "0ms"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Average</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Success Rate</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {metricsLoading ? "..." : `${metrics.successRate.toFixed(1)}%`}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">All requests</p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Usage Over Time</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Requests per day for the last 7 days</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange("7D")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    timeRange === "7D"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange("30D")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    timeRange === "30D"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  30D
                </button>
                <button
                  onClick={() => setTimeRange("90D")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    timeRange === "90D"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  90D
                </button>
              </div>
            </div>

            {/* Dynamic Line Chart using SVG */}
            <div className="h-64 w-full">
              <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={20 + i * 40}
                    x2="760"
                    y2={20 + i * 40}
                    stroke="rgb(228, 228, 231)"
                    strokeWidth="1"
                    strokeDasharray="4"
                    className="dark:stroke-zinc-700"
                  />
                ))}

                {(() => {
                  const points = getChartPoints();
                  const maxValue = getMaxValue();
                  
                  if (points.length === 0) return null;

                  // Area fill
                  const areaPath = `M 40 180 ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L 760 180 Z`;
                  
                  // Line path
                  const linePath = `M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#gradient)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke="rgb(168, 85, 247)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((point, index) => (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="rgb(168, 85, 247)"
                        />
                      ))}
                    </>
                  );
                })()}

                {/* X-axis labels */}
                {getChartData().map((data, index) => {
                  const points = getChartPoints();
                  const x = points[index]?.x || 40 + (index * 720) / (points.length - 1 || 1);
                  const dayName = formatDate(data.date);
                  return (
                    <text
                      key={index}
                      x={x}
                      y="195"
                      textAnchor="middle"
                      className="fill-zinc-500 text-xs dark:fill-zinc-400"
                    >
                      {dayName}
                    </text>
                  );
                })}

                {/* Y-axis labels */}
                {(() => {
                  const maxValue = getMaxValue();
                  return [0, 1, 2, 3, 4].map((i) => {
                    const value = Math.round((maxValue / 4) * (4 - i));
                    return (
                      <text
                        key={i}
                        x="30"
                        y={20 + i * 40 + 5}
                        textAnchor="end"
                        className="fill-zinc-500 text-xs dark:fill-zinc-400"
                      >
                        {value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                      </text>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Keys</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  The key is used to authenticate your requests to the API. To learn more, see the{" "}
                  <Link href="#" className="text-purple-600 underline transition-colors hover:text-purple-700 dark:text-purple-400">
                    documentation page
                  </Link>
                  .
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
              >
                + Create API Key
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">Loading...</div>
          ) : apiKeys.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">
              No API keys found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Key
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Options
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {key.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          dev
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        0
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span>
                            {visibleKeys.has(key.id) && fullKeys.has(key.id)
                              ? fullKeys.get(key.id)
                              : maskKey(key.key)}
                          </span>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="flex-shrink-0 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            title={
                              visibleKeys.has(key.id)
                                ? "Hide key"
                                : fullKeys.has(key.id)
                                ? "Show key"
                                : "Full key not available (only shown once when created)"
                            }
                          >
                            {visibleKeys.has(key.id) ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(fullKeys.get(key.id) || key.key)}
                            className="rounded p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            title="Copy key"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(key)}
                            className="rounded p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            title="Edit key"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(key.id)}
                            className="rounded p-1.5 text-zinc-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            title="Delete key"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">Create API Key</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="e.g., Production API Key"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  A secure API key will be automatically generated
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Usage Count
                </label>
                <input
                  type="number"
                  value="1000"
                  disabled
                  readOnly
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-600 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Maximum number of API calls allowed (fixed at 1000)
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Newly Created Key Modal */}
      {showKeyModal && newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">API Key Created</h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Make sure to copy your API key now. You won't be able to see it again!
            </p>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <code className="flex-1 break-all font-mono text-xs text-zinc-900 dark:text-zinc-50">
                {showNewKey ? newlyCreatedKey : maskKey(newlyCreatedKey || "")}
              </code>
              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={() => setShowNewKey(!showNewKey)}
                  className="rounded-lg bg-zinc-300 px-2 py-1.5 text-zinc-700 transition-colors hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                  title={showNewKey ? "Hide key" : "Show key"}
                >
                  {showNewKey ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey || "")}
                  className="rounded-lg bg-zinc-400 px-3 py-1.5 text-white transition-colors hover:bg-zinc-500 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                  title="Copy to clipboard"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={closeKeyModal}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
            >
              I've copied the key
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">Edit API Key</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Only the name can be updated. The API key cannot be changed.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
