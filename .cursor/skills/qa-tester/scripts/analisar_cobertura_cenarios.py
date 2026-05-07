"""
Analisa a cobertura de cenários entre arquivo(s) de implementação e arquivo(s) de teste.

Uso:
    python analisar_cobertura_cenarios.py <caminho-da-implementacao> [<caminho-do-teste>]

Exemplo:
    python .cursor/skills/qa-tester/scripts/analisar_cobertura_cenarios.py \\
        src/modules/auth/hooks/useFormularioAutenticacao.hook.tsx \\
        src/modules/auth/tests/signin.test.tsx

Saída: relatório markdown com:
- símbolos exportados pela implementação
- pontos de bifurcação (if / else / try / catch / throw)
- chamadas externas que precisam de mock
- `it()` existentes no teste
- cenários potencialmente faltantes baseados nas bifurcações encontradas

O agente deve usar o relatório para construir/validar a matriz de cenários da skill `qa-tester`.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


PADRAO_EXPORT_FUNCAO = re.compile(
    r"^\s*export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)"
)
PADRAO_EXPORT_CONST = re.compile(
    r"^\s*export\s+(?:default\s+)?const\s+(\w+)"
)
PADRAO_EXPORT_CLASSE = re.compile(r"^\s*export\s+(?:default\s+)?class\s+(\w+)")
PADRAO_HOOK = re.compile(r"\buse[A-Z]\w+")

PADRAO_IF = re.compile(r"\bif\s*\(")
PADRAO_ELSE = re.compile(r"\belse\b")
PADRAO_TRY = re.compile(r"\btry\s*\{")
PADRAO_CATCH = re.compile(r"\bcatch\b")
PADRAO_THROW = re.compile(r"\bthrow\b")
PADRAO_TERNARIO = re.compile(r"\?[^:]+:")

PADRAO_AWAIT = re.compile(r"\bawait\s+\w+\.")
PADRAO_SUPABASE = re.compile(r"\bsupabase\.\w+")
PADRAO_FETCH = re.compile(r"\bfetch\s*\(")
PADRAO_AXIOS = re.compile(r"\baxios\.")
PADRAO_TOAST = re.compile(r"\btoast\.\w+")
PADRAO_ROUTER = re.compile(r"\b(useRouter|router\.\w+)")

PADRAO_IT = re.compile(r"\bit\s*\(\s*[\"'`]([^\"'`]+)[\"'`]")
PADRAO_DESCRIBE = re.compile(r"\bdescribe\s*\(\s*[\"'`]([^\"'`]+)[\"'`]")


@dataclass
class AnaliseImplementacao:
    arquivo: Path
    simbolos_exportados: list[tuple[str, int]] = field(default_factory=list)
    bifurcacoes: list[tuple[str, int, str]] = field(default_factory=list)
    chamadas_externas: list[tuple[str, int, str]] = field(default_factory=list)


@dataclass
class AnaliseTeste:
    arquivo: Path
    describes: list[tuple[str, int]] = field(default_factory=list)
    its: list[tuple[str, int]] = field(default_factory=list)


def ler_linhas(arquivo: Path) -> list[str]:
    try:
        return arquivo.read_text(encoding="utf-8").splitlines()
    except (UnicodeDecodeError, OSError):
        return []


def analisar_implementacao(arquivo: Path) -> AnaliseImplementacao:
    analise = AnaliseImplementacao(arquivo=arquivo)
    linhas = ler_linhas(arquivo)

    for indice, linha in enumerate(linhas, start=1):
        for padrao in (PADRAO_EXPORT_FUNCAO, PADRAO_EXPORT_CONST, PADRAO_EXPORT_CLASSE):
            match = padrao.match(linha)
            if match:
                analise.simbolos_exportados.append((match.group(1), indice))

        if PADRAO_IF.search(linha):
            analise.bifurcacoes.append(("if", indice, linha.strip()))
        if PADRAO_ELSE.search(linha) and not re.match(r"\s*//", linha):
            analise.bifurcacoes.append(("else", indice, linha.strip()))
        if PADRAO_TRY.search(linha):
            analise.bifurcacoes.append(("try", indice, linha.strip()))
        if PADRAO_CATCH.search(linha):
            analise.bifurcacoes.append(("catch", indice, linha.strip()))
        if PADRAO_THROW.search(linha):
            analise.bifurcacoes.append(("throw", indice, linha.strip()))
        if PADRAO_TERNARIO.search(linha):
            analise.bifurcacoes.append(("ternário", indice, linha.strip()))

        for nome, padrao in (
            ("await externo", PADRAO_AWAIT),
            ("supabase", PADRAO_SUPABASE),
            ("fetch", PADRAO_FETCH),
            ("axios", PADRAO_AXIOS),
            ("toast", PADRAO_TOAST),
            ("router", PADRAO_ROUTER),
        ):
            if padrao.search(linha):
                analise.chamadas_externas.append((nome, indice, linha.strip()))

    return analise


def analisar_teste(arquivo: Path) -> AnaliseTeste:
    analise = AnaliseTeste(arquivo=arquivo)
    linhas = ler_linhas(arquivo)
    for indice, linha in enumerate(linhas, start=1):
        match_describe = PADRAO_DESCRIBE.search(linha)
        if match_describe:
            analise.describes.append((match_describe.group(1), indice))
        match_it = PADRAO_IT.search(linha)
        if match_it:
            analise.its.append((match_it.group(1), indice))
    return analise


def formatar_secao(titulo: str, itens: list[str]) -> str:
    if not itens:
        return f"## {titulo}\n\n(nenhum)\n"
    corpo = "\n".join(f"- {item}" for item in itens)
    return f"## {titulo}\n\n{corpo}\n"


def gerar_relatorio(impl: AnaliseImplementacao, teste: AnaliseTeste | None) -> str:
    partes: list[str] = []
    partes.append(f"# Análise de cobertura de cenários\n")
    partes.append(f"- Implementação: `{impl.arquivo.as_posix()}`")
    if teste is not None:
        partes.append(f"- Teste: `{teste.arquivo.as_posix()}`")
    else:
        partes.append("- Teste: **nenhum fornecido**")
    partes.append("")

    partes.append(
        formatar_secao(
            "Símbolos exportados pela implementação",
            [f"`{nome}` — linha {linha}" for nome, linha in impl.simbolos_exportados],
        )
    )

    bifurcacoes_unicas = list({(tipo, linha): trecho for tipo, linha, trecho in impl.bifurcacoes}.items())
    bifurcacoes_unicas.sort(key=lambda item: item[0][1])
    partes.append(
        formatar_secao(
            "Pontos de bifurcação (cada um pode merecer um cenário)",
            [
                f"linha {linha}: **{tipo}** — `{trecho[:120]}`"
                for (tipo, linha), trecho in bifurcacoes_unicas
            ],
        )
    )

    chamadas_unicas = list(
        {(tipo, linha): trecho for tipo, linha, trecho in impl.chamadas_externas}.items()
    )
    chamadas_unicas.sort(key=lambda item: item[0][1])
    partes.append(
        formatar_secao(
            "Chamadas externas (precisam de mock no teste)",
            [
                f"linha {linha}: **{tipo}** — `{trecho[:120]}`"
                for (tipo, linha), trecho in chamadas_unicas
            ],
        )
    )

    if teste is not None:
        partes.append(
            formatar_secao(
                "Describes existentes no teste",
                [f"`{descricao}` — linha {linha}" for descricao, linha in teste.describes],
            )
        )
        partes.append(
            formatar_secao(
                "It existentes no teste",
                [f"`{descricao}` — linha {linha}" for descricao, linha in teste.its],
            )
        )

        formato_padrao = re.compile(r"^deve\s+.+\s+quando\s+.+", re.IGNORECASE)
        fora_do_padrao = [
            (descricao, linha)
            for descricao, linha in teste.its
            if not formato_padrao.match(descricao.strip())
        ]
        partes.append(
            formatar_secao(
                "It fora do padrão `deve … quando …`",
                [f"linha {linha}: `{descricao}`" for descricao, linha in fora_do_padrao],
            )
        )

    partes.append("## Próximos passos sugeridos ao agente")
    partes.append("")
    partes.append("1. Cruzar cada bifurcação com pelo menos um `it()` na matriz de cenários.")
    partes.append("2. Confirmar que todas as chamadas externas estão mockadas no `vi.mock(...)`.")
    partes.append("3. Renomear `it()` fora do padrão `deve … quando …` (qa-tester exige esse formato).")
    partes.append("4. Rodar `npx vitest run` e validar que toda a matriz proposta passa.")

    return "\n".join(partes) + "\n"


def main() -> int:
    if len(sys.argv) < 2:
        print(
            "Uso: python analisar_cobertura_cenarios.py <implementacao> [<teste>]",
            file=sys.stderr,
        )
        return 1

    caminho_impl = Path(sys.argv[1]).resolve()
    if not caminho_impl.exists() or not caminho_impl.is_file():
        print(f"Implementação não encontrada: {caminho_impl}", file=sys.stderr)
        return 1

    teste: AnaliseTeste | None = None
    if len(sys.argv) >= 3:
        caminho_teste = Path(sys.argv[2]).resolve()
        if not caminho_teste.exists() or not caminho_teste.is_file():
            print(f"Teste não encontrado: {caminho_teste}", file=sys.stderr)
            return 1
        teste = analisar_teste(caminho_teste)

    impl = analisar_implementacao(caminho_impl)
    print(gerar_relatorio(impl, teste))
    return 0


if __name__ == "__main__":
    sys.exit(main())
