const fs = require('fs').promises;
const { join } = require('path');
global.beforeEach(async () => {
  try {
    await fs.unlink(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {
    console.log('🚀 ~ global.beforeEach ~ error:', error);
  }
});
