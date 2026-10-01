// Военная кафедра — основной скрипт
document.addEventListener('DOMContentLoaded', () => {
  // Подсветка активной ссылки
  const path = window.location.pathname;
  const current = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-main a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const file = href.split('/').pop();
    if (file === current || (current === '' && file === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Мобильное меню
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  // FAQ аккордеон
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  // Табы
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabs = btn.closest('.tabs');
      const panels = tabs.parentElement.querySelectorAll('.tab-panel');
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
});
