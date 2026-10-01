// Path: packages/database/src/index.ts
// Barrel público do @digimon/database — única porta de entrada do pacote.
// Nenhum outro pacote importa @prisma/client: todos importam daqui.
// Exporta o client singleton (adapter-pg), o namespace Prisma, os tipos de
// modelos e os enums gerados pelo generator prisma-client (src/generated/prisma).

export { prisma } from './client'

export {
  Prisma,
  PrismaClient,
  Role,
  UserStatus,
  PostStatus,
  PostCategory,
  CommentStatus,
  CommentTargetType,
  TournamentStatus,
  DeckStatus,
  CardType,
  CardColor
} from './generated/prisma/client'
export type {
  User,
  RefreshToken,
  PasswordResetToken,
  Post,
  Comment,
  Tournament,
  Deck,
  DeckCopy,
  Card,
  CardSet
} from './generated/prisma/client'
