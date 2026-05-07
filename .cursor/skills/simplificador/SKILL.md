---
name: simplificador
description: Analisa, revisa e simplifica qualquer código do projeto em um único passo. Identifica problemas, rejeita código mal escrito e refatora imediatamente. Combina code review e code refactor. Aplicado quando o agent simplificador é acionado.
---

# Skill: Simplificador (Review + Refactor em Um Passo)

Guia escalável para revisar **e** simplificar qualquer código do projeto — utils, componentes, hooks, tipos, services, configurações — em uma única passagem.

**Regra fundamental**: o código resultante deve ser mais simples, mais claro e mais fácil de manter que o original, sem alterar comportamento, sem criar features e sem criar regras de negócio.

---

## ⛔ Rejeição Automática

**Se QUALQUER um desses for verdadeiro, REJEITE E CORRIJA imediatamente:**

- ❌ Viola SOLID (múltiplas responsabilidades, baixa coesão, etc)
- ❌ Código confuso ou desnecessariamente complexo (mesmo que "funcione")
- ❌ Redundância evitável (código repetido, lógica duplicada, variáveis inúteis)
- ❌ Performance ruim (loops ineficientes, renders desnecessários, operações N+1)
- ❌ Manutenibilidade sacrificada
- ❌ Nomenclatura genérica (`helper`, `util`, `data`, `handler`)
- ❌ Imports quebrados (arquivo não existe)
- ❌ Sem error handling em queries/mutations
- ❌ Tipo de componente declarado no arquivo do componente (deveria estar em `types/`)
- ❌ Constante CSS ou de negócio declarada no componente (deveria estar em `constants/`)

---

## Workflow Obrigatório

### 1. Rodar a auditoria automática (sempre que for um módulo ou pasta)

Antes de ler manualmente, peça evidência objetiva ao script:

```bash
python .cursor/skills/simplificador/scripts/audit_module.py <caminho-do-modulo>
python .cursor/skills/simplificador/scripts/find_duplicate_blocks.py <caminho-do-modulo> 6
```

O que cada script entrega:

- `audit_module.py` — relatório com problemas críticos e sugestões: arquivos com mais de 300 linhas, uso de `any`, `console.*`, código comentado, tipos declarados em arquivos `.component.tsx`, constantes CSS no componente, `useEffect`+`useState`+fetch (candidato a React Query), barrel files (apenas reexportam), nomes de arquivo genéricos.
- `find_duplicate_blocks.py` — blocos de N+ linhas iguais entre arquivos. Use para identificar lógica duplicada que pode ir para `utils/`, `constants/` ou hooks compartilhados.

**Como tratar a saída**:
- Use os apontamentos como **hipóteses** a confirmar lendo o código.
- Falsos positivos podem aparecer (ex.: blocos duplicados que são apenas desestruturação cosmética). Confirme antes de refatorar.
- Se o script não encontrar nada, **continue a análise manual** — o script é raio-x inicial, não auditoria final.

### 2. Ler e entender

- Ler o arquivo/módulo solicitado completo
- Identificar: o que recebe, o que retorna, o que renderiza, o que chama
- Mapear o que **não pode** mudar (comportamento, contratos, regras de negócio)

### 3. Analisar e classificar

```
ANÁLISE:
  🔴 Crítico (corrigir agora):
    - [problema + localização]

  🟡 Sugestão (melhoria relevante):
    - [problema + localização]

  Comportamento preservado:
    - [o que não muda]
```

### 4. Aplicar review + refactor

**Seguro (aplicar sem perguntar)**:
- Renomear variáveis/funções locais para clareza
- Remover imports não usados
- Remover `console.log`
- Remover código comentado
- Extrair função pura sem alterar assinatura exportada
- Substituir `any` por tipo explícito
- Organizar Tailwind com `cn()`
- Usar `z.infer<typeof schema>` para tipo duplicado
- Substituir loop manual por operação nativa
- Mover tipo de componente para `types/` do módulo
- Mover constante para `constants/` do módulo

**Requer confirmação**:
- Mudança que pode alterar comportamento visível ao usuário
- Assinatura de função exportada
- Reorganização de arquivos com impacto em imports externos
- Lógica que parece morta mas pode ter propósito não óbvio
- Schema Zod ou tipo exportado

### 5. Confirmar equivalência

- Rodar testes existentes; se passarem, é seguro
- Se não houver testes para a parte alterada, sinalizar que devem ser criados
- Re-rodar `audit_module.py` no módulo alterado e confirmar que os críticos sumiram

### 6. Apresentar resultado

```
SIMPLIFICADOR CONCLUÍDO:
  Arquivo(s): [lista]

  🔴 Críticos corrigidos:
    - [o que mudou]

  🟡 Sugestões aplicadas:
    - [o que mudou]

  Comportamento preservado:
    - [o que não mudou]

  Testes: [status]
  Pendente de confirmação: [se houver]
```

---

## Princípio Fundamental: SOLID + Qualidade São Obrigatórios

1. **Ser legível**: Um novo dev entende em menos de 2 minutos sem ler implementação
2. **Ter propósito claro**: Sabe-se exatamente por que existe e o que resolve
3. **Seguir SOLID**: S, O, L, I, D aplicados rigorosamente
4. **Ser reutilizável**: Sem duplicação, DRY principle aplicado
5. **Ser performático**: Sem operações ineficientes, loops ótimos, renders mínimos
6. **Ser escalável**: Crescerá com o projeto sem virar spaghetti code
7. **Ser mantível**: Fácil debugar, estender, evoluir

---

## Nomenclatura Clara

**Referência obrigatória**: `.cursor/rules/nomenclaturas.mdc`

**Regra de ouro**: Se o nome não responder claramente "O que é isso?", "O que faz?" ou "Qual dado representa?", está errado.

| Errado | Problema | Correto |
|--------|----------|---------|
| `helper.ts` | O que ajuda? | `format-date-to-pt-br.ts` |
| `utils.ts` | Utilidade de quê? | `classify-breed-size.utils.ts` |
| `data.ts` | Qual dado? | `fetch-breeds-from-supabase.ts` |
| `fmt()` | Formata o quê? | `formatarDataParaPtBr()` |
| `getData()` | Obtém qual dado? | `fetchBreedFromSupabase()` |
| `isOpen` | O que está aberto? | `isBreedFormDialogOpen` |
| `loading` | O que está carregando? | `isFormSubmitting` |
| `handler` | Trata o quê? | `handleBreedFormSubmit` |

---

## Estrutura e Colocation do Projeto

```
src/app/(main)/breeds/
  ├── page.tsx
  ├── components/
  ├── types/
  ├── zod/
  ├── constants/
  ├── hooks/
  └── utils/

src/modules/<nome>/
  ├── components/
  ├── types/         ← tipos específicos do módulo
  ├── constants/     ← constantes do módulo (incluindo estilos CSS reutilizados)
  ├── zod/           ← schemas de validação
  ├── hooks/         ← lógica de negócio
  └── utils/
```

**Regra**: cada símbolo vive no arquivo/pasta correto para o seu papel. Tipos em `types/`, constantes em `constants/`, schemas em `zod/`, lógica em `hooks/`.

---

## Padrões de Simplificação

### Tipagem

```typescript
// ❌ Antes: any + tipo duplicado
function processar(dados: any): any { ... }
type MinhaForm = { nome: string; email: string }; // duplicado do zod

// ✅ Depois: tipo explícito + inferência de Zod
function processar(dados: DadosEntrada): DadosSaida { ... }
type MinhaForm = z.infer<typeof minhaFormZod>;
```

### Loops manuais → operações nativas

```typescript
// ❌ Antes
let resultado = "";
for (let i = 0; i < valor.length; i++) {
  if (valor[i] >= "0" && valor[i] <= "9") resultado += valor[i];
}

// ✅ Depois
const resultado = valor.replace(/\D/g, "");
```

### Funções com múltiplas responsabilidades → funções puras focadas

```typescript
// ❌ Antes: tudo misturado
function processarEExibirDado(entrada: any) { ... }

// ✅ Depois: uma função = uma responsabilidade
function limparEntrada(valor: string): string { ... }
function validarEntrada(valor: string): boolean { ... }
function formatarParaExibicao(valor: string): string { ... }
```

### Componente com múltiplas responsabilidades → decomposição

```typescript
// ❌ Antes: um componente faz tudo
function MeuComponente() {
  // busca dados, filtra, ordena, renderiza, controla modal
}

// ✅ Depois: cada parte tem propósito único
function useBuscarDados() { ... }           // hook: busca
function filtrarEOrdenar(dados, filtros) {} // util pura
function MeuComponente() { ... }           // componente: orquestra
function ListaDeItens({ itens }) { ... }   // componente: renderiza
```

### Símbolo no lugar errado → mover para gaveta correta

```typescript
// ❌ Antes: tipo de props declarado no componente
// auth-form.component.tsx
type PropriedadesBotao = { ... };
const CLASSES_CSS = "...";

// ✅ Depois: cada símbolo na sua pasta
// types/auth.types.ts
export type PropriedadesBotao = { ... };

// constants/estilos-autenticacao.constants.ts
export const estilosAutenticacao = { ... };
```

### Estado async → React Query

```typescript
// ❌ Antes: gerenciamento manual
const [dados, setDados] = useState(null);
useEffect(() => { fetch(...).then(setDados); }, []);

// ✅ Depois: React Query
const { data: dados, isLoading, error } = useQuery({ ... });
```

---

## Checklist Completo (por arquivo)

- [ ] **SOLID**: Não viola (S, O, L, I, D)?
- [ ] **Legibilidade**: Alguém novo entende em < 2 min?
- [ ] **Complexidade**: Mesmo resultado com menos linhas e maior clareza?
- [ ] **Nomenclatura**: Explícita (sem `helper`, `util`, `data`)?
- [ ] **Colocation**: Arquivo no lugar certo?
- [ ] **Tipos**: Estão em `types/`, não no componente?
- [ ] **Constantes**: Estão em `constants/`, não no componente?
- [ ] **Imports**: Todos usados? Nenhum quebrado?
- [ ] **Padrão**: Segue pattern do projeto?
- [ ] **Duplicação**: Sem redundância? DRY aplicado?
- [ ] **Performance**: Sem N+1, loops ótimos, renders mínimos?
- [ ] **Erros**: Tratamento explícito?
- [ ] **Código morto**: Sem comentários, sem `console.log`, sem imports inúteis?
- [ ] **TypeScript**: Tipado (sem `any`)? Tipos inferidos de Zod?
- [ ] **Comportamento**: Testes passando?

---

## Severidade de Issues

| 🔴 Crítico — corrigir agora | Ação |
|----------------------------|------|
| Viola SOLID | Refatorar |
| Código confuso ou desnecessariamente complexo | Simplificar |
| Redundância evitável | Extrair ou remover |
| Performance ruim (N+1, loops, renders) | Otimizar |
| Nomenclatura genérica | Renomear |
| Tipo declarado no componente em vez de `types/` | Mover |
| Constante declarada no componente em vez de `constants/` | Mover |
| Imports quebrados | Remover ou restaurar |
| Sem error handling em queries/mutations | Adicionar |

| 🟡 Sugestão — aplicar quando seguro | Ação |
|--------------------------------------|------|
| Lógica duplicada (mas aceitável por ora) | Extrair para utils |
| Tipos não inferidos de Zod | Usar `z.infer<typeof>` |
| Tailwind classes desorganizadas | Organizar com `cn()` |
| Sem edge case handling | Adicionar tratamento |

---

## Quando Pedir Confirmação

**Pare e pergunte se**:
- A mudança pode alterar comportamento visível ao usuário
- A assinatura de uma função exportada vai mudar
- A reorganização de arquivos impacta imports externos
- Uma lógica parece morta mas pode ter propósito não óbvio
- Um schema Zod ou tipo exportado vai ser alterado

**Aplique sem perguntar**:
- Renomear variáveis locais para clareza
- Remover imports/variáveis não usados
- Remover `console.log` e código comentado
- Extrair função pura sem alterar assinatura
- Substituir `any` por tipo explícito
- Organizar imports e Tailwind
- Mover tipo de componente para `types/` do módulo
- Mover constante para `constants/` do módulo

---

## Scripts de auditoria

Disponíveis em `.cursor/skills/simplificador/scripts/`:

| Script | Quando rodar | Saída |
|--------|--------------|-------|
| `audit_module.py <caminho>` | Sempre antes de revisar um módulo ou pasta | Relatório markdown com 🔴 críticos e 🟡 sugestões |
| `find_duplicate_blocks.py <caminho> [N]` | Quando suspeitar de lógica duplicada entre arquivos | Lista de blocos de N+ linhas iguais e onde aparecem |

Os scripts usam apenas Python stdlib (3.10+). Saem em UTF-8 mesmo no PowerShell. Não confie cegamente — use como ponto de partida para a leitura humana.

---

## Referências

- Playbook de micro-padrões (antes/depois por categoria): `reference.md`
- Exemplos completos de problemas e soluções: `examples.md`
- Regra de nomenclatura: `.cursor/rules/nomenclaturas.mdc`
- Restrições (proibido): `.cursor/rules/restricoes.mdc`
