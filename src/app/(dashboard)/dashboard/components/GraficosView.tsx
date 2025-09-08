// src/app/(dashboard)/dashboard/components/GraficosView.tsx
"use client";
    
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { GraficoData } from "../page";
    
// A CORREÇÃO ESTÁ AQUI: Remover o 'hsl()' de volta das cores
const chartConfig = {
  value: { label: "Vigilantes" },
  ativos: { label: "Ativos", color: "var(--chart-1)" },
  ferias: { label: "Férias", color: "var(--chart-2)" },
  afastados: { label: "Afastados", color: "var(--chart-3)" },
  inativos: { label: "Inativos", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface GraficosViewProps {
    dataDistribuicao: Omit<GraficoData, 'fill'>[];
}

export function GraficosView({ dataDistribuicao }: GraficosViewProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Distribuição do Efetivo</CardTitle>
      </CardHeader>
      {/* O CardContent agora é um container flex que permite o gráfico crescer */}
      <CardContent className="flex-1 pb-4">
        {/* O ChartContainer envolve TODO o conteúdo do gráfico, incluindo a legenda */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataDistribuicao}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {dataDistribuicao.map((entry) => (
                <Cell 
                  key={`cell-${entry.name}`} 
                  fill={`var(--color-${entry.name})`} 
                  className="focus:outline-none"
                />
              ))}
            </Pie>
            {/* A legenda agora está DENTRO do ChartContainer, mas o layout flex do pai a posiciona corretamente */}
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="[&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}