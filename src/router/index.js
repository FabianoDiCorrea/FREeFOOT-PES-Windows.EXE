import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/universo', name: 'universo', component: () => import('../views/UniversoView.vue') },
        { path: '/carreira', name: 'carreira', component: () => import('../views/CarreiraView.vue') },
        { path: '/carreira/resumo', name: 'career-dashboard', component: () => import('../views/CareerDashboardView.vue') },
        { path: '/premio-individual', name: 'individual-awards', component: () => import('../views/IndividualAwardsHistory.vue') },
        { path: '/rankings', name: 'rankings', component: () => import('../views/RankingsView.vue') },
        { path: '/backup', name: 'backup', component: () => import('../views/BackupView.vue') },
        { path: '/season/:id', name: 'season-detail', component: () => import('../views/SeasonDetailView.vue') },
        { path: '/competicao/:id/historico', name: 'competition-history', component: () => import('../views/CompetitionHistoryView.vue') },
        { path: '/pais/:id/historico', name: 'country-history', component: () => import('../views/CountryHistoryView.vue') },
        { path: '/pais/:id/matriz', name: 'country-matrix', component: () => import('../views/CountrySeasonMatrixView.vue') },
        { path: '/pais/:id/trofeus', name: 'country-trophies', component: () => import('../views/CountryTrophyRoomView.vue') },
        { path: '/selecao/:id/historico', name: 'national-history', component: () => import('../views/NationalHistoryView.vue') },
        { path: '/selecao/:id/matriz', name: 'national-matrix', component: () => import('../views/NationalSeasonMatrixView.vue') },
        { path: '/checklist', name: 'season-checklist', component: () => import('../views/SeasonChecklistView.vue') },
        { path: '/sala-de-trofeus', name: 'trophy-room', component: () => import('../views/TrophyRoomView.vue') },
        { path: '/clubes', name: 'club-management', component: () => import('../views/ClubManagementView.vue') },
        { path: '/clube/:id/historico', name: 'club-history', component: () => import('../views/ClubHistoryView.vue') },
    ],
});

export default router;
