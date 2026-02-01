document.querySelectorAll(".progress-circle").forEach(circle => {
  let progress = circle.getAttribute("data-progress");
  circle.style.setProperty("--progress", progress + "%");
});
