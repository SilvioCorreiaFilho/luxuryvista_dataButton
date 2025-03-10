import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface NeighborhoodScore {
  category: string;
  score: number;
  description: string;
}

interface InvestmentMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  percentage?: string;
}

interface Props {
  neighborhoodScores: NeighborhoodScore[];
  investmentMetrics: InvestmentMetric[];
  historicalData: {
    year: string;
    value: number;
  }[];
  className?: string;
}

export function PropertyAnalysis({
  neighborhoodScores,
  investmentMetrics,
  historicalData,
  className = ''
}: Props) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Neighborhood Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-light">Análise do Bairro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {neighborhoodScores.map((score, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{score.category}</span>
                <span className="font-medium">{score.score}/10</span>
              </div>
              <Progress value={score.score * 10} className="h-2" />
              <p className="text-sm text-gray-500">{score.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Investment Potential */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-light">Potencial de Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investmentMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{metric.label}</span>
                  {metric.trend === 'up' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-green-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                      />
                    </svg>
                  )}
                  {metric.trend === 'down' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-red-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181"
                      />
                    </svg>
                  )}
                  {metric.trend === 'stable' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-blue-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 9h16.5m-16.5 6.75h16.5"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light">{metric.value}</span>
                  {metric.percentage && (
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-blue-500'}`}>
                      {metric.percentage}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Historical Value Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Valorização Histórica</h3>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      }).format(Number(value)),
                      'Valor'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#valueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-light">Insights de Mercado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Demanda da Região</h4>
              <p className="text-gray-600">Alta procura por imóveis de luxo nesta localização, com tempo médio de venda de 45 dias.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Desenvolvimento</h4>
              <p className="text-gray-600">Novos empreendimentos comerciais e melhorias de infraestrutura planejadas para os próximos anos.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Retorno Esperado</h4>
              <p className="text-gray-600">Potencial de valorização acima da média do mercado nos próximos 5 anos.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
