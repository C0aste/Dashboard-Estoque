# Dashboard de Ativos e Estoque

Dashboard responsivo para visualização de materiais, EPI, uniformes, ativos e movimentações.

Projeto desenvolvido como demonstração de interface e arquitetura front-end, utilizando dados fictícios locais.

## Recursos

- Dashboard responsivo
- Filtros por categoria
- Busca geral e por grupo
- Indicadores de quantidade e valor
- Gráficos com Chart.js
- Histórico de movimentações
- Tabelas responsivas
- Layout adaptado para desktop e mobile
- Dados mockados, sem necessidade de backend
- Visual minimalista inspirado em interfaces modernas

## Tecnologias

- HTML5
- CSS
- Tailwind CSS
- JavaScript
- jQuery
- Chart.js

## Executar localmente

Basta abrir `index.html` no navegador.

Para desenvolvimento, também pode ser utilizado o Live Server do VS Code.

## Estrutura

```text
dashboard-ativos-materiais/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css
    ├── img/
    │   └── favicon.svg
    └── js/
        ├── app.js
        └── mock-data.js
```

## Dados

Os dados presentes em `assets/js/mock-data.js` são fictícios e servem apenas para demonstração.

Para conectar o projeto a uma API real, a camada de carregamento de dados em `assets/js/app.js` pode ser substituída sem necessidade de alterar a interface.
