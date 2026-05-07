"""
Audita um módulo (ou pasta) à luz das regras do agente `simplificador`.

Uso:
    python audit_module.py <caminho-do-modulo>

Exemplo:
    python .cursor/skills/simplificador/scripts/audit_module.py src/modules/auth

Saída: relatório markdown com problemas categorizados (🔴 crítico / 🟡 sugestão).
O agente deve usar este relatório como evidência inicial — não como verdade absoluta.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from dataclasses import dataclass, field

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

LIMITE_LINHAS_ARQUIVO_GRANDE = 300
EXTENSOES_ALVO = {".ts", ".tsx"}
PASTAS_IGNORADAS = {"node_modules", ".next", "dist", "build", ".git"}

NOMES_GENERICOS = {
    "helper",
    "helpers",
    "util",
    "utils",
    "data",
    "handler",
    "handlers",
    "wrapper",
    "manager",
    "stuff",
    "common",
    "misc",
}

PADRAO_ANY = re.compile(r"(?<![A-Za-z0-9_])any(?![A-Za-z0-9_])")
PADRAO_CONSOLE_LOG = re.compile(r"\bconsole\.(log|debug|info)\b")
PADRAO_CODIGO_COMENTADO = re.compile(
    r"^\s*//\s*("
    r"const\s+\w|let\s+\w|var\s+\w|function\s+\w|"
    r"import\s+|export\s+|return\s+|if\s*\(|for\s*\(|"
    r"async\s+function|class\s+\w|=>"
    r")"
)
PADRAO_TIPO_DECLARADO = re.compile(r"^\s*(?:export\s+)?(?:type|interface)\s+([A-Z]\w+)")
PADRAO_CONSTANTE_CSS = re.compile(
    r'^\s*(?:export\s+)?const\s+([A-Z_][A-Z0-9_]*|[a-z]\w*)\s*='
    r'\s*"[^"]*('
    r"flex|grid|p-\d|px-\d|py-\d|m-\d|mx-\d|my-\d|"
    r"text-|bg-|border-|rounded|gap-|h-|w-|absolute|relative"
    r')[^"]*"'
)
PADRAO_USE_EFFECT = re.compile(r"\buseEffect\s*\(")
PADRAO_USE_STATE = re.compile(r"\buseState\s*[<(]")
PADRAO_FETCH = re.compile(r"\bfetch\s*\(|\.from\s*\(|supabase|axios\.")
PADRAO_REEXPORT = re.compile(r"^\s*export\s+(?:type\s+)?\{[^}]+\}\s+from\s+[\"']")
PADRAO_DECLARACAO = re.compile(
    r"^\s*(?:export\s+)?"
    r"(?:const|let|var|function|class|type|interface|enum|async\s+function)\s+\w"
)


@dataclass
class ProblemaEncontrado:
    severidade: str  # "critico" | "sugestao"
    arquivo: Path
    linha: int | None
    titulo: str
    detalhe: str = ""


@dataclass
class RelatorioModulo:
    raiz: Path
    arquivos_analisados: list[Path] = field(default_factory=list)
    problemas: list[ProblemaEncontrado] = field(default_factory=list)


def coletar_arquivos(raiz: Path) -> list[Path]:
    arquivos: list[Path] = []
    for caminho in raiz.rglob("*"):
        if caminho.is_dir():
            continue
        if any(parte in PASTAS_IGNORADAS for parte in caminho.parts):
            continue
        if caminho.suffix not in EXTENSOES_ALVO:
            continue
        arquivos.append(caminho)
    return sorted(arquivos)


def ler_linhas(arquivo: Path) -> list[str]:
    try:
        return arquivo.read_text(encoding="utf-8").splitlines()
    except (UnicodeDecodeError, OSError):
        return []


def detectar_arquivo_grande(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    total = len(linhas)
    if total > LIMITE_LINHAS_ARQUIVO_GRANDE:
        relatorio.problemas.append(
            ProblemaEncontrado(
                severidade="critico",
                arquivo=arquivo,
                linha=None,
                titulo=f"Arquivo grande ({total} linhas)",
                detalhe=f"Excede o limite de {LIMITE_LINHAS_ARQUIVO_GRANDE}. Considere decompor em partes menores.",
            )
        )


def detectar_any_e_console(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    for indice, linha in enumerate(linhas, start=1):
        sem_string = re.sub(r'"[^"]*"|\'[^\']*\'', "", linha)
        sem_comentario = re.sub(r"//.*$", "", sem_string)

        if PADRAO_ANY.search(sem_comentario):
            relatorio.problemas.append(
                ProblemaEncontrado(
                    severidade="critico",
                    arquivo=arquivo,
                    linha=indice,
                    titulo="Uso de `any`",
                    detalhe=linha.strip(),
                )
            )

        if PADRAO_CONSOLE_LOG.search(sem_comentario):
            relatorio.problemas.append(
                ProblemaEncontrado(
                    severidade="critico",
                    arquivo=arquivo,
                    linha=indice,
                    titulo="`console.*` em código de produção",
                    detalhe=linha.strip(),
                )
            )


def detectar_codigo_comentado(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    for indice, linha in enumerate(linhas, start=1):
        if PADRAO_CODIGO_COMENTADO.match(linha):
            relatorio.problemas.append(
                ProblemaEncontrado(
                    severidade="critico",
                    arquivo=arquivo,
                    linha=indice,
                    titulo="Código comentado",
                    detalhe=linha.strip(),
                )
            )


def detectar_tipo_em_componente(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    if not arquivo.name.endswith(".component.tsx"):
        return
    for indice, linha in enumerate(linhas, start=1):
        match = PADRAO_TIPO_DECLARADO.match(linha)
        if match:
            relatorio.problemas.append(
                ProblemaEncontrado(
                    severidade="critico",
                    arquivo=arquivo,
                    linha=indice,
                    titulo=f"Tipo `{match.group(1)}` declarado num componente",
                    detalhe="Mover para `types/` do módulo (regra: cada símbolo na sua gaveta).",
                )
            )


def detectar_constante_css_em_componente(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    if not arquivo.name.endswith(".component.tsx"):
        return
    for indice, linha in enumerate(linhas, start=1):
        match = PADRAO_CONSTANTE_CSS.search(linha)
        if match:
            relatorio.problemas.append(
                ProblemaEncontrado(
                    severidade="critico",
                    arquivo=arquivo,
                    linha=indice,
                    titulo=f"Constante CSS `{match.group(1)}` declarada num componente",
                    detalhe="Mover para `constants/` do módulo (regra: cada símbolo na sua gaveta).",
                )
            )


def detectar_use_effect_com_fetch(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    conteudo = "\n".join(linhas)
    tem_use_effect = bool(PADRAO_USE_EFFECT.search(conteudo))
    tem_use_state = bool(PADRAO_USE_STATE.search(conteudo))
    tem_chamada_externa = bool(PADRAO_FETCH.search(conteudo))
    if tem_use_effect and tem_use_state and tem_chamada_externa:
        relatorio.problemas.append(
            ProblemaEncontrado(
                severidade="sugestao",
                arquivo=arquivo,
                linha=None,
                titulo="`useEffect` + `useState` para dados assíncronos",
                detalhe="Considere migrar para React Query (`useQuery` / `useMutation`).",
            )
        )


def detectar_barrel_de_passagem(arquivo: Path, linhas: list[str], relatorio: RelatorioModulo) -> None:
    declaracoes = 0
    reexportacoes = 0
    for linha in linhas:
        sem_indent = linha.strip()
        if not sem_indent or sem_indent.startswith("//") or sem_indent.startswith("/*"):
            continue
        if sem_indent.startswith("import "):
            continue
        if PADRAO_REEXPORT.match(linha):
            reexportacoes += 1
            continue
        if PADRAO_DECLARACAO.match(linha):
            declaracoes += 1

    if reexportacoes >= 1 and declaracoes == 0:
        relatorio.problemas.append(
            ProblemaEncontrado(
                severidade="critico",
                arquivo=arquivo,
                linha=None,
                titulo="Barrel de passagem (só reexporta)",
                detalhe=f"{reexportacoes} reexportação(ões) sem nenhuma declaração própria. Proibido pela regra `restricoes.mdc`.",
            )
        )


def detectar_nomes_genericos(arquivo: Path, relatorio: RelatorioModulo) -> None:
    nome_base = arquivo.stem.lower()
    nome_principal = re.split(r"[.\-_]", nome_base)[0]
    if nome_principal in NOMES_GENERICOS:
        relatorio.problemas.append(
            ProblemaEncontrado(
                severidade="sugestao",
                arquivo=arquivo,
                linha=None,
                titulo=f"Nome de arquivo genérico (`{nome_principal}`)",
                detalhe="Renomear para algo que descreva exatamente o que o arquivo contém/faz.",
            )
        )


def auditar(raiz: Path) -> RelatorioModulo:
    relatorio = RelatorioModulo(raiz=raiz)
    relatorio.arquivos_analisados = coletar_arquivos(raiz)

    for arquivo in relatorio.arquivos_analisados:
        linhas = ler_linhas(arquivo)
        detectar_arquivo_grande(arquivo, linhas, relatorio)
        detectar_any_e_console(arquivo, linhas, relatorio)
        detectar_codigo_comentado(arquivo, linhas, relatorio)
        detectar_tipo_em_componente(arquivo, linhas, relatorio)
        detectar_constante_css_em_componente(arquivo, linhas, relatorio)
        detectar_use_effect_com_fetch(arquivo, linhas, relatorio)
        detectar_barrel_de_passagem(arquivo, linhas, relatorio)
        detectar_nomes_genericos(arquivo, relatorio)

    return relatorio


def formatar_relatorio(relatorio: RelatorioModulo) -> str:
    raiz = relatorio.raiz.as_posix()
    criticos = [p for p in relatorio.problemas if p.severidade == "critico"]
    sugestoes = [p for p in relatorio.problemas if p.severidade == "sugestao"]

    linhas_relatorio: list[str] = []
    linhas_relatorio.append(f"# Auditoria do módulo: {raiz}")
    linhas_relatorio.append("")
    linhas_relatorio.append(f"- Arquivos analisados: {len(relatorio.arquivos_analisados)}")
    linhas_relatorio.append(f"- Problemas críticos: {len(criticos)}")
    linhas_relatorio.append(f"- Sugestões: {len(sugestoes)}")
    linhas_relatorio.append("")

    def imprimir_secao(titulo: str, problemas: list[ProblemaEncontrado]) -> None:
        linhas_relatorio.append(f"## {titulo}")
        linhas_relatorio.append("")
        if not problemas:
            linhas_relatorio.append("Nenhum encontrado.")
            linhas_relatorio.append("")
            return
        for problema in problemas:
            local = problema.arquivo.as_posix()
            if problema.linha is not None:
                local = f"{local}:{problema.linha}"
            linhas_relatorio.append(f"- **{problema.titulo}** — `{local}`")
            if problema.detalhe:
                linhas_relatorio.append(f"  - {problema.detalhe}")
        linhas_relatorio.append("")

    imprimir_secao("🔴 Críticos (corrigir agora)", criticos)
    imprimir_secao("🟡 Sugestões", sugestoes)

    linhas_relatorio.append("## Próximos passos sugeridos ao agente")
    linhas_relatorio.append("")
    linhas_relatorio.append("1. Ler cada arquivo listado nos críticos e validar os apontamentos.")
    linhas_relatorio.append("2. Aplicar correções seguras (renomeação local, mover símbolos para a gaveta certa, remover `any`/`console.*`).")
    linhas_relatorio.append("3. Para arquivos grandes ou `useEffect` + fetch, propor decomposição/migração.")
    linhas_relatorio.append("4. Rodar a suíte de testes (`npx vitest run`) e confirmar que nada regrediu.")

    return "\n".join(linhas_relatorio)


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: python audit_module.py <caminho-do-modulo>", file=sys.stderr)
        return 1
    raiz = Path(sys.argv[1]).resolve()
    if not raiz.exists():
        print(f"Caminho não encontrado: {raiz}", file=sys.stderr)
        return 1
    relatorio = auditar(raiz)
    print(formatar_relatorio(relatorio))
    return 0


if __name__ == "__main__":
    sys.exit(main())
