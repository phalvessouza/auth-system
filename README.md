# Login System

Este projeto é um sistema de login simples desenvolvido em JavaScript utilizando Express e PostgreSQL com Sequelize. O objetivo é fornecer uma estrutura básica para autenticação de usuários.

## Dependências

- Express: Framework web para Node.js.
- Sequelize: ORM para Node.js que suporta PostgreSQL.
- PostgreSQL: Sistema de gerenciamento de banco de dados relacional.

## Como Executar

1. Clone o repositório.
2. Instale as dependências com `npm install`.
3. Configure o banco de dados no arquivo `.env`.
4. Execute a aplicação com `npm start`.

## Funcionalidades

- Registro de usuários
- Login de usuários
- Autenticação básica
- Recuperação de senha

## Endpoints

### Registro de Usuário

**POST** `/api/auth/register`

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

### Login de Usuário

**POST** `/api/auth/login`
```
{
  "username": "string",
  "password": "string"
}

```

### Recuperação de Senha

**POST** `/api/auth/forgot-password`
```
{
  "email": "string"
}

```

### Redefinição de Senha

**POST** `/api/auth/reset-password/:token`
```
{
  "password": "string"
}

```

Contribuição
Sinta-se à vontade para contribuir com melhorias e correções.