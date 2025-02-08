# Login System

Este projeto é um sistema de login simples desenvolvido em JavaScript utilizando Express e PostgreSQL com Sequelize. O objetivo é fornecer uma estrutura básica para autenticação de usuários.

## Dependências

- Express: Framework web para Node.js.
- Sequelize: ORM para Node.js que suporta PostgreSQL.
- PostgreSQL: Sistema de gerenciamento de banco de dados relacional.

## Como Executar

- Clone o repositório.

git clone ```https://github.com/phalvessouza/auth-system.git```

- abra o diretorio do projeto `cd AUTH-SYSTEM`

- Instale as dependências com `npm install`

- Configure o banco de dados no arquivo `.env`

```
DB_NAME=seu_banco_de_dados
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=sua_chave_secreta
EMAIL=seu_email
EMAIL_PASSWORD=sua_senha_de_email
```
- Execute a aplicação com `npm start`.

## Funcionalidades

- Registro de usuários
- Login de usuários 
- Recuperação de senha


Contribuição

Sinta-se à vontade para contribuir com melhorias e correções.

```
Faça um fork do projeto
Crie uma branch para sua feature (git checkout -b feature/fooBar)
Commit suas mudanças (git commit -am 'Add some fooBar')
Push para a branch (git push origin feature/fooBar)
Crie um novo Pull Request
```