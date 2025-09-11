"use client";

import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VigilanteActions } from "./VigilanteActions";

interface Vigilante {
  id: string;
  name: string;
  matricula: string;
  cpf: string;
  telefone?: string;
  categoria: string;
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado';
}

interface VigilantesViewProps {
  vigilantes: Vigilante[];
}

const VIGILANTES_POR_PAGINA = 15;

export function VigilantesView({ vigilantes }: VigilantesViewProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtro, setFiltro] = useState("");

  const vigilantesFiltrados = useMemo(() =>
    vigilantes.filter(v =>
      v.name.toLowerCase().includes(filtro.toLowerCase()) ||
      v.matricula.includes(filtro) ||
      v.cpf.includes(filtro)
    ),
    [vigilantes, filtro]
  );

  const totalPaginas = Math.ceil(vigilantesFiltrados.length / VIGILANTES_POR_PAGINA);
  const vigilantesPaginados = useMemo(() =>
    vigilantesFiltrados.slice(
      (paginaAtual - 1) * VIGILANTES_POR_PAGINA,
      paginaAtual * VIGILANTES_POR_PAGINA
    ),
    [vigilantesFiltrados, paginaAtual]
  );

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Pesquisar por nome, matrícula ou CPF..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
        />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vigilantesPaginados.length > 0 ? (
              vigilantesPaginados.map((vigilante) => (
                <TableRow key={vigilante.id}>
                  <TableCell className="font-medium">{vigilante.name}</TableCell>
                  <TableCell>{vigilante.matricula}</TableCell>
                  <TableCell>{vigilante.cpf}</TableCell>
                  <TableCell>{vigilante.telefone || "N/A"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vigilante.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {vigilante.status.charAt(0).toUpperCase() + vigilante.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <VigilanteActions vigilanteId={vigilante.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum vigilante encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
          disabled={paginaAtual === 1}
        >
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {paginaAtual} de {totalPaginas > 0 ? totalPaginas : 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas || totalPaginas === 0}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}