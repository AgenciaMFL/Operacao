# Automação: Troca de Encarte - Rio'Atacadão

Script para trocar automaticamente as imagens do encarte no WordPress via Elementor.

## Primeira vez (instalar dependências)

```bash
npm install
npx playwright install chromium
```

## Como usar

```bash
node trocar-encarte.js imagem-pagina1.jpg imagem-pagina2.jpg
```

**Exemplo mês de julho:**
```bash
node trocar-encarte.js encarte-jul-p1.jpg encarte-jul-p2.jpg
```

O script vai:
1. Abrir o Chrome automaticamente
2. Fazer login no WordPress
3. Abrir o editor Elementor da página "Encarte"
4. Substituir as imagens na ordem (p1 = primeira imagem, p2 = segunda)
5. Publicar as alterações
6. Fechar o navegador

## Observações

- As imagens devem estar na mesma pasta onde o script é executado (ou passe o caminho completo)
- O navegador abre visível para você acompanhar — para rodar em segundo plano, mude `headless: false` para `headless: true` no script
- Se der erro, um arquivo `debug-erro.png` é gerado com o print da tela
