Rotina e Níveis Pessoais
Este projeto é um backend para uma aplicação web de rotina e níveis pessoais, desenvolvida utilizando Node.js, Fastify, TypeScript e JWT. O objetivo da aplicação é permitir que os usuários ganhem pontos e subam de nível com base nas atividades realizadas.

Funcionalidades
Até o momento, as seguintes funcionalidades estão implementadas:

1. Estrutura de Projeto
Node.js e Fastify são utilizados para criar um servidor backend eficiente.
TypeScript é utilizado para tipagem forte e melhorar a qualidade do código.
JWT (JSON Web Token) é utilizado para autenticação e gerenciamento de sessões de usuário.
2. Cadastro e Login de Usuário
O sistema permite o cadastro de usuários com um e-mail e senha.
O login é realizado através de e-mail e senha, gerando um token JWT que pode ser usado para autenticação nas próximas requisições.
3. Geração de Tokens JWT
Após o login com sucesso, o usuário recebe um token JWT.
Este token é utilizado para autorizar acessos e proteger rotas no sistema, garantindo que somente usuários autenticados possam acessar determinadas funcionalidades.
4. Estrutura de Níveis
O sistema permite que os usuários acumulem pontos com base nas atividades realizadas.
Quando o usuário atinge uma determinada quantidade de pontos, ele sobe de nível.
Tecnologias Utilizadas
Node.js: Ambiente de execução para JavaScript.
Fastify: Framework web altamente eficiente para Node.js.
TypeScript: Superconjunto do JavaScript que adiciona tipagem estática.
JWT: Sistema de tokens para autenticação de usuários.
