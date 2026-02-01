const progressBars = document.querySelectorAll('.progress');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const progress = entry.target;
      const value = progress.getAttribute('data-progress');
      progress.style.width = value + '%';
    }
  });
}, { threshold: 0.5 });

progressBars.forEach(bar => {
  observer.observe(bar);
});
