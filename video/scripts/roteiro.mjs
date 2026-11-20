// ROTEIRO DA NARRAÇÃO — edite aqui os textos falados e os tempos de cada cena.
// Depois de editar: `npm run voz` (gera os áudios e recalcula a linha do tempo)
// e `npm run musica` (a trilha acompanha a nova duração).
//
// - texto:    o que o locutor fala na cena.
// - vozEm:    segundos depois do início da cena em que a fala começa.
// - respiro:  segundos de silêncio depois da fala, antes da próxima cena.
// - minimo:   duração mínima da cena em segundos (mesmo que a fala seja curta).

export const VOZ = "pt-BR-AntonioNeural";
export const FPS = 30;
/** Sobreposição entre cenas (frames) durante a transição. */
export const TRANSICAO = 15;
/** As cenas começam sempre numa batida forte da trilha: 100 BPM → 2 batidas = 36 frames. */
export const GRADE = 36;

export const cenas = [
  {
    id: "abertura",
    texto: "Empreender exige decisão, planejamento, e capital na hora certa.",
    vozEm: 3.8,
    respiro: 0.7,
    minimo: 8,
  },
  {
    id: "problema",
    texto:
      "Fornecedor para pagar, estoque para repor, uma oportunidade que não espera. Quando o caixa aperta, a empresa não pode parar.",
    vozEm: 0.7,
    respiro: 0.7,
    minimo: 9,
  },
  {
    id: "solucao",
    texto:
      "A Nexus Crédito Inteligente é especializada em crédito empresarial: uma solução pensada para empresas com CNPJ ativo, incluindo MEI.",
    vozEm: 0.9,
    respiro: 0.7,
    minimo: 9,
  },
  {
    id: "diferencial",
    texto:
      "Nosso diferencial está na análise. Ela é interna: avaliamos o faturamento, a atividade e o histórico da sua empresa, sem consulta a Serasa ou SPC nesta modalidade. O crédito é sujeito a aprovação.",
    vozEm: 0.7,
    respiro: 0.8,
    minimo: 12,
  },
  {
    id: "online",
    texto:
      "E tudo acontece online. Você simula valores e parcelas, envia os documentos pelo celular e acompanha cada etapa, sem sair da sua empresa.",
    vozEm: 0.7,
    respiro: 0.8,
    minimo: 11,
  },
  {
    id: "publico",
    texto:
      "Comércio, serviços, MEI, empresas em expansão: se o seu negócio tem CNPJ ativo, a Nexus foi pensada para você.",
    vozEm: 0.7,
    respiro: 0.7,
    minimo: 8,
  },
  {
    id: "encerramento",
    texto:
      "Nexus Crédito Inteligente. Seu negócio merece avançar. Acesse o site e faça sua simulação.",
    vozEm: 1.2,
    respiro: 3.2,
    minimo: 10,
  },
];
