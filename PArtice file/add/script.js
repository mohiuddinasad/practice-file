// Show popup after 3 seconds (if not disabled in session)
window.onload = function () {
  if (!sessionStorage.getItem("hidePopup")) {
    setTimeout(() => {
      document.getElementById("popup").style.display = "flex";
    }, 3000);
  }
};

// Close button
document.getElementById("closeBtn").onclick = function () {
  document.getElementById("popup").style.display = "none";

  // If checkbox is checked, save to sessionStorage
  if (document.getElementById("dontShow").checked) {
    sessionStorage.setItem("hidePopup", "true");
  }
};

// Click outside to close
window.onclick = function (e) {
  if (e.target === document.getElementById("popup")) {
    document.getElementById("popup").style.display = "none";

    // If checkbox is checked, save to sessionStorage
    if (document.getElementById("dontShow").checked) {
      sessionStorage.setItem("hidePopup", "true");
    }
  }
};
