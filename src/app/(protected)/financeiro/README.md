# Página Financeira

Esta página permite visualizar e gerenciar os dados financeiros dos alunos.

## Funcionalidades

### Tabela Principal
- **Nome do Aluno**: Exibe o nome completo do aluno
- **Escola**: Mostra a escola onde o aluno está matriculado
- **Classe**: Exibe a classe/turma do aluno
- **Dados Financeiros**: Botão que abre um dialog com o histórico financeiro

### Dialog de Dados Financeiros
Quando clicado no botão "Dados Financeiros", abre um dialog que mostra:

#### Informações do Aluno
- Nome do aluno
- Classe
- Total pago (soma de todas as transações)

#### Botão Adicionar Transação
- Permite cadastrar novas transações financeiras
- Formulário com validação completa

#### Histórico de Transações
Tabela com as seguintes colunas:
- **Data**: Data e hora da transação
- **Método**: Forma de pagamento (PIX, Débito, Crédito à Vista, Crédito Parcelado, Boleto Bancário)
- **Parcela**: Número da parcela (para pagamentos parcelados)
- **Valor**: Valor da transação formatado em Real (R$)
- **Ações**: Botões para editar e deletar transações

#### Resumo
- Total de transações realizadas

### Funcionalidades de CRUD
- **Criar**: Adicionar novas transações financeiras
- **Ler**: Visualizar histórico completo
- **Atualizar**: Editar transações existentes
- **Deletar**: Remover transações com confirmação

## Estrutura de Arquivos

```
financeiro/
├── page.tsx                    # Página principal
├── components/
│   ├── financeiro-with-search.tsx  # Componente com busca
│   ├── financeiro-table.tsx        # Tabela principal
│   ├── financeiro-dialog.tsx       # Dialog com dados financeiros
│   ├── upsert-finance-form.tsx     # Formulário para adicionar/editar
│   └── index.ts                    # Exportações dos componentes
└── README.md                      # Esta documentação
```

## Dependências

- `date-fns`: Para formatação de datas
- `lucide-react`: Para ícones
- Componentes UI do projeto (Button, Table, Dialog, etc.)

## Como Usar

1. Acesse a página através do menu lateral "Financeiro"
2. Use a barra de busca para filtrar alunos por nome, classe ou escola
3. Clique no botão "Dados Financeiros" para ver o histórico completo
4. O dialog mostrará todas as transações do aluno selecionado

### Adicionando Transações

1. No dialog de dados financeiros, clique no botão "Adicionar Transação"
2. Preencha os campos:
   - **Método de Pagamento**: Selecione a forma de pagamento
   - **Parcela**: Aparece apenas para Boleto Bancário e Crédito Parcelado
   - **Valor Total**: Digite o valor total (formatação automática em R$)
       - **Valor das Parcelas**: Aparece automaticamente para Boleto Bancário e Crédito Parcelado (valor total ÷ número de parcelas)
3. Clique em "Salvar"

### Editando Transações

1. Na tabela de transações, clique no botão "Editar" (ícone de lápis)
2. Modifique os dados desejados
3. Clique em "Salvar"

### Deletando Transações

1. Na tabela de transações, clique no botão "Deletar" (ícone de lixeira)
2. Confirme a exclusão no dialog de confirmação

## Dados do Banco

A página utiliza as seguintes tabelas do banco de dados:
- `alunos`: Informações dos alunos
- `escolas`: Informações das escolas
- `finances`: Transações financeiras

## Formatação

- **Valores**: Formatados em Real brasileiro (R$)
- **Datas**: Formato brasileiro (dd/MM/yyyy às HH:mm)
- **Métodos de Pagamento**: Traduzidos para português
- **Parcelas**: Mostradas apenas para pagamentos parcelados
- **Valor das Parcelas**: Calculado automaticamente (valor total ÷ número de parcelas) para Boleto Bancário e Crédito Parcelado
