/**
 * Pricing Modal Component
 * Displays subscription pricing options
 */

export function initPricingModal() {
    const pricingBtn = document.getElementById('pricing-btn');
    const modal = document.getElementById('pricing-modal');
    const closeBtn = document.getElementById('close-modal');

    // Open modal
    pricingBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    // Plan button handlers
    const planButtons = modal.querySelectorAll('.plan-btn');
    planButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.pricing-card');
            if (card.classList.contains('free')) {
                // Free plan - already current
                return;
            } else if (card.classList.contains('standard')) {
                // Standard plan upgrade
                handleUpgrade('standard');
            } else if (card.classList.contains('pro')) {
                // Pro plan - manage subscription
                handleManageSubscription();
            }
        });
    });

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function handleUpgrade(plan) {
        // In a real app, this would redirect to payment
        alert(`${plan.toUpperCase()}プランへのアップグレードページに移動します`);
        closeModal();
    }

    function handleManageSubscription() {
        // In a real app, this would open subscription management
        alert('サブスクリプション管理ページに移動します');
        closeModal();
    }
}
