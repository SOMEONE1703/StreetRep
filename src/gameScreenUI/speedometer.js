"use strict";
/*
* TESLA HUD BY Tameem Imamdad timamdad@hawk.iit.edu
GitHub: https://github.com/tameemi/tesla-speedometer
*/

let dev = false;

const c = document.getElementById("speedometer");
c.width = 500;
c.height = 500;

const ctx = c.getContext("2d");

// Rescale the size
ctx.scale(1, 1);

const speedGradient = ctx.createLinearGradient(0, 500, 0, 0);
speedGradient.addColorStop(0, "#00b8fe");
speedGradient.addColorStop(1, "#41dcf4");

const rpmGradient = ctx.createLinearGradient(0, 500, 0, 0);
rpmGradient.addColorStop(0, "#f7b733");
rpmGradient.addColorStop(1, "#fc4a1a");

function speedNeedle(rotation) {
  ctx.lineWidth = 2;
  ctx.save();
  ctx.translate(250, 250);
  ctx.rotate(rotation);
  ctx.strokeRect(-130 / 2 + 170, -1 / 2, 135, 1);
  ctx.restore();
}

function rpmNeedle(rotation) {
  ctx.lineWidth = 2;
  ctx.save();
  ctx.translate(250, 250);
  ctx.rotate(rotation);
  ctx.strokeRect(-130 / 2 + 170, -1 / 2, 135, 1);
  ctx.restore();
}

function drawMiniNeedle(rotation, width, speed) {
  ctx.lineWidth = width;
  ctx.save();
  ctx.translate(250, 250);
  ctx.rotate(rotation);
  ctx.strokeStyle = "#333";
  ctx.fillStyle = "#333";
  ctx.strokeRect(-20 / 2 + 220, -1 / 2, 20, 1);
  ctx.restore();

  const x = 250 + 180 * Math.cos(rotation);
  const y = 250 + 180 * Math.sin(rotation);
  ctx.font = "700 20px Open Sans";
  ctx.fillText(speed, x, y);
}

function calculateSpeedAngle(x, a, b) {
  const degree = (a - b) * x + b;
  const radian = (degree * Math.PI) / 180;
  return radian <= 1.45 ? radian : 1.45;
}

function calculateRPMAngel(x, a, b) {
  const degree = (a - b) * x + b;
  const radian = (degree * Math.PI) / 180;
  return radian >= -0.46153862656807704 ? radian : -0.46153862656807704;
}

export function drawSpeedo(
  speed = 0,
  gear = 0,
  rpm = 0,
  topSpeed = 160,
  isReverse = false
) {
  //console.log(isReverse);
  ctx.clearRect(0, 0, 500, 500);

  ctx.beginPath();
  ctx.fillStyle = "rgba(0, 0, 0, .9)";
  ctx.arc(250, 250, 240, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 10;
  ctx.arc(250, 250, 100, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.font = "700 70px Open Sans";
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFF";
  ctx.fillText(speed, 250, 220);
  ctx.font = "700 15px Open Sans";
  ctx.fillText("mph", 250, 235);

  if (isReverse && speed > 0) {
    ctx.fillStyle = "#999";
    ctx.font = "700 70px Open Sans";
    ctx.fillText("R", 250, 460);

    ctx.fillStyle = "#333";
    ctx.font = "50px Open Sans";
    ctx.fillText("N", 290, 460);
  } else if (gear == 0 && speed == 0) {
    ctx.fillStyle = "#999";
    ctx.font = "700 70px Open Sans";
    ctx.fillText("N", 250, 460);

    ctx.fillStyle = "#333";
    ctx.font = "700 50px Open Sans";
    ctx.fillText("R", 210, 460);

    ctx.font = "700 50px Open Sans";
    ctx.fillText(parseInt(gear) + 1, 290, 460);
  } else if (gear - 1 <= 0) {
    ctx.fillStyle = "#999";
    ctx.font = "700 70px Open Sans";
    ctx.fillText(gear, 250, 460);

    ctx.fillStyle = "#333";
    ctx.font = "50px Open Sans";
    ctx.fillText("R", 210, 460);

    ctx.font = "700 50px Open Sans";
    ctx.fillText(parseInt(gear) + 1, 290, 460);
  } else {
    ctx.font = "700 70px Open Sans";
    ctx.fillStyle = "#999";
    ctx.fillText(gear, 250, 460);

    ctx.font = "700 50px Open Sans";
    ctx.fillStyle = "#333";
    ctx.fillText(gear - 1, 210, 460);
    if (parseInt(gear) + 1 < 7) {
      ctx.font = "700 50px Open Sans";
      ctx.fillText(parseInt(gear) + 1, 290, 460);
    }
  }

  ctx.fillStyle = "#FFF";
  for (let i = 10; i <= Math.ceil(topSpeed / 20) * 20; i += 10) {
    drawMiniNeedle(
      calculateSpeedAngle(i / topSpeed, 83.07888, 34.3775) * Math.PI,
      i % 20 === 0 ? 3 : 1,
      i % 20 === 0 ? i : ""
    );

    if (i <= 100) {
      drawMiniNeedle(
        calculateSpeedAngle(i / 47, 0, 22.9183) * Math.PI,
        i % 20 === 0 ? 3 : 1,
        i % 20 === 0 ? i / 10 : ""
      );
    }
  }

  ctx.beginPath();
  ctx.strokeStyle = speedGradient;
  ctx.lineWidth = 25;
  ctx.arc(
    250,
    250,
    228,
    0.6 * Math.PI,
    calculateSpeedAngle(speed / topSpeed, 83.07888, 34.3775) * Math.PI
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = rpmGradient;
  ctx.lineWidth = 25;
  ctx.arc(
    250,
    250,
    228,
    0.4 * Math.PI,
    calculateRPMAngel(rpm / 4.7, 0, 22.9183) * Math.PI,
    true
  );
  ctx.stroke();

  ctx.strokeStyle = speedGradient;
  speedNeedle(
    calculateSpeedAngle(speed / topSpeed, 83.07888, 34.3775) * Math.PI
  );

  ctx.strokeStyle = rpmGradient;
  rpmNeedle(calculateRPMAngel(rpm / 4.7, 0, 22.9183) * Math.PI);
}
