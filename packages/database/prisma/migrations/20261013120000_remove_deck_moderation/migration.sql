-- Remove a moderação de decks da comunidade (@digimon/decks): reportes da
-- comunidade e a fila admin (hide/restore/dismiss) saem da feature. O enum
-- PublicDeckStatus mantém o valor HIDDEN — o Postgres não remove valor de enum
-- sem recriar o tipo (risco com dados legados); apenas a ação que o setava sai.

-- DropTable
DROP TABLE "community_deck_reports";
