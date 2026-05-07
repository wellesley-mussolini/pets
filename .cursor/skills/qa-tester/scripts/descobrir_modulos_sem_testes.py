"""
Descobre módulos do projeto que ainda não possuem testes.

Uso:
    python descobrir_modulos_sem_testes.py [<pasta-raiz>]

Pasta raiz padrão: `src`. Convenção de teste do projeto: `**/tests/**/*.test.{ts,tsx}`.

Considera "candidato a ter teste" qualquer módulo dentro de:
- src/modules/<nome>/components/
- src/modules/<nome>/hooks/
- src/modules/<nome>/utils/
- src/app/**/components/
- src/app/**/utils/
- src/app/**/hooks/

Ignora `types/`, `constants/` e `zod/` puros (raramente recebem teste unitário direto).
"""

from __future__ import annotations

import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

EXTENSOES_ALVO = {".ts", ".tsx"}
PASTAS_TESTAVEIS = {"components", "hooks", "utils"}
PASTAS_IGNORADAS = {"node_modules", ".next", "dist", "build", ".git", "tests"}
PASTAS_DE_TERCEIROS = {("components", "ui")}
SUFIXOS_NAO_TESTAVEIS = {".types.ts", ".constants.ts", ".zod.ts", ".d.ts"}


def deve_ignorar(caminho: Path) -> bool:
    if any(parte in PASTAS_IGNORADAS for parte in caminho.parts):
        return True
    for trecho in PASTAS_DE_TERCEIROS:
        if all(parte in caminho.parts for parte in trecho):
            return True
    nome = caminho.name
    return any(nome.endswith(sufixo) for sufixo in SUFIXOS_NAO_TESTAVEIS)


def chave_teste_para_arquivo(arquivo: Path) -> str:
    """Gera uma chave que liga um arquivo de implementação a um possível arquivo de teste."""
    nome_base = arquivo.stem
    for sufixo in (".component", ".hook", ".utils"):
        if nome_base.endswith(sufixo):
            nome_base = nome_base[: -len(sufixo)]
            break
    return nome_base.lower()


def modulo_logico_do_arquivo(arquivo: Path, raiz: Path) -> Path:
    """
    Devolve a pasta que representa o módulo lógico do arquivo.
    - src/modules/<nome>/...      -> src/modules/<nome>
    - src/app/(group)/<feat>/...  -> src/app/(group)/<feat>
    - src/app/<feat>/...          -> src/app/<feat>
    - src/components/<grupo>/...  -> src/components/<grupo>
    - caso contrário              -> pasta pai imediata
    """
    try:
        partes = arquivo.relative_to(raiz).parts
    except ValueError:
        return arquivo.parent

    if len(partes) >= 2 and partes[0] == "modules":
        return raiz / partes[0] / partes[1]
    if len(partes) >= 3 and partes[0] == "app":
        primeira_dentro_de_app = partes[1]
        if primeira_dentro_de_app.startswith("(") and len(partes) >= 3:
            return raiz / partes[0] / partes[1] / partes[2]
        return raiz / partes[0] / partes[1]
    if len(partes) >= 2 and partes[0] == "components":
        return raiz / partes[0] / partes[1]
    return arquivo.parent


def coletar_implementacoes(raiz: Path) -> list[Path]:
    arquivos: list[Path] = []
    for caminho in raiz.rglob("*"):
        if caminho.is_dir():
            continue
        if caminho.suffix not in EXTENSOES_ALVO:
            continue
        if deve_ignorar(caminho):
            continue
        if not any(parte in PASTAS_TESTAVEIS for parte in caminho.parts):
            continue
        arquivos.append(caminho)
    return sorted(arquivos)


def coletar_testes(raiz: Path) -> list[Path]:
    return sorted(
        caminho
        for caminho in raiz.rglob("*.test.*")
        if caminho.suffix in EXTENSOES_ALVO and "tests" in caminho.parts
    )


def chaves_dos_testes(testes: list[Path]) -> set[str]:
    chaves: set[str] = set()
    for teste in testes:
        chaves.add(teste.stem.replace(".test", "").lower())
    return chaves


def modulos_com_pelo_menos_um_teste(testes: list[Path], raiz: Path) -> set[Path]:
    return {modulo_logico_do_arquivo(teste, raiz) for teste in testes}


def main() -> int:
    raiz = Path(sys.argv[1]).resolve() if len(sys.argv) >= 2 else Path("src").resolve()
    if not raiz.exists():
        print(f"Pasta não encontrada: {raiz}", file=sys.stderr)
        return 1

    implementacoes = coletar_implementacoes(raiz)
    testes = coletar_testes(raiz)
    chaves_teste = chaves_dos_testes(testes)
    modulos_testados = modulos_com_pelo_menos_um_teste(testes, raiz)

    sem_teste: list[Path] = []
    com_teste: list[Path] = []
    for arquivo in implementacoes:
        chave = chave_teste_para_arquivo(arquivo)
        casa_pelo_nome = any(chave in chave_teste or chave_teste in chave for chave_teste in chaves_teste)
        modulo = modulo_logico_do_arquivo(arquivo, raiz)
        casa_pelo_modulo = modulo in modulos_testados
        if casa_pelo_nome or casa_pelo_modulo:
            com_teste.append(arquivo)
        else:
            sem_teste.append(arquivo)

    print(f"# Cobertura de testes em `{raiz.as_posix()}`")
    print()
    print(f"- Implementações testáveis encontradas: {len(implementacoes)}")
    print(f"- Arquivos com teste correspondente (heurística): {len(com_teste)}")
    print(f"- Arquivos **sem** teste correspondente: {len(sem_teste)}")
    print(f"- Arquivos de teste descobertos: {len(testes)}")
    print()

    print("## Arquivos sem teste")
    print()
    if not sem_teste:
        print("Nenhum.")
    else:
        for arquivo in sem_teste:
            print(f"- `{arquivo.as_posix()}`")
    print()

    print("## Arquivos de teste descobertos")
    print()
    if not testes:
        print("Nenhum teste encontrado.")
    else:
        for teste in testes:
            print(f"- `{teste.as_posix()}`")
    print()

    print("## Próximos passos sugeridos ao agente")
    print()
    print("1. Priorizar criação de testes para arquivos de `hooks/` e `components/` listados acima.")
    print("2. Para cada candidato, montar a matriz de cenários (skill `qa-tester`) antes de escrever testes.")
    print("3. Confirmar que o nome do teste segue a convenção `<nome>.test.{ts,tsx}` dentro de uma pasta `tests/`.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
