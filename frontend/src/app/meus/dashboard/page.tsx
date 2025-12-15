'use client';

import React, { useState, useEffect } from 'react';
import { meusAPI } from '@/lib/numerology-api';
import { FeatureGate } from '@/components/FeatureGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

interface DashboardData {
  summary: {
    total_entities: number;
    people_count: number;
    assets_count: number;
    events_count: number;
  };
  network_graph: {
    nodes: any[];
    edges: any[];
  };
  influence_heatmap: {
    current_month: {
      positive_influences: any[];
      negative_influences: any[];
      neutral_influences: any[];
    };
  };
  alerts: any[];
  opportunities: any[];
}

export default function UniverseDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await meusAPI.getDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDashboard}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FeatureGate featureName="meus_dashboard">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Universe Intelligence Dashboard</h1>
          <Button onClick={loadDashboard}>Refresh</Button>
        </div>

        {dashboardData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.summary.total_entities}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">People</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.summary.people_count}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assets</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.summary.assets_count}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.summary.events_count}</div>
                </CardContent>
              </Card>
            </div>

            {/* Influence Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Influence Heatmap (Current Month)</CardTitle>
                <CardDescription>Entities influencing you this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-green-600 mb-2">
                      Positive Influences ({dashboardData.influence_heatmap.current_month.positive_influences.length})
                    </h3>
                    <div className="space-y-2">
                      {dashboardData.influence_heatmap.current_month.positive_influences.map((inf: any) => (
                        <div key={inf.entity_id} className="p-2 bg-green-50 rounded">
                          <div className="font-medium">{inf.entity_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Influence: {inf.influence_strength}% | Compatibility: {inf.compatibility_score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-600 mb-2">
                      Negative Influences ({dashboardData.influence_heatmap.current_month.negative_influences.length})
                    </h3>
                    <div className="space-y-2">
                      {dashboardData.influence_heatmap.current_month.negative_influences.map((inf: any) => (
                        <div key={inf.entity_id} className="p-2 bg-red-50 rounded">
                          <div className="font-medium">{inf.entity_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Influence: {inf.influence_strength}% | Compatibility: {inf.compatibility_score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {dashboardData.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.alerts.map((alert: any, idx: number) => (
                      <div key={idx} className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Severity: {alert.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunities */}
            {dashboardData.opportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.opportunities.map((opp: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="font-medium">{opp.message}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </FeatureGate>
  );
}

