let currentFireflies = 0;
const MAX_FIREFLIES = 10;
const INITIAL_FIREFLIES = 3;
let resizeTimeout;
class Firefly {
  constructor(container) {
    if (currentFireflies >= MAX_FIREFLIES) return;
    
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'firefly';
    this.active = true;
    this.isGlowing = false;
    
    currentFireflies++;
    
    this.initPosition();
    this.startLifeCycle();
    this.container.appendChild(this.element);
  }
  
  initPosition() {
    const margin = 100;
    this.x = Math.random() * (window.innerWidth + margin * 2) - margin;
    this.y = Math.random() * (window.innerHeight + margin * 2) - margin;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 1 + Math.random() * 2;
  }
  
  startLifeCycle() {
    this.fadeIn();
    
    setTimeout(() => {
      this.move();
        
      setTimeout(() => {
        this.fadeOut();
      }, 8000 + Math.random() * 5000); 
    }, 2000); 
  }
  
  fadeIn() {
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.style.opacity = '0.9';
      this.isGlowing = true;
    }, 50);
  }
  
  move() {
    if (!this.active) return;
    
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    
    this.element.style.transform = `translate(${Math.cos(this.angle) * this.speed}px, ${Math.sin(this.angle) * this.speed}px)`;
    
    const margin = 150;
    if (this.x < -margin || this.x > window.innerWidth + margin || 
      this.y < -margin || this.y > window.innerHeight + margin) {
      this.angle = Math.random() * Math.PI * 2;
    }
    
    if (this.isGlowing) {
      requestAnimationFrame(() => this.move());
    }
  }
  
  fadeOut() {
    this.isGlowing = false;
    this.element.style.opacity = '0';
    
    setTimeout(() => {
      if (this.element.parentNode === this.container) {
       this.container.removeChild(this.element);
      }
      currentFireflies--;
      new Firefly(this.container);
    }, 2000); 
  }
}
function initFireflies() {
  const container = document.getElementById('fireflies-container');
  if (!container) return;
  
  container.innerHTML = '';
  currentFireflies = 0;
  
  for (let i = 0; i < INITIAL_FIREFLIES; i++) {
    setTimeout(() => {
      new Firefly(container);
    }, i * 1000);
  }
  
  for (let i = INITIAL_FIREFLIES; i < MAX_FIREFLIES; i++) {
    setTimeout(() => {
      new Firefly(container);
    }, i * 1500);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  initFireflies();
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initFireflies();
    }, 200);
  });
});