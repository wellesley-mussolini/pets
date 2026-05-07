"""
Encontra blocos de código duplicados (>= N linhas iguais) entre arquivos do projeto.

Uso:
    python find_duplicate_blocks.py <pasta> [tamanho-minimo-linhas]

Exemplo:
    python .cursor/skills/simplificador/scripts/find_duplicate_blocks.py src 6

O agente deve usar o relatório para extrair lógica duplicada para `utils/` ou `constants/`.
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

EXTENSOES_ALVO = {".ts", ".tsx"}
PASTAS_IGNORADAS = {"node_modules", ".next", "dist", "build", ".git", "tests"}
TAMANHO_MINIMO_PADRAO = 6


@dataclass(frozen=True)
class TrechoNoArquivo:
    arquivo: Path
    linha_inicial: int


def normalizar_linha(linha: str) -> str:
    sem_comentario = re.sub(r"//.*$", "", linha)
    return re.sub(r"\s+", " ", sem_comentario).strip()


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


def encontrar_duplicados(
    arquivos: list[Path], tamanho_minimo: int
) -> dict[tuple[str, ...], list[TrechoNoArquivo]]:
    ocorrencias: dict[tuple[str, ...], list[TrechoNoArquivo]] = defaultdict(list)

    for arquivo in arquivos:
        try:
            linhas_originais = arquivo.read_text(encoding="utf-8").splitlines()
        except (UnicodeDecodeError, OSError):
            continue
        linhas_normalizadas = [normalizar_linha(linha) for linha in linhas_originais]

        for indice in range(len(linhas_normalizadas) - tamanho_minimo + 1):
            janela = tuple(linhas_normalizadas[indice : indice + tamanho_minimo])
            if any(not linha for linha in janela):
                continue
            if len({linha for linha in janela}) <= 2:
                continue
            ocorrencias[janela].append(
                TrechoNoArquivo(arquivo=arquivo, linha_inicial=indice + 1)
            )

    return {chave: valor for chave, valor in ocorrencias.items() if len({trecho.arquivo for trecho in valor}) >= 2}


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: python find_duplicate_blocks.py <pasta> [tamanho-minimo]", file=sys.stderr)
        return 1
    raiz = Path(sys.argv[1]).resolve()
    if not raiz.exists():
        print(f"Caminho não encontrado: {raiz}", file=sys.stderr)
        return 1
    tamanho_minimo = int(sys.argv[2]) if len(sys.argv) >= 3 else TAMANHO_MINIMO_PADRAO

    arquivos = coletar_arquivos(raiz)
    duplicados = encontrar_duplicados(arquivos, tamanho_minimo)

    print(f"# Blocos duplicados em `{raiz.as_posix()}`")
    print()
    print(f"- Arquivos analisados: {len(arquivos)}")
    print(f"- Tamanho mínimo do bloco: {tamanho_minimo} linhas")
    print(f"- Blocos duplicados encontrados: {len(duplicados)}")
    print()

    if not duplicados:
        print("Nenhum bloco duplicado encontrado pelo critério atual.")
        return 0

    duplicados_ordenados = sorted(
        duplicados.items(), key=lambda item: -len(item[1])
    )

    for indice, (bloco, trechos) in enumerate(duplicados_ordenados, start=1):
        print(f"## Bloco #{indice} ({len(trechos)} ocorrências)")
        print()
        print("```")
        for linha in bloco:
            print(linha)
        print("```")
        print()
        print("Ocorre em:")
        for trecho in trechos:
            print(f"- `{trecho.arquivo.as_posix()}:{trecho.linha_inicial}`")
        print()

    print("## Próximos passos sugeridos ao agente")
    print()
    print("1. Para cada bloco duplicado, decidir se a extração é segura.")
    print("2. Extrair para `utils/`, `constants/` ou hook compartilhado, conforme o tipo de lógica.")
    print("3. Substituir as ocorrências por chamadas à abstração extraída.")
    print("4. Rodar testes para confirmar equivalência.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
