/*jshint esversion: 6 */
let uid = '1212';
let globalBets;
let globalBalance;

document.addEventListener('DOMContentLoaded', init);
// Add event listeners in js instead of as onclick attribute in html
// for security reasons, so user cannot shift the behaviour by changing html
// in dev tools or otherwise
document.querySelector('.bet__decr > button').addEventListener('click', betDecr);
document.querySelector('.bet__incr > button').addEventListener('click', betIncr);
document.querySelector('.controls__spin > button').addEventListener('click', spin);

function init() {
  fetch('https://game-server.kovalevskyi.net/init?uid=' + uid)
    .then(response => response.json())
    .then(json => render(json))
    .catch(error => throwError(error));
}

function render(data) {
  if(Object.entries(data).length != 0) {
    try {
      stopSpin();
    } catch(e) {
      // Kill exception
    }

    // set global variables
    if(!globalBets) {
      globalBets = data.bets;
    }

    globalBalance = data.balance;

    document.querySelector('.balance__current > span:first-child').innerHTML = data.balance;
    document.querySelector('.bet__current > span:first-child').innerHTML = data.last_bet;

    if(data.hasOwnProperty('win') && data['win']) {
      document.querySelector('.controls__win').innerHTML = `Your win is ${data.win}`;
    } else {
      document.querySelector('.controls__win').innerHTML = '';
    }

    if(data.rolls.length) {
      renderReel(data.rolls)
    } else {
      throwError('Empty reel');
    }

    enableButtons();
  } else {
    throwError('Empty JSON');
  }
}

function renderReel(reel) {
  const reelNodes = document.querySelectorAll('.reel__row');

  reelNodes.forEach((node, index) => {
    const reelResult = reel[index]
      .map((elem) => {
        return `<div>${elem}</div>`;
      })
      .join('');

    node.innerHTML = reelResult;
  });
}

function betDecr() {
  betChange('decr');
}

function betIncr() {
  betChange('incr');
}

function betChange(action) {
  const currentBet = getCurrentBet();
  const findBet = globalBets.indexOf(currentBet);
  let newBet;
  if(findBet != -1) {
    let newBetIndex = findBet;

    switch (action) {
      case 'incr':
        newBetIndex = findBet + 1;
        break;
      case 'decr':
        newBetIndex = findBet - 1;
        break;
      default:
        break;
    }

    if(newBetIndex >= 0 && newBetIndex < globalBets.length) {
      newBet = globalBets[newBetIndex];
    } else {
      newBet = currentBet;
    }
  } else {
    newBet = globalBets[0];
  }

  document.querySelector('.bet__current > span:first-child').innerHTML = newBet;
}

function spin() {
  const currentBet = getCurrentBet();
  if(globalBalance >= currentBet) {
    updateBalance(globalBalance - currentBet);
    disableButtons();
    startSpin();
    fetch(`https://game-server.kovalevskyi.net/spin?uid=${uid}&bet=${currentBet}`)
      .then(response => response.json())
      .then(json => render(json))
      .catch(error => throwError(error));
  } else {
    throwError('Not enough money');
  }
}

// Utility functions
function disableButtons() {
  document.querySelectorAll('button').forEach(node => {
    node.disabled = true;
  });
}

function enableButtons() {
  document.querySelectorAll('button').forEach(node => {
    node.disabled = false;
  });
}

function getCurrentBet() {
  return Number(document.querySelector('.bet__current > span:first-child').innerHTML);
}

function startSpin() {
  spinner = setInterval(() => {
    renderReel(getRandomReel());
  }, 300);
}

function stopSpin() {
  clearInterval(spinner);
}

function getRandomReel() {
  let reelArray = [];
  for(i = 0; i < 3; i++) {
    let randArr = [];
    randArr[0] = Math.floor(Math.random() * 9) + 1;
    randArr[1] = Math.floor(Math.random() * 9) + 1;
    randArr[2] = Math.floor(Math.random() * 9) + 1;
    reelArray.push(randArr);
  }

  return reelArray;
}

function throwError(err) {
  alert(err);
}

function updateBalance(bet) {
  document.querySelector('.balance__current > span:first-child').innerHTML = bet;
}
