# Login System

Este projeto é um sistema de login simples desenvolvido em JavaScript utilizando Express e PostgreSQL com Sequelize. O objetivo é fornecer uma estrutura básica para autenticação de usuários.

## Estrutura do Projeto

```
login-system
├── src
│   ├── controllers
│   │   └── authController.js  # Controlador para gerenciar autenticação
│   ├── models
│   │   └── index.js            # Configuração do Sequelize e modelos de dados
│   ├── routes
│   │   └── authRoutes.js       # Definição das rotas de autenticação
│   ├── config
│   │   └── database.js         # Configuração da conexão com o banco de dados
│   └── app.js                  # Ponto de entrada da aplicação
├── package.json                 # Configuração do npm
├── .sequelizerc                # Configuração do Sequelize
└── README.md                   # Documentação do projeto
```

## Dependências

- Express: Framework web para Node.js.
- Sequelize: ORM para Node.js que suporta PostgreSQL.
- PostgreSQL: Sistema de gerenciamento de banco de dados relacional.

## Como Executar

1. Clone o repositório.
2. Instale as dependências com `npm install`.
3. Configure o banco de dados no arquivo `src/config/database.js`.
4. Execute a aplicação com `node src/app.js`.

## Funcionalidades

- Registro de usuários
- Login de usuários
- Autenticação básica

## Contribuição

Sinta-se à vontade para contribuir com melhorias e correções.