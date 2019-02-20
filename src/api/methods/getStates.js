const { unspentForNST } = require('../../utils');

module.exports = async (bridgeState, address, color) => {
  const { states } = bridgeState.currentState;
  return unspentForNST(states, address, color);
};
