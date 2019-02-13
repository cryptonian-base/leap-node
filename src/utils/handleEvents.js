module.exports = handlers => {
  Object.keys(handlers).forEach(key => {
    if (key[0].toUpperCase() !== key[0]) {
      throw new Error('Event name should start with a capital letter');
    }
  });

  return async events => {
    for (const event of events) {
      // istanbul ignore next
      if (event.event === undefined) {
        // Cryptonian - node 실행시 이 에러 발생하는 이유는.. 아마도 abi를 업데이트 안해줘서?! 싱크가 안맞아서 그런듯 - 아 써있네 -_-;
        console.warn('Unknown event. ABI can be outdated'); 
      }

      if (handlers[event.event]) {
        const result = handlers[event.event](event);
        if (result && typeof result.then === 'function') {
          await result; // eslint-disable-line no-await-in-loop
        }
      }
    }
  };
};
