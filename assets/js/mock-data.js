const DADOS_MOCK = {
    MATERIAL: [
        {
            WhsCode: "DEP-001",
            WhsName: "Depósito Central",
            ValorTotal: 128450.75,
            itens: [
                { ItemCode: "MAT-001", ItemName: "Cabo Elétrico 2,5mm", OnHand: 120, AvgPrice: 18.50, StockValue: 2220 },
                { ItemCode: "MAT-002", ItemName: "Lâmpada LED 20W", OnHand: 85, AvgPrice: 24.90, StockValue: 2116.50 },
                { ItemCode: "MAT-003", ItemName: "Tomada 20A", OnHand: 60, AvgPrice: 16.90, StockValue: 1014 }
            ]
        },
        {
            WhsCode: "DEP-002",
            WhsName: "Almoxarifado Norte",
            ValorTotal: 76320.40,
            itens: [
                { ItemCode: "MAT-004", ItemName: "Fita Isolante", OnHand: 230, AvgPrice: 7.50, StockValue: 1725 },
                { ItemCode: "MAT-005", ItemName: "Disjuntor 20A", OnHand: 75, AvgPrice: 31.80, StockValue: 2385 },
                { ItemCode: "MAT-006", ItemName: "Eletroduto 3/4", OnHand: 140, AvgPrice: 12.40, StockValue: 1736 }
            ]
        },
        {
            WhsCode: "DEP-003",
            WhsName: "Depósito Operacional",
            ValorTotal: 54210.30,
            itens: [
                { ItemCode: "MAT-007", ItemName: "Abraçadeira Nylon", OnHand: 480, AvgPrice: 2.30, StockValue: 1104 },
                { ItemCode: "MAT-008", ItemName: "Conector Elétrico", OnHand: 190, AvgPrice: 9.90, StockValue: 1881 }
            ]
        }
    ],

    EPI: [
        {
            WhsCode: "EPI-001",
            WhsName: "Almoxarifado EPI",
            ValorTotal: 45890.00,
            itens: [
                { ItemCode: "EPI-001", ItemName: "Capacete de Segurança", OnHand: 45, AvgPrice: 42.90, StockValue: 1930.50 },
                { ItemCode: "EPI-002", ItemName: "Óculos de Proteção", OnHand: 80, AvgPrice: 18.50, StockValue: 1480 },
                { ItemCode: "EPI-003", ItemName: "Luva de Proteção", OnHand: 150, AvgPrice: 12.90, StockValue: 1935 }
            ]
        },
        {
            WhsCode: "EPI-002",
            WhsName: "Uniformes",
            ValorTotal: 32140.00,
            itens: [
                { ItemCode: "UNI-001", ItemName: "Camisa Operacional", OnHand: 75, AvgPrice: 58.00, StockValue: 4350 },
                { ItemCode: "UNI-002", ItemName: "Calça Operacional", OnHand: 62, AvgPrice: 72.00, StockValue: 4464 },
                { ItemCode: "UNI-003", ItemName: "Botina de Segurança", OnHand: 38, AvgPrice: 125.00, StockValue: 4750 }
            ]
        }
    ],

    ATIVO: [
        {
            CC: "CC-001",
            NAMECC: "Administrativo",
            COD_APROVADOR: "USR001",
            NOME_APROVADOR: "Responsável Administrativo",
            COD_USUARIO: "USR002",
            totalCentrosCusto: 4,
            itens: [
                { COD: "ATV-001", NOME: "Notebook Corporativo", VALIDF: "2026-01-10", VALIDT: "2029-01-10", VALOR_INICIAL: 4500, VALOR_RESTANTE: 2800 },
                { COD: "ATV-002", NOME: "Monitor 24 polegadas", VALIDF: "2026-02-05", VALIDT: "2029-02-05", VALOR_INICIAL: 1200, VALOR_RESTANTE: 850 }
            ]
        },
        {
            CC: "CC-002",
            NAMECC: "Operações",
            COD_APROVADOR: "USR003",
            NOME_APROVADOR: "Responsável Operacional",
            COD_USUARIO: "USR004",
            totalCentrosCusto: 4,
            itens: [
                { COD: "ATV-003", NOME: "Notebook Operacional", VALIDF: "2026-01-15", VALIDT: "2029-01-15", VALOR_INICIAL: 5200, VALOR_RESTANTE: 3900 },
                { COD: "ATV-004", NOME: "Impressora Multifuncional", VALIDF: "2026-03-01", VALIDT: "2030-03-01", VALOR_INICIAL: 3800, VALOR_RESTANTE: 3100 },
                { COD: "ATV-005", NOME: "Rádio Comunicador", VALIDF: "2026-03-20", VALIDT: "2029-03-20", VALOR_INICIAL: 980, VALOR_RESTANTE: 720 }
            ]
        }
    ]
};

const HISTORICO_MOCK = [
    {
        Warehouse: "DEP-001",
        WhsName: "Depósito Central",
        itens: [
            { Tipo: "Entrada", ItemCode: "MAT-001", Dscription: "Cabo Elétrico 2,5mm", CreateDate: "2026-09-29", InQty: 50, OutQty: 0, Price: 18.50 },
            { Tipo: "Saída", ItemCode: "MAT-002", Dscription: "Lâmpada LED 20W", CreateDate: "2026-09-29", InQty: 0, OutQty: 12, Price: 24.90 },
            { Tipo: "Entrada", ItemCode: "MAT-003", Dscription: "Tomada 20A", CreateDate: "2026-09-28", InQty: 25, OutQty: 0, Price: 16.90 }
        ]
    },
    {
        Warehouse: "DEP-002",
        WhsName: "Almoxarifado Norte",
        itens: [
            { Tipo: "Entrada", ItemCode: "MAT-004", Dscription: "Fita Isolante", CreateDate: "2026-09-29", InQty: 100, OutQty: 0, Price: 7.50 },
            { Tipo: "Saída", ItemCode: "MAT-005", Dscription: "Disjuntor 20A", CreateDate: "2026-09-27", InQty: 0, OutQty: 8, Price: 31.80 }
        ]
    },
    {
        Warehouse: "DEP-003",
        WhsName: "Depósito Operacional",
        itens: [
            { Tipo: "Entrada", ItemCode: "MAT-007", Dscription: "Abraçadeira Nylon", CreateDate: "2026-09-26", InQty: 250, OutQty: 0, Price: 2.30 }
        ]
    }
];
