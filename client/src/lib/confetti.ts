// Simple confetti effect for correct answers
export function triggerConfetti() {
  const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createConfettiPiece(color: string) {
  const confetti = document.createElement("div");
  confetti.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    background-color: ${color};
    left: ${Math.random() * 100}vw;
    top: -10px;
    opacity: 1;
    border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
    pointer-events: none;
    z-index: 9999;
    transform: rotate(${Math.random() * 360}deg);
  `;
  
  document.body.appendChild(confetti);
  
  const animation = confetti.animate([
    { 
      transform: `translateY(0) rotate(0deg)`, 
      opacity: 1 
    },
    { 
      transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, 
      opacity: 0 
    }
  ], {
    duration: 2000 + Math.random() * 1000,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  });
  
  animation.onfinish = () => confetti.remove();
}

// Celebrate with multiple bursts
export function triggerCelebration() {
  triggerConfetti();
  setTimeout(triggerConfetti, 200);
  setTimeout(triggerConfetti, 400);
}
