# @digimon/users — Contexto do Módulo

## Responsabilidade
Contas, perfis e papéis globais (Administrator, Editor, Member). Gerencia usuários e atribuição de papéis — o Administrator é quem gerencia permissões.

## Entidades
- **User** — id, email, name, avatarUrl, passwordHash, role (administrator | editor | member), emailVerifiedAt, status, createdAt, updatedAt

## Use Cases
- `GetProfileUseCase` — dados do perfil do usuário logado
- `UpdateProfileUseCase` — nome/avatar
- `AssignRoleUseCase` — Administrator atribui papel a um usuário
- `ListUsersUseCase` — listagem (painel admin) com filtros
- `ActivateUserUseCase` / `DeactivateUserUseCase` — status de conta

## Eventos que Publica
- `user.created`, `user.updated`, `role.assigned`

## Eventos que Consome
- Nenhum (dados vêm de @digimon/auth no registro)

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)

## Repositórios
- `IUserRepository`

## Regras
- Papéis são **fixos e globais** (não multi-tenant): administrator, editor, member
- Papel padrão no registro: member
- Somente administrator gerencia papéis
- Frontend esconde UI por role; backend SEMPRE revalida (fronteira final de segurança)