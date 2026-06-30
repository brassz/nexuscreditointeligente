import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Loader2,
  MessageCircle,
  Eye,
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cliente, supabase } from "@/lib/supabase";
import {
  cn,
  formatCurrency,
  formatDatePtBR,
  formatWhatsApp,
  tempoCarteiraLabel,
  redirectToHome,
} from "@/lib/utils";

type OrigemFilter = "formulario" | "conversa" | "todas";
type RegiaoFilter =
  | "Minas Gerais"
  | "São Paulo"
  | "Goiás"
  | "Mato Grosso do Sul"
  | "todas";
type CltFilter = "com" | "sem" | "todos";
type CnpjFilter = "possui" | "nao" | "na" | "todos";
type AvalistaFilter = "com" | "sem" | "todos";
type StatusFilter = "pendente" | "contatado" | "todos";

const PIE_COLORS = ["#00C0FF", "#0057FF"];

function cnpjDisplay(cliente: Cliente): string {
  if (cliente.cnpj) return cliente.cnpj;
  if (cliente.trabalha_clt) return "—";
  if (cliente.possui_cnpj === null) return "—";
  if (cliente.possui_cnpj && cliente.profissao) return cliente.profissao;
  if (cliente.possui_cnpj) return "Sim";
  return "Não";
}

function buildWhatsAppUrl(nome: string, whatsapp: string): string {
  const msg = `Olá, ${nome}.

Recebemos sua solicitação de crédito.

Gostaríamos de dar continuidade ao seu atendimento e apresentar as melhores opções disponíveis para o seu perfil.

Podemos conversar?`;
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/55${digits}?text=${encodeURIComponent(msg)}`;
}

export default function Painel() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Cliente | null>(null);

  const [busca, setBusca] = useState("");
  const [origem, setOrigem] = useState<OrigemFilter>("formulario");
  const [regiao, setRegiao] = useState<RegiaoFilter>("todas");
  const [clt, setClt] = useState<CltFilter>("todos");
  const [cnpj, setCnpj] = useState<CnpjFilter>("todos");
  const [avalista, setAvalista] = useState<AvalistaFilter>("todos");
  const [status, setStatus] = useState<StatusFilter>("todos");

  const fetchClientes = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setRefreshing(true);

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar clientes:", error);
    } else {
      setClientes((data as Cliente[]) ?? []);
    }

    if (isInitial) setInitialLoading(false);
    else setRefreshing(false);
  }, []);

  useEffect(() => {
    void fetchClientes(true);
    const interval = setInterval(() => void fetchClientes(false), 5000);
    return () => clearInterval(interval);
  }, [fetchClientes]);

  const filtered = useMemo(() => {
    return clientes.filter((c) => {
      const term = busca.toLowerCase().trim();
      if (term) {
        const matchNome = c.nome_completo.toLowerCase().includes(term);
        const matchZap = c.whatsapp.includes(term.replace(/\D/g, ""));
        if (!matchNome && !matchZap) return false;
      }

      if (origem !== "todas" && c.origem !== origem) return false;

      if (regiao !== "todas" && c.regiao !== regiao) return false;

      if (clt === "com" && !c.trabalha_clt) return false;
      if (clt === "sem" && c.trabalha_clt) return false;

      if (cnpj === "possui" && !c.trabalha_clt && c.possui_cnpj !== true)
        return false;
      if (cnpj === "nao" && !c.trabalha_clt && c.possui_cnpj !== false)
        return false;
      if (cnpj === "na" && !c.trabalha_clt) return false;

      if (avalista === "com" && !c.possui_avalista) return false;
      if (avalista === "sem" && c.possui_avalista) return false;

      if (status === "pendente" && c.contatado) return false;
      if (status === "contatado" && !c.contatado) return false;

      return true;
    });
  }, [clientes, busca, origem, regiao, clt, cnpj, avalista, status]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const contatados = filtered.filter((c) => c.contatado).length;
    const pendentes = total - contatados;
    return { total, contatados, pendentes };
  }, [filtered]);

  const pieData = useMemo(
    () => [
      { name: "Contatados", value: stats.contatados },
      { name: "Pendentes", value: stats.pendentes },
    ],
    [stats]
  );

  const handleContatar = async (cliente: Cliente) => {
    window.open(buildWhatsAppUrl(cliente.nome_completo, cliente.whatsapp), "_blank");

    const { error } = await supabase
      .from("clientes")
      .update({ contatado: true })
      .eq("id", cliente.id);

    if (error) {
      console.error("Erro ao marcar como contatado:", error);
      return;
    }

    setClientes((prev) =>
      prev.map((c) => (c.id === cliente.id ? { ...c, contatado: true } : c))
    );
    if (selected?.id === cliente.id) {
      setSelected({ ...cliente, contatado: true });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060810]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-nexus-neon" />
          <p className="mt-4 text-secondary">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060810] pb-12">
      <header className="border-b border-white/10 bg-[#0a0e1c]/80 backdrop-blur-xl">
        <div className="container-custom flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <img
              src="/nexus-logo.png"
              alt="Crédito Inteligente"
              className="h-9 w-auto drop-shadow-[0_0_12px_rgba(0,212,255,0.5)]"
            />
            <p className="mt-2 text-sm text-secondary">
              Painel Comercial · atualização a cada 5s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={() => void fetchClientes(false)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Atualizar
            </Button>
            <Button variant="cta" size="sm" onClick={redirectToHome}>
              Voltar ao site
            </Button>
          </div>
        </div>
      </header>

      <div className="container-custom space-y-6 py-8">
        {/* Dashboard */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-secondary">
                Total de Leads
              </CardTitle>
              <Users className="h-4 w-4 text-nexus-neon" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-secondary">
                Contatados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold text-green-400">
                {stats.contatados}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-secondary">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold text-amber-400">
                {stats.pendentes}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Status dos Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0a0e1c",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Filtros */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  placeholder="Buscar nome ou WhatsApp..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <Select value={origem} onValueChange={(v) => setOrigem(v as OrigemFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formulario">Formulário</SelectItem>
                    <SelectItem value="conversa">Conversa</SelectItem>
                    <SelectItem value="todas">Todas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regiao} onValueChange={(v) => setRegiao(v as RegiaoFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minas Gerais">Minas Gerais</SelectItem>
                    <SelectItem value="São Paulo">São Paulo</SelectItem>
                    <SelectItem value="Goiás">Goiás</SelectItem>
                    <SelectItem value="Mato Grosso do Sul">Mato Grosso do Sul</SelectItem>
                    <SelectItem value="todas">Todas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clt} onValueChange={(v) => setClt(v as CltFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="CLT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="com">Com carteira</SelectItem>
                    <SelectItem value="sem">Sem carteira</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={cnpj} onValueChange={(v) => setCnpj(v as CnpjFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="CNPJ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="possui">Possui</SelectItem>
                    <SelectItem value="nao">Não possui</SelectItem>
                    <SelectItem value="na">Não se aplica (CLT)</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={avalista}
                  onValueChange={(v) => setAvalista(v as AvalistaFilter)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Avalista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="com">Com</SelectItem>
                    <SelectItem value="sem">Sem</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="contatado">Contatado</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Clientes ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>CLT</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Avalista</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="py-8 text-center text-secondary">
                      Nenhum lead encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome_completo}</TableCell>
                      <TableCell>{formatWhatsApp(c.whatsapp)}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(c.valor_desejado) || 0)}
                      </TableCell>
                      <TableCell>{c.regiao ?? "—"}</TableCell>
                      <TableCell>{c.cidade}</TableCell>
                      <TableCell>{c.trabalha_clt ? "Sim" : "Não"}</TableCell>
                      <TableCell>{tempoCarteiraLabel(c.tempo_carteira)}</TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {cnpjDisplay(c)}
                      </TableCell>
                      <TableCell>{c.possui_avalista ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            c.contatado
                              ? "bg-green-500/15 text-green-400"
                              : "bg-amber-500/15 text-amber-400"
                          )}
                        >
                          {c.contatado ? "Contatado" : "Pendente"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDatePtBR(c.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Contatar"
                            onClick={() => void handleContatar(c)}
                          >
                            <MessageCircle className="h-4 w-4 text-green-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Detalhes"
                            onClick={() => setSelected(c)}
                          >
                            <Eye className="h-4 w-4 text-nexus-neon" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Detalhes */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                ["Nome", selected.nome_completo],
                ["WhatsApp", formatWhatsApp(selected.whatsapp)],
                ["Valor desejado", formatCurrency(Number(selected.valor_desejado) || 0)],
                ["Região", selected.regiao ?? "—"],
                ["Cidade", selected.cidade],
                ["CLT", selected.trabalha_clt ? "Sim" : "Não"],
                ["Tempo de carteira", tempoCarteiraLabel(selected.tempo_carteira)],
                ["CNPJ", cnpjDisplay(selected)],
                ["Avalista", selected.possui_avalista ? "Sim" : "Não"],
                ["Origem", selected.origem ?? "—"],
                ["Status", selected.contatado ? "Contatado" : "Pendente"],
                ["Data", formatDatePtBR(selected.created_at)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-white/5 pb-2"
                >
                  <span className="text-secondary">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}
              <Button
                variant="cta"
                className="mt-4 w-full"
                onClick={() => void handleContatar(selected)}
              >
                <MessageCircle className="h-4 w-4" />
                Contatar via WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
