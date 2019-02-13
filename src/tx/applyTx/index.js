/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

const { Type } = require('leap-core');
const { checkOutpoints, removeInputs, addOutputs, executeSC } = require('./utils'); // Cryptonian - add executeSC

const checks = {
  [Type.DEPOSIT]: require('./checkDeposit'),    // Cryptonian - 텐더민트에서 app 으로 applyTx 요청이 왔을 때.. (코드체크))
  [Type.EPOCH_LENGTH]: require('./checkEpochLength'),
  [Type.MIN_GAS_PRICE]: require('./checkMinGasPrice'),
  [Type.EXIT]: require('./checkExit'),
  [Type.TRANSFER]: require('./checkTransfer'),
  [Type.VALIDATOR_JOIN]: require('./checkValidatorJoin'),
  [Type.VALIDATOR_LOGOUT]: require('./checkValidatorLogout'),
  //Cryptonian - 타입 추가 (SPEND_COND)
  [Type.SPEND_COND]: require('./checkSpendingCondition'),
};

module.exports = (state, tx, bridgeState) => {
  if (!checks[tx.type]) {
    throw new Error('Unsupported tx type');
  }
  // Cryptonian - SPEND_COND 를 추가하기 위해 그리고 Deposit with State 의 적용여부를 확인하기 위해 이를 체크 해야함
  if (tx.type !== Type.DEPOSIT) {
    checkOutpoints(state, tx);  // input의 prevout.hex() 값이 outpointId로 state.unspent에 존재해야한다!!
                              // [Cryptonian-Problem : Deposit with State 의 경우 적시된 input은 unspent 에 없을텐데..
                              // => 임시 해결책.. 이 함수를 우회한다!!!.. 이게 가능한 이유는 ERC20 의 Deposit은 input이 없기에 체크안할거다..
                              
  }
  checks[tx.type](state, tx, bridgeState);

  removeInputs(state, tx);  // Cryptonian - state의 경우 {unspent, balances, owners} 인데 balances가 NFT를 커버하는지 확인?
  addOutputs(state, tx);

  // Cryptonian - SPEND_COND를 처리하기 위한 함수.
  executeSC(state, tx);
};
