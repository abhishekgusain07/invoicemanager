"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  overview: {
    totalSignups: number;
    lastWeekSignups: number;
    weeklyGrowthRate: number;
  };
  signupsByDay: Array<{ date: string; count: number }>;
  emailDomains: Array<{ domain: string; count: number }>;
  recentSignups: Array<{ email: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!adminKey) {
      setError("Please enter admin key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/waitlist-stats", {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "Invalid admin key" : "Failed to fetch stats");
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatGrowthRate = (rate: number) => {
    const sign = rate >= 0 ? "+" : "";
    return `${sign}${rate.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waitlist Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your waitlist performance and growth</p>
        </div>

        {/* Admin Key Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Enter your admin API key to view statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="password"
                placeholder="Enter admin API key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load Stats"}
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total Signups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.overview.totalSignups.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.overview.lastWeekSignups.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stats.overview.weeklyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatGrowthRate(stats.overview.weeklyGrowthRate)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Signups */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Signups (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {stats.signupsByDay.map((day) => (
                      <div key={day.date} className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">{formatDate(day.date)}</span>
                        <span className="font-semibold">{day.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Domains */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Email Domains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.emailDomains.map((domain) => (
                      <div key={domain.domain} className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">{domain.domain}</span>
                        <span className="font-semibold">{domain.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Signups */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Signups</CardTitle>
                  <CardDescription>Last 20 signups (emails masked for privacy)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.recentSignups.map((signup, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600 font-mono">{signup.email}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(signup.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}