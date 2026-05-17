const titles = [
  "AI/ML Engineer",
  "Healthcare AI Builder",
  "Computer Vision Developer",
  "NLP Systems Engineer"
];

const target = document.getElementById("typed-title");
let titleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const current = titles[titleIndex];

  if (deleting) {
    charIndex -= 1;
  } else {
    charIndex += 1;
  }

  target.textContent = current.slice(0, charIndex);

  if (!deleting && charIndex === current.length) {
    deleting = true;
    setTimeout(typeLoop, 1200);
    return;
  }

  if (deleting && charIndex === 0) {
    deleting = false;
    titleIndex = (titleIndex + 1) % titles.length;
  }

  setTimeout(typeLoop, deleting ? 45 : 75);
}

typeLoop();
