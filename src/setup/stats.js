import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

export default stats;
