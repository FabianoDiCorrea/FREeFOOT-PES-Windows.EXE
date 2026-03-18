import { db } from './db';

const STORAGE_KEY_SEASONS = 'temporadas';

export const hotfixService = {
    /**
     * Remove temporadas fantasmas da Argentina (2025/2026) que foram criadas indevidamente.
     */
    async applyArgentinaFix() {
        console.log('[HOTFIX] Iniciando verificação de dados sujos da Argentina...');
        try {
            const seasons = await db.get(STORAGE_KEY_SEASONS) || [];

            // Critérios para a "temporada fantasma":
            // 1. Ano é "2025 / 2026"
            // 2. Pertence à Argentina (pelo nome da competição ou por inferência)

            const originalCount = seasons.length;
            const cleanedSeasons = seasons.filter(s => {
                const is2025 = s.ano === "2025 / 2026" || s.ano === "2025/2026" || s.ano === "2025";

                const sName = (s.competitionName || "").toLowerCase();
                const isArgentina = s.pais === "Argentina" ||
                    sName.includes('argentina') ||
                    sName.includes('primera nacional') ||
                    sName.includes('liga profissional');

                // Se for 2025/2026 da Argentina, REMOVE (return false)
                if (is2025 && isArgentina) {
                    console.log(`[HOTFIX] Removendo registro fantasma: ${s.competitionName} - ${s.ano} (ID: ${s.id})`);
                    return false;
                }

                return true;
            });

            if (cleanedSeasons.length !== originalCount) {
                await db.save(STORAGE_KEY_SEASONS, cleanedSeasons);
                console.log(`[HOTFIX] Limpeza concluída! ${originalCount - cleanedSeasons.length} registros removidos.`);
            } else {
                console.log('[HOTFIX] Nenhum registro fantasma encontrado.');
            }
        } catch (error) {
            console.error('[HOTFIX] Erro ao aplicar correção da Argentina:', error);
        }
    }
};
